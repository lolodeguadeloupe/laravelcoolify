<?php

use App\Models\Event;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('displays the home page', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page->component('welcome'));
});

it('shows featured events', function () {
    $user = User::factory()->create();

    $featuredEvent = Event::factory()->create([
        'user_id' => $user->id,
        'status' => 'published',
        'is_featured' => true,
        'starts_at' => now()->addDays(7),
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->has('featuredEvents')
        ->where('featuredEvents.0.id', $featuredEvent->id)
    );
});

it('shows upcoming events', function () {
    $user = User::factory()->create();

    $upcomingEvent = Event::factory()->create([
        'user_id' => $user->id,
        'status' => 'published',
        'is_featured' => false,
        'starts_at' => now()->addDays(3),
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(function (Assert $page) use ($upcomingEvent) {
        $page->component('welcome')->has('upcomingEvents');

        $upcomingEvents = $page->toArray()['props']['upcomingEvents'];
        $ids = array_column($upcomingEvents, 'id');
        expect($ids)->toContain($upcomingEvent->id);
    });
});

it('excludes past events from featured', function () {
    $user = User::factory()->create();

    $pastEvent = Event::factory()->create([
        'user_id' => $user->id,
        'status' => 'published',
        'is_featured' => true,
        'starts_at' => now()->subDays(1),
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(function (Assert $page) use ($pastEvent) {
        $page->component('welcome');

        $featuredEvents = $page->toArray()['props']['featuredEvents'];
        $ids = array_column($featuredEvents, 'id');
        expect($ids)->not->toContain($pastEvent->id);
    });
});

it('excludes unpublished events from featured', function () {
    $user = User::factory()->create();

    $draftEvent = Event::factory()->create([
        'user_id' => $user->id,
        'status' => 'draft',
        'is_featured' => true,
        'starts_at' => now()->addDays(7),
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(function (Assert $page) use ($draftEvent) {
        $page->component('welcome');

        $featuredEvents = $page->toArray()['props']['featuredEvents'];
        $ids = array_column($featuredEvents, 'id');
        expect($ids)->not->toContain($draftEvent->id);
    });
});

it('limits featured events to 6', function () {
    $user = User::factory()->create();

    Event::factory()->count(10)->create([
        'user_id' => $user->id,
        'status' => 'published',
        'is_featured' => true,
        'starts_at' => now()->addDays(7),
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(function (Assert $page) {
        $page->component('welcome');

        $featuredEvents = $page->toArray()['props']['featuredEvents'];
        expect(count($featuredEvents))->toBeLessThanOrEqual(6);
    });
});

it('limits upcoming events to 6', function () {
    $user = User::factory()->create();

    Event::factory()->count(10)->create([
        'user_id' => $user->id,
        'status' => 'published',
        'is_featured' => false,
        'starts_at' => now()->addDays(7),
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(function (Assert $page) {
        $page->component('welcome');

        $upcomingEvents = $page->toArray()['props']['upcomingEvents'];
        expect(count($upcomingEvents))->toBeLessThanOrEqual(6);
    });
});

it('separates featured events from upcoming events', function () {
    $user = User::factory()->create();

    $featuredEvent = Event::factory()->create([
        'user_id' => $user->id,
        'status' => 'published',
        'is_featured' => true,
        'starts_at' => now()->addDays(3),
    ]);

    $upcomingEvent = Event::factory()->create([
        'user_id' => $user->id,
        'status' => 'published',
        'is_featured' => false,
        'starts_at' => now()->addDays(5),
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(function (Assert $page) use ($featuredEvent, $upcomingEvent) {
        $page->component('welcome');

        $props = $page->toArray()['props'];

        $featuredIds = array_column($props['featuredEvents'], 'id');
        $upcomingIds = array_column($props['upcomingEvents'], 'id');

        expect($featuredIds)->toContain($featuredEvent->id);
        expect($upcomingIds)->toContain($upcomingEvent->id);
        expect($upcomingIds)->not->toContain($featuredEvent->id);
    });
});

it('orders events by date ascending', function () {
    $user = User::factory()->create();

    $laterEvent = Event::factory()->create([
        'user_id' => $user->id,
        'status' => 'published',
        'is_featured' => false,
        'starts_at' => now()->addDays(10),
    ]);

    $soonerEvent = Event::factory()->create([
        'user_id' => $user->id,
        'status' => 'published',
        'is_featured' => false,
        'starts_at' => now()->addDays(2),
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(function (Assert $page) use ($soonerEvent, $laterEvent) {
        $page->component('welcome');

        $upcomingEvents = $page->toArray()['props']['upcomingEvents'];
        $ids = array_column($upcomingEvents, 'id');

        // Both events should be present
        expect($ids)->toContain($soonerEvent->id);
        expect($ids)->toContain($laterEvent->id);

        // Sooner event should come before later event
        $soonerIndex = array_search($soonerEvent->id, $ids);
        $laterIndex = array_search($laterEvent->id, $ids);
        expect($soonerIndex)->toBeLessThan($laterIndex);
    });
});
