<?php

use App\Models\Event;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\User;
use App\Services\PaymentService;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->organizer = User::factory()->create(['is_organizer' => true]);
    $this->user = User::factory()->create();
    $this->event = Event::factory()->create([
        'user_id' => $this->organizer->id,
        'status' => 'published',
    ]);
    $this->category = TicketCategory::factory()->create([
        'event_id' => $this->event->id,
        'price' => 2000, // 20€
        'quantity' => 100,
        'quantity_sold' => 0,
        'max_per_order' => 5,
    ]);
});

describe('Checkout Index', function () {
    it('requires authentication', function () {
        $this->get(route('checkout.index'))
            ->assertRedirect(route('login'));
    });

    it('shows checkout page for authenticated user', function () {
        $this->actingAs($this->user)
            ->get(route('checkout.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('checkout/index'));
    });
});

describe('Cart Validation', function () {
    it('validates cart items successfully', function () {
        $this->actingAs($this->user)
            ->postJson(route('checkout.validate'), [
                'items' => [
                    ['category_id' => $this->category->id, 'quantity' => 2],
                ],
            ])
            ->assertOk()
            ->assertJson([
                'valid' => true,
            ])
            ->assertJsonStructure([
                'valid',
                'items',
                'subtotal',
                'service_fees',
                'total',
                'event',
            ]);
    });

    it('calculates service fees correctly', function () {
        $response = $this->actingAs($this->user)
            ->postJson(route('checkout.validate'), [
                'items' => [
                    ['category_id' => $this->category->id, 'quantity' => 2],
                ],
            ])
            ->assertOk();

        $data = $response->json();
        $subtotal = 4000; // 2 * 2000
        $expectedFees = (int) round($subtotal * 0.05) + 50; // 5% + 0.50€

        expect($data['subtotal'])->toBe($subtotal);
        expect($data['service_fees'])->toBe($expectedFees);
        expect($data['total'])->toBe($subtotal + $expectedFees);
    });

    it('fails when quantity exceeds available stock', function () {
        $this->category->update(['quantity' => 5, 'quantity_sold' => 4]);

        $this->actingAs($this->user)
            ->postJson(route('checkout.validate'), [
                'items' => [
                    ['category_id' => $this->category->id, 'quantity' => 3],
                ],
            ])
            ->assertUnprocessable()
            ->assertJson([
                'valid' => false,
            ]);
    });

    it('fails when quantity exceeds max per order', function () {
        $this->actingAs($this->user)
            ->postJson(route('checkout.validate'), [
                'items' => [
                    ['category_id' => $this->category->id, 'quantity' => 10],
                ],
            ])
            ->assertUnprocessable()
            ->assertJson([
                'valid' => false,
            ]);
    });

    it('fails when event is not published', function () {
        $this->event->update(['status' => 'draft']);

        $this->actingAs($this->user)
            ->postJson(route('checkout.validate'), [
                'items' => [
                    ['category_id' => $this->category->id, 'quantity' => 1],
                ],
            ])
            ->assertUnprocessable()
            ->assertJson([
                'valid' => false,
            ]);
    });

    it('fails with invalid category id', function () {
        $this->actingAs($this->user)
            ->postJson(route('checkout.validate'), [
                'items' => [
                    ['category_id' => 99999, 'quantity' => 1],
                ],
            ])
            ->assertUnprocessable();
    });

    it('requires items array', function () {
        $this->actingAs($this->user)
            ->postJson(route('checkout.validate'), [])
            ->assertUnprocessable();
    });
});

describe('Checkout Session', function () {
    it('requires authentication', function () {
        $this->postJson(route('checkout.session'), [
            'event_id' => $this->event->id,
            'items' => [
                ['category_id' => $this->category->id, 'quantity' => 1],
            ],
        ])->assertUnauthorized();
    });

    it('validates event exists', function () {
        $this->actingAs($this->user)
            ->postJson(route('checkout.session'), [
                'event_id' => 99999,
                'items' => [
                    ['category_id' => $this->category->id, 'quantity' => 1],
                ],
            ])
            ->assertUnprocessable();
    });

    it('validates items are required', function () {
        $this->actingAs($this->user)
            ->postJson(route('checkout.session'), [
                'event_id' => $this->event->id,
                'items' => [],
            ])
            ->assertUnprocessable();
    });
});

describe('Checkout Success Page', function () {
    it('redirects to home without session_id', function () {
        $this->actingAs($this->user)
            ->get(route('checkout.success'))
            ->assertRedirect(route('home'));
    });

    it('shows pending state when order not found', function () {
        $this->actingAs($this->user)
            ->get(route('checkout.success', ['session_id' => 'cs_test_123']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('checkout/success')
                ->where('pending', true)
                ->where('session_id', 'cs_test_123')
            );
    });

    it('shows order details when order exists', function () {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'event_id' => $this->event->id,
            'stripe_session_id' => 'cs_test_existing',
            'status' => 'paid',
        ]);

        Ticket::factory()->create([
            'order_id' => $order->id,
            'ticket_category_id' => $this->category->id,
        ]);

        $this->actingAs($this->user)
            ->get(route('checkout.success', ['session_id' => 'cs_test_existing']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('checkout/success')
                ->where('pending', false)
                ->has('order')
            );
    });
});

describe('Checkout Cancel Page', function () {
    it('shows cancel page', function () {
        $this->actingAs($this->user)
            ->get(route('checkout.cancel'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('checkout/cancel'));
    });
});

describe('Payment Service', function () {
    it('calculates fees correctly', function () {
        $service = new PaymentService;

        expect($service->calculateFees(0))->toBe(0);
        expect($service->calculateFees(1000))->toBe(100); // 5% of 1000 = 50 + 50 = 100
        expect($service->calculateFees(10000))->toBe(550); // 5% of 10000 = 500 + 50 = 550
    });

    it('generates unique order references', function () {
        $service = new PaymentService;

        $reflection = new ReflectionClass($service);
        $method = $reflection->getMethod('generateReference');
        $method->setAccessible(true);

        $ref1 = $method->invoke($service);
        $ref2 = $method->invoke($service);

        expect($ref1)->toStartWith('EC-');
        expect($ref2)->toStartWith('EC-');
        expect(strlen($ref1))->toBe(11);
        expect($ref1)->not->toBe($ref2);
    });

    it('generates valid QR codes', function () {
        $service = new PaymentService;

        $reflection = new ReflectionClass($service);
        $method = $reflection->getMethod('generateQRCode');
        $method->setAccessible(true);

        $uuid = 'test-uuid-123';
        $qrCode = $method->invoke($service, $uuid);

        expect($qrCode)->toContain($uuid);
        expect($qrCode)->toContain(':');
    });
});

describe('Stripe Webhook', function () {
    it('rejects invalid signatures', function () {
        $this->postJson(route('webhook.stripe'), [], [
            'Stripe-Signature' => 'invalid',
        ])->assertStatus(400);
    });
});
