<?php

use App\Models\Event;
use App\Models\TicketCategory;
use App\Models\User;

beforeEach(function () {
    $this->organizer = User::factory()->organizer()->create();
    $this->event = Event::factory()->create(['user_id' => $this->organizer->id]);
});

describe('Ticket Category CRUD', function () {
    test('organizer can view ticket categories index', function () {
        TicketCategory::factory()->count(3)->create(['event_id' => $this->event->id]);

        $this->actingAs($this->organizer)
            ->get("/organizer/events/{$this->event->id}/ticket-categories")
            ->assertStatus(200);
    });

    test('organizer can view create form', function () {
        $this->actingAs($this->organizer)
            ->get("/organizer/events/{$this->event->id}/ticket-categories/create")
            ->assertStatus(200);
    });

    test('organizer can create ticket category', function () {
        $this->actingAs($this->organizer)
            ->post("/organizer/events/{$this->event->id}/ticket-categories", [
                'name' => 'Standard',
                'description' => 'Place standard',
                'price' => 2500,
                'quantity' => 100,
                'max_per_order' => 10,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('ticket_categories', [
            'event_id' => $this->event->id,
            'name' => 'Standard',
            'price' => 2500,
        ]);
    });

    test('organizer can edit ticket category', function () {
        $category = TicketCategory::factory()->create(['event_id' => $this->event->id]);

        $this->actingAs($this->organizer)
            ->get("/organizer/events/{$this->event->id}/ticket-categories/{$category->id}/edit")
            ->assertStatus(200);
    });

    test('organizer can update ticket category', function () {
        $category = TicketCategory::factory()->create(['event_id' => $this->event->id]);

        $this->actingAs($this->organizer)
            ->put("/organizer/events/{$this->event->id}/ticket-categories/{$category->id}", [
                'name' => 'VIP Updated',
                'price' => 5000,
                'quantity' => 50,
                'max_per_order' => 5,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('ticket_categories', [
            'id' => $category->id,
            'name' => 'VIP Updated',
            'price' => 5000,
        ]);
    });

    test('organizer can delete ticket category without sales', function () {
        $category = TicketCategory::factory()->create([
            'event_id' => $this->event->id,
            'quantity_sold' => 0,
        ]);

        $this->actingAs($this->organizer)
            ->delete("/organizer/events/{$this->event->id}/ticket-categories/{$category->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('ticket_categories', ['id' => $category->id]);
    });

    test('organizer cannot delete ticket category with sales', function () {
        $category = TicketCategory::factory()->create([
            'event_id' => $this->event->id,
            'quantity_sold' => 5,
        ]);

        $this->actingAs($this->organizer)
            ->delete("/organizer/events/{$this->event->id}/ticket-categories/{$category->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('ticket_categories', ['id' => $category->id]);
    });

    test('cannot set quantity below sold amount', function () {
        $category = TicketCategory::factory()->create([
            'event_id' => $this->event->id,
            'quantity' => 100,
            'quantity_sold' => 50,
        ]);

        $this->actingAs($this->organizer)
            ->put("/organizer/events/{$this->event->id}/ticket-categories/{$category->id}", [
                'name' => $category->name,
                'price' => $category->price,
                'quantity' => 30,
                'max_per_order' => 10,
            ])
            ->assertSessionHasErrors('quantity');
    });
});

describe('Authorization', function () {
    test('other organizer cannot access ticket categories', function () {
        $otherOrganizer = User::factory()->organizer()->create();

        $this->actingAs($otherOrganizer)
            ->get("/organizer/events/{$this->event->id}/ticket-categories")
            ->assertStatus(403);
    });

    test('non-organizer cannot access ticket categories', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get("/organizer/events/{$this->event->id}/ticket-categories")
            ->assertStatus(403);
    });

    test('guest cannot access ticket categories', function () {
        $this->get("/organizer/events/{$this->event->id}/ticket-categories")
            ->assertRedirect('/login');
    });
});
