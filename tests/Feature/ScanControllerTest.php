<?php

use App\Models\Event;
use App\Models\User;

it('shows scan index for organizer', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create([
        'starts_at' => now()->addDay(),
    ]);

    $this->actingAs($user)
        ->get('/organizer/scan')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('scan/index')
            ->has('events', 1)
            ->has('events.0', fn ($event) => $event
                ->has('id')
                ->has('title')
                ->has('slug')
                ->has('starts_at')
                ->has('location')
                ->has('city')
            )
        );
});

it('filters only active events for scanning', function () {
    $user = User::factory()->organizer()->create();

    // Événement passé (il y a 2 jours) - ne doit PAS apparaître
    Event::factory()->for($user)->published()->create([
        'starts_at' => now()->subDays(2),
    ]);

    // Événement hier (dans la marge de 1 jour) - doit apparaître
    Event::factory()->for($user)->published()->create([
        'starts_at' => now()->subHours(12),
    ]);

    // Événement futur - doit apparaître
    Event::factory()->for($user)->published()->create([
        'starts_at' => now()->addDay(),
    ]);

    // Événement draft - ne doit PAS apparaître
    Event::factory()->for($user)->draft()->create([
        'starts_at' => now()->addDay(),
    ]);

    $this->actingAs($user)
        ->get('/organizer/scan')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('events', 2) // Seulement les 2 événements actifs publiés
        );
});

it('denies scan access to non-organizer', function () {
    $user = User::factory()->create(['is_organizer' => false]);

    $this->actingAs($user)
        ->get('/organizer/scan')
        ->assertForbidden();
});

it('denies scan access to guest', function () {
    $this->get('/organizer/scan')
        ->assertRedirect('/login');
});

it('passes selected event id from query param', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create([
        'starts_at' => now()->addDay(),
    ]);

    $this->actingAs($user)
        ->get('/organizer/scan?event='.$event->id)
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('selectedEventId', (string) $event->id)
        );
});

// S7.3: Résultat du scan - Tests de validation

it('validates a valid ticket and marks as used', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();
    $order = \App\Models\Order::factory()->for($user)->for($event)->paid()->create();
    $ticket = \App\Models\Ticket::factory()->for($order)->create();

    $qrCode = $ticket->qr_code; // Format: uuid:hmac

    $response = $this->actingAs($user)
        ->postJson('/organizer/scan/validate', [
            'qr_code' => $qrCode,
            'event_id' => $event->id,
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'valid',
            'message' => 'Billet valide ! Entrée autorisée.',
            'ticket' => [
                'uuid' => $ticket->uuid,
                'category' => $ticket->ticketCategory->name,
                'event' => $event->title,
            ],
        ]);

    // Vérifier que le billet est marqué comme utilisé
    expect($ticket->fresh()->status)->toBe('used');
    expect($ticket->fresh()->scanned_at)->not->toBeNull();
});

it('returns already_used status for previously scanned ticket', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();
    $order = \App\Models\Order::factory()->for($user)->for($event)->paid()->create();
    $ticket = \App\Models\Ticket::factory()->for($order)->used()->create([
        'scanned_at' => now()->subHours(2),
    ]);

    $response = $this->actingAs($user)
        ->postJson('/organizer/scan/validate', [
            'qr_code' => $ticket->qr_code,
            'event_id' => $event->id,
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'already_used',
            'message' => 'Ce billet a déjà été utilisé.',
        ])
        ->assertJsonPath('ticket.uuid', $ticket->uuid)
        ->assertJsonPath('scanned_at', fn ($value) => !is_null($value));
});

it('returns invalid status for cancelled ticket', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();
    $order = \App\Models\Order::factory()->for($user)->for($event)->paid()->create();
    $ticket = \App\Models\Ticket::factory()->for($order)->cancelled()->create();

    $response = $this->actingAs($user)
        ->postJson('/organizer/scan/validate', [
            'qr_code' => $ticket->qr_code,
            'event_id' => $event->id,
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'invalid',
            'message' => 'Ce billet a été annulé.',
        ]);
});

it('returns invalid status for wrong event', function () {
    $user = User::factory()->organizer()->create();
    $event1 = Event::factory()->for($user)->published()->create(['title' => 'Concert Rock']);
    $event2 = Event::factory()->for($user)->published()->create(['title' => 'Festival Jazz']);
    $order = \App\Models\Order::factory()->for($user)->for($event1)->paid()->create();
    $ticket = \App\Models\Ticket::factory()->for($order)->create();

    $response = $this->actingAs($user)
        ->postJson('/organizer/scan/validate', [
            'qr_code' => $ticket->qr_code,
            'event_id' => $event2->id, // Mauvais événement
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'invalid',
            'message' => "Ce billet n'est pas pour cet événement.",
        ])
        ->assertJsonPath('expected_event', 'Concert Rock');
});

it('returns invalid status for non-existent ticket', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();

    // QR code avec UUID inexistant mais HMAC valide
    $uuid = \Illuminate\Support\Str::uuid()->toString();
    $hmac = substr(hash_hmac('sha256', $uuid, config('app.key')), 0, 16);
    $qrCode = $uuid.':'.$hmac;

    $response = $this->actingAs($user)
        ->postJson('/organizer/scan/validate', [
            'qr_code' => $qrCode,
            'event_id' => $event->id,
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'invalid',
            'message' => 'Billet introuvable.',
        ]);
});

it('returns invalid status for malformed qr code', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();

    $response = $this->actingAs($user)
        ->postJson('/organizer/scan/validate', [
            'qr_code' => 'invalid-format-without-colon',
            'event_id' => $event->id,
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'invalid',
            'message' => 'Format QR code invalide.',
        ]);
});

// S7.4: Mode offline - Tests

it('returns offline data for event', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();
    $order = \App\Models\Order::factory()->for($user)->for($event)->paid()->create();

    // Créer plusieurs tickets
    $tickets = \App\Models\Ticket::factory()->for($order)->count(3)->create();

    $response = $this->actingAs($user)
        ->getJson("/organizer/scan/{$event->id}/offline-data");

    $response->assertStatus(200)
        ->assertJson([
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
            ],
        ])
        ->assertJsonCount(3, 'tickets')
        ->assertJsonStructure([
            'event',
            'tickets' => [
                '*' => ['id', 'uuid', 'qr_code', 'status', 'scanned_at', 'category_id'],
            ],
            'categories',
            'generated_at',
        ]);
});

it('includes only valid and used tickets in offline data', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();
    $order = \App\Models\Order::factory()->for($user)->for($event)->paid()->create();

    \App\Models\Ticket::factory()->for($order)->create(['status' => 'valid']);
    \App\Models\Ticket::factory()->for($order)->used()->create();
    \App\Models\Ticket::factory()->for($order)->cancelled()->create(); // Ne doit PAS être inclus
    \App\Models\Ticket::factory()->for($order)->refunded()->create(); // Ne doit PAS être inclus

    $response = $this->actingAs($user)
        ->getJson("/organizer/scan/{$event->id}/offline-data");

    $response->assertStatus(200)
        ->assertJsonCount(2, 'tickets'); // Seulement valid et used
});

it('syncs offline scans successfully', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();
    $order = \App\Models\Order::factory()->for($user)->for($event)->paid()->create();

    // Créer des tickets valides
    $tickets = \App\Models\Ticket::factory()->for($order)->count(2)->create();

    $scansData = $tickets->map(fn ($ticket) => [
        'ticket_id' => $ticket->id,
        'scanned_at' => now()->toIso8601String(),
    ])->toArray();

    $response = $this->actingAs($user)
        ->postJson("/organizer/scan/{$event->id}/sync", [
            'scans' => $scansData,
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'synced' => 2,
            'message' => '2 scan(s) synchronisé(s).',
        ]);

    // Vérifier que les tickets sont marqués comme utilisés
    foreach ($tickets as $ticket) {
        expect($ticket->fresh()->status)->toBe('used');
        expect($ticket->fresh()->scanned_at)->not->toBeNull();
    }

    // Vérifier que les scans ont été créés
    expect(\App\Models\Scan::where('event_id', $event->id)->count())->toBe(2);
});

it('only syncs valid tickets during offline sync', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();
    $order = \App\Models\Order::factory()->for($user)->for($event)->paid()->create();

    $validTicket = \App\Models\Ticket::factory()->for($order)->create();
    $usedTicket = \App\Models\Ticket::factory()->for($order)->used()->create();

    $scansData = [
        ['ticket_id' => $validTicket->id, 'scanned_at' => now()->toIso8601String()],
        ['ticket_id' => $usedTicket->id, 'scanned_at' => now()->toIso8601String()], // Déjà utilisé
    ];

    $response = $this->actingAs($user)
        ->postJson("/organizer/scan/{$event->id}/sync", [
            'scans' => $scansData,
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'synced' => 1, // Seulement le ticket valide
        ]);

    expect($validTicket->fresh()->status)->toBe('used');
    expect($usedTicket->fresh()->status)->toBe('used'); // Déjà utilisé avant
});

// S7.5: Liste des scans - Tests

it('returns scan history for event', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();
    $order = \App\Models\Order::factory()->for($user)->for($event)->paid()->create();

    // Créer quelques scans
    $tickets = \App\Models\Ticket::factory()->for($order)->count(3)->create();

    foreach ($tickets as $ticket) {
        \App\Models\Scan::create([
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'scanned_by' => $user->id,
            'scanned_at' => now()->subMinutes(rand(1, 60)),
            'result' => 'success',
        ]);
    }

    $response = $this->actingAs($user)
        ->getJson("/organizer/scan/{$event->id}/history");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'scans' => [
                '*' => ['id', 'scanned_at', 'result', 'category', 'holder'],
            ],
            'stats' => ['total_scanned', 'total_tickets'],
        ])
        ->assertJsonCount(3, 'scans')
        ->assertJsonPath('stats.total_scanned', 3)
        ->assertJsonPath('stats.total_tickets', 3);
});

it('returns empty history for event with no scans', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();

    $response = $this->actingAs($user)
        ->getJson("/organizer/scan/{$event->id}/history");

    $response->assertStatus(200)
        ->assertJson([
            'scans' => [],
            'stats' => [
                'total_scanned' => 0,
                'total_tickets' => 0,
            ],
        ]);
});

it('denies history access to non-organizer', function () {
    $user = User::factory()->create(['is_organizer' => false]);
    $event = Event::factory()->published()->create();

    $this->actingAs($user)
        ->getJson("/organizer/scan/{$event->id}/history")
        ->assertForbidden();
});

it('denies history access to guest', function () {
    $event = Event::factory()->published()->create();

    $this->getJson("/organizer/scan/{$event->id}/history")
        ->assertUnauthorized();
});

it('orders scans by most recent first', function () {
    $user = User::factory()->organizer()->create();
    $event = Event::factory()->for($user)->published()->create();
    $order = \App\Models\Order::factory()->for($user)->for($event)->paid()->create();
    $tickets = \App\Models\Ticket::factory()->for($order)->count(3)->create();

    // Créer des scans à différents moments et stocker les IDs
    $scanOld = \App\Models\Scan::create([
        'ticket_id' => $tickets[0]->id,
        'event_id' => $event->id,
        'scanned_by' => $user->id,
        'scanned_at' => now()->subMinutes(60),
        'result' => 'success',
    ]);

    $scanNew = \App\Models\Scan::create([
        'ticket_id' => $tickets[1]->id,
        'event_id' => $event->id,
        'scanned_by' => $user->id,
        'scanned_at' => now()->subMinutes(10),
        'result' => 'success',
    ]);

    $scanMid = \App\Models\Scan::create([
        'ticket_id' => $tickets[2]->id,
        'event_id' => $event->id,
        'scanned_by' => $user->id,
        'scanned_at' => now()->subMinutes(30),
        'result' => 'success',
    ]);

    $response = $this->actingAs($user)
        ->getJson("/organizer/scan/{$event->id}/history");

    $response->assertStatus(200);

    $scans = $response->json('scans');

    // Vérifier l'ordre : le plus récent en premier
    expect($scans[0]['id'])->toBe($scanNew->id); // Il y a 10 min
    expect($scans[1]['id'])->toBe($scanMid->id); // Il y a 30 min
    expect($scans[2]['id'])->toBe($scanOld->id); // Il y a 60 min
});
