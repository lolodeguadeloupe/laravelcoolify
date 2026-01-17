<?php

use App\Models\Event;
use App\Models\TicketCategory;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('events index', function () {
    it('displays the events index page', function () {
        $response = $this->get('/events');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page->component('events/index'));
    });

    it('only shows published events', function () {
        $publishedEvent = Event::factory()->published()->create();
        $draftEvent = Event::factory()->draft()->create();
        $cancelledEvent = Event::factory()->cancelled()->create();

        $response = $this->get('/events');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('events/index')
            ->has('events.data', 1)
            ->where('events.data.0.id', $publishedEvent->id)
        );
    });

    it('only shows future events', function () {
        $futureEvent = Event::factory()->published()->create([
            'starts_at' => now()->addWeek(),
        ]);
        $pastEvent = Event::factory()->published()->past()->create();

        $response = $this->get('/events');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('events.data', 1)
            ->where('events.data.0.id', $futureEvent->id)
        );
    });

    it('orders events by start date', function () {
        $laterEvent = Event::factory()->published()->create([
            'starts_at' => now()->addMonths(2),
        ]);
        $soonerEvent = Event::factory()->published()->create([
            'starts_at' => now()->addWeek(),
        ]);

        $response = $this->get('/events');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('events.data', 2)
            ->where('events.data.0.id', $soonerEvent->id)
            ->where('events.data.1.id', $laterEvent->id)
        );
    });

    it('paginates events', function () {
        Event::factory()->published()->count(15)->create([
            'starts_at' => now()->addWeek(),
        ]);

        $response = $this->get('/events');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('events.data', 12)
            ->where('events.last_page', 2)
        );
    });

    it('can search events by title', function () {
        $matchingEvent = Event::factory()->published()->create([
            'title' => 'Concert Rock Festival',
            'starts_at' => now()->addWeek(),
        ]);
        $nonMatchingEvent = Event::factory()->published()->create([
            'title' => 'Jazz Night',
            'starts_at' => now()->addWeek(),
        ]);

        $response = $this->get('/events?search=rock');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('events.data', 1)
            ->where('events.data.0.id', $matchingEvent->id)
        );
    });

    it('can search events by city', function () {
        $parisEvent = Event::factory()->published()->create([
            'city' => 'Paris',
            'starts_at' => now()->addWeek(),
        ]);
        $lyonEvent = Event::factory()->published()->create([
            'city' => 'Lyon',
            'starts_at' => now()->addWeek(),
        ]);

        $response = $this->get('/events?search=paris');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('events.data', 1)
            ->where('events.data.0.id', $parisEvent->id)
        );
    });

    it('loads ticket categories with events', function () {
        $event = Event::factory()->published()->create([
            'starts_at' => now()->addWeek(),
        ]);
        TicketCategory::factory()->for($event)->create(['price' => 1000]);
        TicketCategory::factory()->for($event)->create(['price' => 2000]);

        $response = $this->get('/events');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('events.data.0.ticket_categories', 2)
        );
    });
});

describe('events show', function () {
    it('displays the event detail page', function () {
        $event = Event::factory()->published()->create();

        $response = $this->get("/events/{$event->slug}");

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('events/show')
            ->has('event')
            ->where('event.id', $event->id)
        );
    });

    it('returns 404 for non-existent event', function () {
        $response = $this->get('/events/non-existent-slug');

        $response->assertNotFound();
    });

    it('returns 404 for draft events', function () {
        $event = Event::factory()->draft()->create();

        $response = $this->get("/events/{$event->slug}");

        $response->assertNotFound();
    });

    it('returns 404 for cancelled events', function () {
        $event = Event::factory()->cancelled()->create();

        $response = $this->get("/events/{$event->slug}");

        $response->assertNotFound();
    });

    it('loads ticket categories ordered by sort_order', function () {
        $event = Event::factory()->published()->create();
        $vipCategory = TicketCategory::factory()->for($event)->create([
            'name' => 'VIP',
            'sort_order' => 1,
        ]);
        $standardCategory = TicketCategory::factory()->for($event)->create([
            'name' => 'Standard',
            'sort_order' => 0,
        ]);

        $response = $this->get("/events/{$event->slug}");

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('event.ticket_categories', 2)
            ->where('event.ticket_categories.0.id', $standardCategory->id)
            ->where('event.ticket_categories.1.id', $vipCategory->id)
        );
    });
});
