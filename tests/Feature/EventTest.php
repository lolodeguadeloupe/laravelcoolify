<?php

use App\Models\Event;
use App\Models\User;

beforeEach(function () {
    $this->organizer = User::factory()->organizer()->create();
    $this->user = User::factory()->create();
});

describe('Organizer Event Management', function () {
    test('organizer can view events index', function () {
        $this->actingAs($this->organizer)
            ->get('/organizer/events')
            ->assertStatus(200);
    });

    test('non-organizer cannot access organizer routes', function () {
        $this->actingAs($this->user)
            ->get('/organizer/events')
            ->assertStatus(403);
    });

    test('guest cannot access organizer routes', function () {
        $this->get('/organizer/events')
            ->assertRedirect('/login');
    });

    test('organizer can create event', function () {
        $this->actingAs($this->organizer)
            ->get('/organizer/events/create')
            ->assertStatus(200);
    });

    test('organizer can store event', function () {
        $eventData = [
            'title' => 'Test Event',
            'description' => 'Test description',
            'starts_at' => now()->addWeek()->format('Y-m-d H:i:s'),
            'location' => 'Test Location',
            'city' => 'Paris',
        ];

        $this->actingAs($this->organizer)
            ->post('/organizer/events', $eventData)
            ->assertRedirect();

        $this->assertDatabaseHas('events', [
            'title' => 'Test Event',
            'user_id' => $this->organizer->id,
        ]);
    });

    test('organizer can view own event', function () {
        $event = Event::factory()->create(['user_id' => $this->organizer->id]);

        $this->actingAs($this->organizer)
            ->get("/organizer/events/{$event->id}")
            ->assertStatus(200);
    });

    test('organizer cannot view other organizer event', function () {
        $otherOrganizer = User::factory()->organizer()->create();
        $event = Event::factory()->create(['user_id' => $otherOrganizer->id]);

        $this->actingAs($this->organizer)
            ->get("/organizer/events/{$event->id}")
            ->assertStatus(403);
    });

    test('organizer can edit own event', function () {
        $event = Event::factory()->create(['user_id' => $this->organizer->id]);

        $this->actingAs($this->organizer)
            ->get("/organizer/events/{$event->id}/edit")
            ->assertStatus(200);
    });

    test('organizer can update own event', function () {
        $event = Event::factory()->create(['user_id' => $this->organizer->id]);

        $this->actingAs($this->organizer)
            ->put("/organizer/events/{$event->id}", [
                'title' => 'Updated Title',
                'description' => 'Updated description',
                'starts_at' => now()->addWeek()->format('Y-m-d H:i:s'),
                'location' => 'Updated Location',
                'city' => 'Lyon',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Title',
        ]);
    });

    test('organizer can delete draft event', function () {
        $event = Event::factory()->draft()->create(['user_id' => $this->organizer->id]);

        $this->actingAs($this->organizer)
            ->delete("/organizer/events/{$event->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    });

    test('organizer cannot delete published event', function () {
        $event = Event::factory()->published()->create(['user_id' => $this->organizer->id]);

        $this->actingAs($this->organizer)
            ->delete("/organizer/events/{$event->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('events', ['id' => $event->id]);
    });

    test('organizer can publish draft event', function () {
        $event = Event::factory()->draft()->create(['user_id' => $this->organizer->id]);

        $this->actingAs($this->organizer)
            ->post("/organizer/events/{$event->id}/publish")
            ->assertRedirect();

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'status' => 'published',
        ]);
    });

    test('organizer can cancel published event', function () {
        $event = Event::factory()->published()->create(['user_id' => $this->organizer->id]);

        $this->actingAs($this->organizer)
            ->post("/organizer/events/{$event->id}/cancel")
            ->assertRedirect();

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'status' => 'cancelled',
        ]);
    });
});

describe('Public Event Catalogue', function () {
    test('anyone can view published events', function () {
        Event::factory()->published()->count(3)->create();
        Event::factory()->draft()->count(2)->create();

        $this->get('/events')
            ->assertStatus(200);
    });

    test('anyone can view single published event', function () {
        $event = Event::factory()->published()->create();

        $this->get("/events/{$event->slug}")
            ->assertStatus(200);
    });

    test('draft event is not accessible publicly', function () {
        $event = Event::factory()->draft()->create();

        $this->get("/events/{$event->slug}")
            ->assertStatus(404);
    });
});
