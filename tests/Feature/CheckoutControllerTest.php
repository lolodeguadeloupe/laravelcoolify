<?php

use App\Models\Event;
use App\Models\TicketCategory;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('checkout index', function () {
    it('requires authentication', function () {
        $response = $this->get('/checkout');

        $response->assertRedirect('/login');
    });

    it('displays the checkout page for authenticated users', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/checkout');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page->component('checkout/index'));
    });
});

describe('checkout validation', function () {
    it('requires authentication', function () {
        $response = $this->postJson('/checkout/validate', [
            'items' => [],
        ]);

        $response->assertUnauthorized();
    });

    it('validates that items array is required', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/checkout/validate', []);

        $response->assertStatus(422);
        $response->assertJson(['valid' => false]);
    });

    it('validates that items must contain valid category ids', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/checkout/validate', [
            'items' => [
                ['category_id' => 99999, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(422);
    });

    it('validates cart with valid items', function () {
        $user = User::factory()->create();
        $event = Event::factory()->published()->create();
        $category = TicketCategory::factory()->for($event)->create([
            'price' => 1000,
            'quantity' => 100,
            'quantity_sold' => 0,
        ]);

        $response = $this->actingAs($user)->postJson('/checkout/validate', [
            'items' => [
                ['category_id' => $category->id, 'quantity' => 2],
            ],
        ]);

        $response->assertSuccessful();
        $response->assertJson([
            'valid' => true,
            'subtotal' => 2000,
            'service_fees' => 150, // 2000 * 0.05 + 50
            'total' => 2150,
        ]);
    });

    it('rejects items when stock is insufficient', function () {
        $user = User::factory()->create();
        $event = Event::factory()->published()->create();
        $category = TicketCategory::factory()->for($event)->create([
            'quantity' => 5,
            'quantity_sold' => 4,
        ]);

        $response = $this->actingAs($user)->postJson('/checkout/validate', [
            'items' => [
                ['category_id' => $category->id, 'quantity' => 3],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJson(['valid' => false]);
    });

    it('rejects items when quantity exceeds max per order', function () {
        $user = User::factory()->create();
        $event = Event::factory()->published()->create();
        $category = TicketCategory::factory()->for($event)->create([
            'quantity' => 100,
            'max_per_order' => 5,
        ]);

        $response = $this->actingAs($user)->postJson('/checkout/validate', [
            'items' => [
                ['category_id' => $category->id, 'quantity' => 8],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJson(['valid' => false]);
    });

    it('rejects items for unpublished events', function () {
        $user = User::factory()->create();
        $event = Event::factory()->draft()->create();
        $category = TicketCategory::factory()->for($event)->create();

        $response = $this->actingAs($user)->postJson('/checkout/validate', [
            'items' => [
                ['category_id' => $category->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJson(['valid' => false]);
    });

    it('calculates service fees correctly', function () {
        $user = User::factory()->create();
        $event = Event::factory()->published()->create();
        $category = TicketCategory::factory()->for($event)->create([
            'price' => 5000, // 50€
            'quantity' => 100,
        ]);

        $response = $this->actingAs($user)->postJson('/checkout/validate', [
            'items' => [
                ['category_id' => $category->id, 'quantity' => 2],
            ],
        ]);

        $response->assertSuccessful();
        // Subtotal: 10000 (100€)
        // Fees: 10000 * 0.05 + 50 = 550 (5.50€)
        // Total: 10550 (105.50€)
        $response->assertJson([
            'subtotal' => 10000,
            'service_fees' => 550,
            'total' => 10550,
        ]);
    });
});

describe('checkout session creation', function () {
    it('requires authentication', function () {
        $response = $this->postJson('/checkout/session', [
            'event_id' => 1,
            'items' => [],
        ]);

        $response->assertUnauthorized();
    });

    it('validates required fields', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/checkout/session', []);

        $response->assertStatus(422);
    });

    it('validates event must exist', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/checkout/session', [
            'event_id' => 99999,
            'items' => [
                ['category_id' => 1, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(422);
    });
});

describe('checkout success page', function () {
    it('redirects when no session_id is provided', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/checkout/success');

        $response->assertRedirect('/');
    });

    it('shows pending state when order not yet processed', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/checkout/success?session_id=cs_test_fake123');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('checkout/success')
            ->where('pending', true)
            ->where('session_id', 'cs_test_fake123')
        );
    });

    it('shows order details when order exists', function () {
        $user = User::factory()->create();
        $event = Event::factory()->published()->create();
        $category = TicketCategory::factory()->for($event)->create([
            'price' => 2500,
        ]);

        $order = \App\Models\Order::factory()->for($user)->for($event)->create([
            'stripe_session_id' => 'cs_test_existing123',
            'status' => 'paid',
            'reference' => 'EC-TESTREF1',
            'total' => 2500,
            'fees' => 175,
        ]);

        \App\Models\Ticket::factory()->for($order)->for($category)->create();

        $response = $this->actingAs($user)->get('/checkout/success?session_id=cs_test_existing123');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('checkout/success')
            ->where('pending', false)
            ->has('order')
            ->where('order.reference', 'EC-TESTREF1')
        );
    });
});

describe('checkout cancel page', function () {
    it('requires authentication', function () {
        $response = $this->get('/checkout/cancel');

        $response->assertRedirect('/login');
    });

    it('displays the cancel page for authenticated users', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/checkout/cancel');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page->component('checkout/cancel'));
    });
});
