# Project Context - Event Cool

_Ce fichier complète CLAUDE.md avec les règles spécifiques à Event Cool. Les agents IA doivent lire les deux fichiers._

---

## Project Overview

**Event Cool** - Plateforme de billetterie en ligne (PWA) pour le marché français.

| Aspect | Valeur |
|--------|--------|
| Type | Full-stack PWA |
| Marché | France |
| Conformité | RGPD + PCI-DSS (via Stripe) |
| Multi-tenant | Oui (organisateurs isolés) |

---

## Architecture Decisions

### Database Schema

```
users ──< events ──< ticket_categories
  │         │              │
  └── orders ──< tickets <─┘
  │         │
  └── staff ─┘
         └──< scans
```

**Tables principales:**
- `events` - Événements (title, description, date, location, image, user_id)
- `ticket_categories` - Catégories (name, price, quantity, event_id)
- `tickets` - Billets (uuid, qr_code, status, ticket_category_id, order_id)
- `orders` - Commandes (total, stripe_session_id, user_id, event_id)
- `staff` - Pivot users-events pour le staff de scan
- `scans` - Historique des scans (ticket_id, staff_id, scanned_at)

### QR Code Security

```php
// Format: {ticket_uuid}:{hmac_signature}
$signature = hash_hmac('sha256', $uuid . $event_id . $ticket_id, config('app.key'));
$qrContent = "{$uuid}:{$signature}";
```

### Services Architecture

| Service | Responsabilité |
|---------|----------------|
| `TicketService` | Génération billets, validation QR |
| `PaymentService` | Stripe Checkout, webhooks |
| `QRCodeService` | HMAC signature, génération QR |
| `StatsService` | Agrégations dashboard organisateur |

---

## Backend Patterns

### Controllers

```php
// Organisateur namespace
app/Http/Controllers/Organizer/EventController.php
app/Http/Controllers/Organizer/DashboardController.php
app/Http/Controllers/Organizer/StaffController.php

// Scan API (JSON, pas Inertia)
app/Http/Controllers/Scan/ScanController.php
app/Http/Controllers/Scan/SyncController.php
```

### Form Requests

```php
// Naming: Store*Request, Update*Request
app/Http/Requests/StoreEventRequest.php
app/Http/Requests/UpdateEventRequest.php
app/Http/Requests/CheckoutRequest.php
```

### Jobs (Queue)

```php
// Jobs pour opérations async
app/Jobs/SendTicketEmail.php
app/Jobs/GenerateTicketPDF.php
app/Jobs/SyncOfflineScans.php
```

### Policies

```php
// Authorization granulaire
app/Policies/EventPolicy.php   // Organisateur peut modifier son event
app/Policies/TicketPolicy.php  // Acheteur peut voir son billet
app/Policies/StaffPolicy.php   // Staff autorisé pour l'event
```

### Custom Exceptions

```php
app/Exceptions/TicketAlreadyScannedException.php
app/Exceptions/TicketInvalidException.php
app/Exceptions/EventSoldOutException.php
```

---

## Frontend Patterns

### React Contexts (pas Redux)

```typescript
// resources/js/contexts/
AuthContext.tsx   // user, rôle, permissions
CartContext.tsx   // billets sélectionnés pour checkout
ScanContext.tsx   // mode scan, billets cachés, offline status
```

### Hooks

```typescript
// resources/js/hooks/
useAuth.ts          // Accès AuthContext
useCart.ts          // Accès CartContext
useScan.ts          // Accès ScanContext
useOfflineSync.ts   // IndexedDB sync logic
```

### Components Structure

```
resources/js/components/
├── ui/                    # shadcn/ui primitives (ne pas modifier)
└── features/
    ├── events/            # EventCard, EventList, EventFilters
    ├── tickets/           # TicketCard, TicketQR, TicketDownload
    ├── checkout/          # CartSummary, CategorySelector
    ├── scan/              # QRScanner, ScanResult, OfflineIndicator
    └── organizer/         # EventForm, StatsCard, StaffList
```

### Pages Structure

```
resources/js/pages/
├── events/
│   ├── Index.tsx          # Catalogue public (SSR pour SEO)
│   └── Show.tsx           # Détail event + sélection billets
├── tickets/
│   ├── Index.tsx          # Mes billets (acheteur)
│   └── Show.tsx           # Détail billet + QR
├── checkout/
│   ├── Index.tsx          # Panier
│   └── Success.tsx        # Confirmation post-Stripe
├── organizer/
│   ├── Dashboard.tsx      # Stats organisateur
│   ├── events/            # CRUD events organisateur
│   └── staff/             # Gestion staff
└── scan/
    ├── Index.tsx          # Sélection event à scanner
    └── Event.tsx          # Scanner QR actif
```

---

## PWA & Offline

### IndexedDB Schema

```typescript
// resources/js/lib/db.ts (using 'idb' package)

interface TicketRecord {
  event_id: number;
  ticket_uuid: string;
  signature: string;
  status: 'valid' | 'used' | 'cancelled';
  scanned_at?: string;
}

interface PendingScan {
  id: string;
  ticket_uuid: string;
  scanned_at: string;
  synced: boolean;
}

interface SyncMetadata {
  event_id: number;
  last_sync: string;
  ticket_count: number;
}
```

### Offline Scan Flow

1. Organisateur ouvre `/scan/{eventId}`
2. Pre-download tous les billets → IndexedDB
3. Scan fonctionne sans réseau (validation locale)
4. Scans stockés dans `pending_scans`
5. Sync automatique quand réseau revient

### Service Worker

```typescript
// vite.config.ts - vite-plugin-pwa
// Stratégie: NetworkFirst pour API, CacheFirst pour assets
```

---

## API Endpoints

### Inertia Routes (SSR)

| Route | Controller | Description |
|-------|------------|-------------|
| `GET /events` | EventController@index | Catalogue public |
| `GET /events/{id}` | EventController@show | Détail event |
| `GET /tickets` | TicketController@index | Mes billets |
| `POST /checkout` | CheckoutController@store | Initier paiement |

### JSON API (hors Inertia)

| Route | Controller | Description |
|-------|------------|-------------|
| `GET /api/scan/sync/{event}` | SyncController@sync | Download billets |
| `POST /api/scan/validate` | ScanController@validate | Valider scan |
| `POST /api/webhooks/stripe` | StripeWebhookController | Webhook Stripe |

### API Response Format

```json
// Succès
{ "success": true, "data": { ... } }

// Erreur
{ "success": false, "error": { "code": "TICKET_INVALID", "message": "..." } }
```

---

## Integrations

### Stripe Checkout

```php
// PaymentService.php
// Utiliser Stripe Checkout (hosted) - pas d'éléments custom
$session = \Stripe\Checkout\Session::create([
    'payment_method_types' => ['card'],
    'line_items' => [...],
    'mode' => 'payment',
    'success_url' => route('checkout.success'),
    'cancel_url' => route('checkout.cancel'),
]);
```

### Resend (Email)

```php
// config/mail.php - MAIL_MAILER=resend
// Utiliser les Jobs pour envoi async
SendTicketEmail::dispatch($ticket);
```

---

## Anti-Patterns

### Backend

```php
// ❌ NE PAS faire
public function store(Request $request) {
    $validated = $request->validate([...]); // Inline validation
    // Logique métier directe dans controller
}

// ✅ FAIRE
public function store(StoreEventRequest $request) {
    return $this->eventService->create($request->validated());
}
```

### Frontend

```typescript
// ❌ NE PAS faire
const [globalState, setGlobalState] = useState(); // État global avec useState
import styled from 'styled-components'; // styled-components

// ✅ FAIRE
const { user } = useAuth(); // React Context
className="flex items-center" // Tailwind
```

### Database

```php
// ❌ NE PAS faire
DB::table('events')->get(); // Raw queries

// ✅ FAIRE
Event::query()->with('categories')->get(); // Eloquent avec eager loading
```

---

## Testing Patterns

### Feature Tests

```php
// tests/Feature/Events/EventCreationTest.php
it('creates an event as organizer', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post('/organizer/events', [
            'title' => 'Concert Test',
            'date' => now()->addMonth(),
        ]);

    $response->assertRedirect();
    expect(Event::where('title', 'Concert Test')->exists())->toBeTrue();
});
```

### Unit Tests

```php
// tests/Unit/QRCodeServiceTest.php
it('generates valid HMAC signature', function () {
    $service = new QRCodeService();
    $qrCode = $service->generate($ticket);

    expect($service->validate($qrCode))->toBeTrue();
});
```

---

## Implementation Priority

1. **Redis setup** - docker-compose.yml (sessions, cache, queues)
2. **Migrations** - events, ticket_categories, tickets, orders, staff, scans
3. **Auth + rôles** - Fortify + middleware organisateur/staff
4. **CRUD événements** - Organisateur dashboard
5. **Stripe integration** - Checkout + webhooks
6. **QR generation + email** - Jobs async
7. **PWA + offline scan** - Service Worker + IndexedDB
