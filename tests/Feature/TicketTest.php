<?php

use App\Models\Event;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\User;

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
    ]);
    $this->order = Order::factory()->paid()->create([
        'user_id' => $this->user->id,
        'event_id' => $this->event->id,
    ]);
    $this->ticket = Ticket::factory()->create([
        'order_id' => $this->order->id,
        'ticket_category_id' => $this->category->id,
    ]);
});

describe('Tickets Index', function () {
    it('requires authentication', function () {
        $this->get(route('tickets.index'))
            ->assertRedirect(route('login'));
    });

    it('shows user tickets grouped by event', function () {
        $this->actingAs($this->user)
            ->get(route('tickets.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('tickets/index')
                ->has('ticketGroups', 1)
            );
    });

    it('does not show other users tickets', function () {
        $otherUser = User::factory()->create();

        $this->actingAs($otherUser)
            ->get(route('tickets.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('tickets/index')
                ->has('ticketGroups', 0)
            );
    });

    it('separates past and upcoming events', function () {
        $pastEvent = Event::factory()->create([
            'user_id' => $this->organizer->id,
            'status' => 'published',
            'starts_at' => now()->subWeek(),
        ]);
        $pastCategory = TicketCategory::factory()->create(['event_id' => $pastEvent->id]);
        $pastOrder = Order::factory()->paid()->create([
            'user_id' => $this->user->id,
            'event_id' => $pastEvent->id,
        ]);
        Ticket::factory()->create([
            'order_id' => $pastOrder->id,
            'ticket_category_id' => $pastCategory->id,
        ]);

        $this->actingAs($this->user)
            ->get(route('tickets.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('ticketGroups', 2)
            );
    });
});

describe('Ticket Show', function () {
    it('requires authentication', function () {
        $this->get(route('tickets.show', $this->ticket->uuid))
            ->assertRedirect(route('login'));
    });

    it('shows ticket details to owner', function () {
        $this->actingAs($this->user)
            ->get(route('tickets.show', $this->ticket->uuid))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('tickets/show')
                ->has('ticket')
                ->where('ticket.uuid', $this->ticket->uuid)
            );
    });

    it('denies access to other users', function () {
        $otherUser = User::factory()->create();

        $this->actingAs($otherUser)
            ->get(route('tickets.show', $this->ticket->uuid))
            ->assertForbidden();
    });

    it('allows organizer to view ticket', function () {
        $this->actingAs($this->organizer)
            ->get(route('tickets.show', $this->ticket->uuid))
            ->assertOk();
    });

    it('returns 404 for non-existent ticket', function () {
        $nonExistentUuid = '00000000-0000-0000-0000-000000000000';

        $this->actingAs($this->user)
            ->get(route('tickets.show', $nonExistentUuid))
            ->assertNotFound();
    });
});

describe('Ticket PDF Download', function () {
    it('requires authentication', function () {
        $this->get(route('tickets.pdf', $this->ticket->uuid))
            ->assertRedirect(route('login'));
    });

    it('downloads PDF for ticket owner', function () {
        $this->actingAs($this->user)
            ->get(route('tickets.pdf', $this->ticket->uuid))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    });

    it('denies PDF download to other users', function () {
        $otherUser = User::factory()->create();

        $this->actingAs($otherUser)
            ->get(route('tickets.pdf', $this->ticket->uuid))
            ->assertForbidden();
    });
});

describe('Ticket Resend Email', function () {
    it('requires authentication', function () {
        $this->postJson(route('tickets.resend', $this->ticket->uuid))
            ->assertUnauthorized();
    });

    it('resends email for ticket owner', function () {
        $this->actingAs($this->user)
            ->postJson(route('tickets.resend', $this->ticket->uuid))
            ->assertOk()
            ->assertJson([
                'message' => 'Email envoyé avec succès.',
            ]);
    });

    it('denies resend to other users', function () {
        $otherUser = User::factory()->create();

        $this->actingAs($otherUser)
            ->postJson(route('tickets.resend', $this->ticket->uuid))
            ->assertForbidden();
    });

    it('rate limits resend requests', function () {
        $this->actingAs($this->user);

        // First 3 requests should succeed
        for ($i = 0; $i < 3; $i++) {
            $this->postJson(route('tickets.resend', $this->ticket->uuid))
                ->assertOk();
        }

        // 4th request should be rate limited
        $this->postJson(route('tickets.resend', $this->ticket->uuid))
            ->assertStatus(429);
    });
});

describe('Ticket Recovery (Guest)', function () {
    it('shows recovery page', function () {
        $this->get(route('tickets.recover'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('tickets/recover'));
    });

    it('finds ticket by email and reference', function () {
        $this->postJson(route('tickets.find'), [
            'email' => $this->user->email,
            'reference' => $this->order->reference,
        ])
            ->assertOk()
            ->assertJson([
                'found' => true,
            ])
            ->assertJsonStructure([
                'found',
                'order' => [
                    'reference',
                    'event',
                    'tickets',
                ],
            ]);
    });

    it('returns not found for invalid credentials', function () {
        $this->postJson(route('tickets.find'), [
            'email' => 'wrong@email.com',
            'reference' => $this->order->reference,
        ])
            ->assertNotFound()
            ->assertJson([
                'found' => false,
            ]);
    });

    it('returns not found for invalid reference', function () {
        $this->postJson(route('tickets.find'), [
            'email' => $this->user->email,
            'reference' => 'EC-INVALID',
        ])
            ->assertNotFound()
            ->assertJson([
                'found' => false,
            ]);
    });

    it('validates required fields', function () {
        $this->postJson(route('tickets.find'), [])
            ->assertUnprocessable();
    });

    it('validates email format', function () {
        $this->postJson(route('tickets.find'), [
            'email' => 'not-an-email',
            'reference' => 'EC-12345678',
        ])
            ->assertUnprocessable();
    });
});
