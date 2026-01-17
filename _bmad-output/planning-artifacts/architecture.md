---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ["prd.md", "product-brief-event-cool.md"]
workflowType: 'architecture'
project_name: 'Event Cool'
user_name: 'Laurent'
date: '2026-01-15'
status: 'complete'
completedAt: '2026-01-15'
---

# Architecture Decision Document - Event Cool

_Ce document se construit collaborativement à travers une découverte étape par étape. Les sections sont ajoutées au fur et à mesure que nous travaillons ensemble sur chaque décision architecturale._

## 1. Project Context Analysis

### Requirements Overview

**Functional Requirements (37 FRs):**

| Capability Area | Nb FRs | Implications Architecturales |
|-----------------|--------|------------------------------|
| Gestion Comptes | 5 | Auth system, sessions, rôles (acheteur/organisateur) |
| Catalogue Événements | 4 | API publique, recherche, SEO (SSR) |
| Achat Billets | 6 | Checkout flow, intégration Stripe, transactions |
| Gestion Billets | 5 | Génération QR, PDF, envoi emails |
| Gestion Événements | 8 | CRUD, upload images, catégories, jauges |
| Dashboard Orga | 4 | Stats, agrégations, queries optimisées |
| Scan & Contrôle | 5 | PWA offline, IndexedDB, sync |

**Non-Functional Requirements:**

| NFR | Cible | Impact Architecture |
|-----|-------|---------------------|
| API Response | < 300ms | Cache, optimisation queries |
| Mode Offline | Illimité | Service Worker, IndexedDB, sync strategy |
| Uptime | 99.5% | Infrastructure robuste, monitoring |
| Concurrence | 100 users | Stateless, sessions DB/Redis |
| Scans/heure | 1000/event | Cache billets, validation rapide |

### Scale & Complexity

- **Primary domain:** Full-stack PWA
- **Complexity level:** Medium
- **Real-time:** Non (MVP) - polling suffisant
- **Multi-tenancy:** Oui (organisateurs isolés)
- **Compliance:** RGPD + PCI-DSS (délégué Stripe)

### Technical Constraints & Dependencies

| Contrainte | Décision |
|------------|----------|
| Stack | Laravel 12 + React 19 + Inertia.js |
| Database | PostgreSQL |
| Paiement | Stripe Checkout (hosted) |
| PWA | Service Worker + IndexedDB |
| Design | Mobile-first responsive |

### Cross-Cutting Concerns

| Concern | Stratégie |
|---------|-----------|
| Authentication | Laravel Fortify + sessions |
| Authorization | Policies + Gates Laravel |
| Offline Sync | Background sync API |
| Performance | Cache, lazy loading |
| SEO | SSR via Inertia |
| RGPD | Consentement, suppression, export |

## 2. Starter Template Evaluation

### Primary Technology Domain

Full-stack PWA avec Laravel + React + Inertia.js (déjà en place)

### Selected Starter: Laravel React Starter Kit (Inertia.js)

**Rationale:** Projet existant utilise déjà ce starter. Configuration optimale pour les besoins d'Event Cool.

**Initialization Command (déjà exécuté):**
```bash
composer create-project laravel/laravel --prefer-dist
php artisan breeze:install react --typescript --ssr
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- PHP 8.3+ (Laravel 12)
- TypeScript strict mode (React 19)
- Node.js 20+ (Vite)

**Styling Solution:**
- Tailwind CSS v4
- shadcn/ui (Radix primitives)
- CSS-in-JS non utilisé

**Build Tooling:**
- Vite (fast HMR, optimized builds)
- SSR capable via Inertia

**Testing Framework:**
- Pest (PHP) - configuré
- Vitest (JS) - à ajouter si besoin

**Code Organization:**
- Laravel MVC (app/Http/Controllers, app/Models)
- React pages (resources/js/pages)
- Components (resources/js/components)

**Development Experience:**
- Laravel Sail (Docker)
- Hot reload via Vite
- Path alias @/* → resources/js/*

### Packages à Ajouter pour Event Cool

| Package | Usage | Priorité |
|---------|-------|----------|
| `vite-plugin-pwa` | PWA + Service Worker | MVP |
| `laravel/cashier` ou Stripe API | Paiements | MVP |
| `simplesoftwareio/simple-qrcode` | Génération QR | MVP |
| `html5-qrcode` (npm) | Scan QR côté client | MVP |
| `barryvdh/laravel-dompdf` | Génération PDF billets | MVP |
| `idb` (npm) | IndexedDB wrapper | MVP |

## 3. Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Bloquent l'implémentation) :**
- Cache Strategy : Redis
- Offline Strategy : Pre-download
- QR Security : UUID + HMAC
- State Management : React Context
- Email Service : Resend

**Deferred Decisions (Post-MVP) :**
- WebSocket pour stats temps réel (Phase 2)
- WhatsApp integration (Phase 2)
- Multi-langue (Phase 3)

### Data Architecture

| Décision | Choix | Rationale |
|----------|-------|-----------|
| **Database** | PostgreSQL 17 | Robuste, JSON support |
| **Cache** | Redis | Sessions + cache + queues unifié |
| **ORM** | Eloquent | Standard Laravel |

**Redis Usage:**
- Sessions (session:*)
- Cache applicatif (cache:events:*, cache:stats:*)
- Rate limiting (cache:throttle:*)
- Queues (emails, pdf-generation)

### Authentication & Security

| Décision | Choix |
|----------|-------|
| **Auth** | Laravel Fortify |
| **Sessions** | Redis-backed |
| **Password** | bcrypt (12 rounds) |
| **CSRF** | Laravel default |
| **Rate Limiting** | Redis throttle |

**QR Code Security (UUID + HMAC):**
```
Format: {ticket_uuid}:{hmac_signature}
Signature: HMAC-SHA256(uuid + event_id + ticket_id, APP_KEY)
```

### API & Communication

| Décision | Choix |
|----------|-------|
| **API Style** | Inertia (hybrid) |
| **Validation** | Laravel Form Requests |
| **Error Handling** | Laravel exceptions |

**Endpoints JSON (hors Inertia):**
- POST /api/scan/validate
- GET /api/scan/sync/{event}
- POST /api/webhooks/stripe

### Frontend Architecture

| Décision | Choix |
|----------|-------|
| **State** | React Context |
| **Routing** | Inertia router |
| **Forms** | React Hook Form |
| **UI** | shadcn/ui |

**Contexts:**
- AuthContext (user, rôle, permissions)
- ScanContext (mode scan, billets cachés, offline status)
- CartContext (billets sélectionnés)

### PWA & Offline Strategy

| Décision | Choix |
|----------|-------|
| **PWA Plugin** | vite-plugin-pwa |
| **Offline Data** | IndexedDB (idb) |
| **Sync Strategy** | Pre-download |
| **Service Worker** | Workbox |

**Offline Flow:**
1. Organisateur ouvre mode scan
2. Download tous les billets → IndexedDB
3. Scan fonctionne sans réseau
4. Scans stockés localement
5. Sync automatique quand réseau revient

**IndexedDB Schema:**
- tickets (event_id, ticket_uuid, signature, status, scanned_at)
- pending_scans (id, ticket_uuid, scanned_at, synced)
- sync_metadata (event_id, last_sync, ticket_count)

### Infrastructure & Deployment

| Décision | Choix |
|----------|-------|
| **Hosting** | Coolify |
| **Email** | Resend |
| **Storage** | Local (S3 future) |
| **Monitoring** | Laravel Telescope (dev) |

### Implementation Sequence

1. Redis setup
2. Modèles de données (migrations)
3. Auth + rôles
4. CRUD événements
5. Stripe integration
6. QR generation + email
7. PWA + offline scan

## 4. Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Points de Conflit Identifiés:** 12 zones où les agents IA pourraient faire des choix différents.

### Naming Patterns

**Database Naming Conventions:**

| Element | Convention | Exemple |
|---------|------------|---------|
| Tables | snake_case pluriel | `users`, `events`, `ticket_categories` |
| Colonnes | snake_case | `user_id`, `created_at`, `ticket_uuid` |
| Foreign keys | `{table_singulier}_id` | `event_id`, `user_id` |
| Index | `{table}_{columns}_index` | `tickets_event_id_index` |
| Pivot tables | alphabétique singulier | `event_user`, `role_user` |

**API Naming Conventions:**

| Element | Convention | Exemple |
|---------|------------|---------|
| Routes Inertia | kebab-case | `/events`, `/my-tickets` |
| Route params | camelCase | `/events/{eventId}` |
| Query params | snake_case | `?start_date=2026-01-15` |
| API endpoints | pluriel REST | `/api/scan/tickets` |

**Code Naming Conventions:**

| Element | Convention | Exemple |
|---------|------------|---------|
| Controllers | PascalCase + Controller | `EventController`, `TicketController` |
| Models | PascalCase singulier | `Event`, `Ticket`, `TicketCategory` |
| React Components | PascalCase | `EventCard.tsx`, `TicketScanner.tsx` |
| React Hooks | camelCase + use | `useAuth`, `useScanContext` |
| CSS classes | Tailwind utilities | `className="flex items-center"` |
| TypeScript interfaces | PascalCase + Props/Data | `EventCardProps`, `TicketData` |

### Structure Patterns

**Project Organization:**

```
Backend (Laravel MVC):
app/
├── Http/Controllers/     → Contrôleurs par domaine
├── Models/               → Eloquent models
├── Services/             → Business logic
├── Policies/             → Authorization
└── Jobs/                 → Queue jobs (emails, PDF)

Frontend (React Feature-based):
resources/js/
├── pages/               → Inertia pages
├── components/
│   ├── ui/              → shadcn primitives
│   └── features/        → Composants métier
├── contexts/            → React Contexts
├── hooks/               → Custom hooks
└── lib/                 → Utilitaires
```

**File Structure Patterns:**

| Type | Location | Naming |
|------|----------|--------|
| Migrations | `database/migrations/` | `YYYY_MM_DD_HHMMSS_action_table.php` |
| Tests PHP | `tests/Feature/`, `tests/Unit/` | `*Test.php` |
| Form Requests | `app/Http/Requests/` | `Store*Request`, `Update*Request` |
| React pages | `resources/js/pages/` | `PascalCase.tsx` |

### Format Patterns

**API Response Formats (Inertia):**

```typescript
// Succès : données passées directement en props
Inertia::render('Events/Show', [
    'event' => $event,
    'tickets' => $tickets
]);

// Erreurs : flash session
return back()->withErrors(['email' => 'Invalid email']);
```

**API JSON (hors Inertia):**

```json
// Succès
{ "success": true, "data": { ... } }

// Erreur
{ "success": false, "error": { "code": "TICKET_INVALID", "message": "..." } }
```

**Date Formats:**

| Context | Format |
|---------|--------|
| Database | `YYYY-MM-DD HH:MM:SS` (timestamp) |
| API JSON | ISO 8601 (`2026-01-15T14:30:00Z`) |
| UI Display | Localisé FR (`15 janvier 2026`) |

### Communication Patterns

**Laravel Events:**

```php
// Naming: PascalCase verbe passé
TicketPurchased::class
TicketScanned::class
EventCreated::class

// Payload: modèle complet
new TicketPurchased($ticket, $user);
```

**React Context Patterns:**

```typescript
// Context naming
AuthContext, ScanContext, CartContext

// Provider wrapping
<AuthProvider>
  <ScanProvider>
    <App />
  </ScanProvider>
</AuthProvider>

// Hook access
const { user, isOrganizer } = useAuth();
const { isOffline, pendingScans } = useScan();
```

### Process Patterns

**Error Handling:**

```php
// Laravel: Exceptions custom
throw new TicketAlreadyScannedException();
throw new EventSoldOutException();

// Handler global: app/Exceptions/Handler.php
```

```typescript
// React: Error boundaries par feature
<ErrorBoundary fallback={<ScanError />}>
  <TicketScanner />
</ErrorBoundary>
```

**Loading State Patterns:**

```typescript
// Inertia: useForm pour loading
const { processing } = useForm();

// État local pour async
const [isLoading, setIsLoading] = useState(false);

// Naming convention
isLoading, isSyncing, isScanning
```

### Enforcement Guidelines

**Tous les agents IA DOIVENT:**

1. Suivre les conventions Laravel pour le backend (PSR-12, snake_case DB)
2. Utiliser TypeScript strict mode pour React
3. Appliquer les patterns shadcn/ui pour tous les composants UI
4. Respecter la structure feature-based pour les composants métier
5. Valider via Form Requests côté Laravel
6. Utiliser React Context pour l'état partagé (pas Redux)

**Pattern Enforcement:**

- ESLint + Prettier configurés dans le projet
- Pest pour tests PHP avec conventions Laravel
- TypeScript strict mode activé
- Pre-commit hooks recommandés (Husky)

### Pattern Examples

**Good Examples:**

```php
// Controller bien nommé
class EventController extends Controller
{
    public function show(Event $event): Response
    {
        return Inertia::render('Events/Show', [
            'event' => $event->load('categories'),
        ]);
    }
}
```

```typescript
// Component bien structuré
export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold">{event.title}</h3>
    </Card>
  );
}
```

**Anti-Patterns:**

```php
// ❌ Mauvais: logique métier dans controller
public function store(Request $request) {
    // Validation inline au lieu de Form Request
    $validated = $request->validate([...]);
    // Logique métier directement ici
}
```

```typescript
// ❌ Mauvais: état global avec useState au lieu de Context
// ❌ Mauvais: styled-components au lieu de Tailwind
// ❌ Mauvais: any au lieu de types stricts
```

## 5. Project Structure & Boundaries

### Complete Project Directory Structure

```
laravelcoolify/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                    # Fortify controllers
│   │   │   │   ├── AuthenticatedSessionController.php
│   │   │   │   ├── RegisteredUserController.php
│   │   │   │   └── PasswordResetController.php
│   │   │   ├── EventController.php       # CRUD événements public
│   │   │   ├── TicketController.php      # Billets acheteur
│   │   │   ├── CheckoutController.php    # Flow achat
│   │   │   ├── Organizer/
│   │   │   │   ├── EventController.php   # CRUD événements orga
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── StaffController.php   # Gestion staff
│   │   │   │   └── TicketCategoryController.php
│   │   │   ├── Scan/
│   │   │   │   ├── ScanController.php    # Page scan PWA
│   │   │   │   └── SyncController.php    # API sync offline
│   │   │   └── Webhook/
│   │   │       └── StripeWebhookController.php
│   │   ├── Requests/
│   │   │   ├── StoreEventRequest.php
│   │   │   ├── UpdateEventRequest.php
│   │   │   ├── StoreTicketCategoryRequest.php
│   │   │   └── CheckoutRequest.php
│   │   └── Middleware/
│   │       ├── EnsureUserIsOrganizer.php
│   │       └── EnsureUserIsStaff.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Event.php
│   │   ├── TicketCategory.php
│   │   ├── Ticket.php
│   │   ├── Order.php
│   │   ├── Staff.php                     # Pivot user-event pour staff
│   │   └── Scan.php                      # Historique scans
│   ├── Services/
│   │   ├── TicketService.php             # Génération QR, validation
│   │   ├── PaymentService.php            # Stripe integration
│   │   ├── QRCodeService.php             # HMAC signature
│   │   └── StatsService.php              # Agrégations dashboard
│   ├── Jobs/
│   │   ├── SendTicketEmail.php
│   │   ├── GenerateTicketPDF.php
│   │   └── SyncOfflineScans.php
│   ├── Events/
│   │   ├── TicketPurchased.php
│   │   ├── TicketScanned.php
│   │   └── EventCreated.php
│   ├── Listeners/
│   │   └── SendTicketNotification.php
│   ├── Policies/
│   │   ├── EventPolicy.php
│   │   ├── TicketPolicy.php
│   │   └── StaffPolicy.php
│   └── Exceptions/
│       ├── TicketAlreadyScannedException.php
│       ├── TicketInvalidException.php
│       └── EventSoldOutException.php
│
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 2026_01_20_000001_create_events_table.php
│   │   ├── 2026_01_20_000002_create_ticket_categories_table.php
│   │   ├── 2026_01_20_000003_create_orders_table.php
│   │   ├── 2026_01_20_000004_create_tickets_table.php
│   │   ├── 2026_01_20_000005_create_staff_table.php
│   │   └── 2026_01_20_000006_create_scans_table.php
│   ├── factories/
│   │   ├── EventFactory.php
│   │   ├── TicketFactory.php
│   │   └── OrderFactory.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── DemoEventSeeder.php
│
├── resources/
│   ├── js/
│   │   ├── app.tsx                       # Entry point Inertia
│   │   ├── ssr.tsx                       # SSR entry
│   │   ├── types/
│   │   │   ├── index.d.ts
│   │   │   ├── event.ts                  # Event, TicketCategory types
│   │   │   ├── ticket.ts                 # Ticket, Order types
│   │   │   └── user.ts                   # User, Auth types
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── CartContext.tsx           # Panier achat
│   │   │   └── ScanContext.tsx           # Mode scan offline
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCart.ts
│   │   │   ├── useScan.ts
│   │   │   └── useOfflineSync.ts         # IndexedDB sync
│   │   ├── lib/
│   │   │   ├── utils.ts
│   │   │   ├── db.ts                     # IndexedDB (idb)
│   │   │   └── qr-scanner.ts             # html5-qrcode wrapper
│   │   ├── components/
│   │   │   ├── ui/                       # shadcn/ui primitives
│   │   │   └── features/
│   │   │       ├── events/
│   │   │       │   ├── EventCard.tsx
│   │   │       │   ├── EventList.tsx
│   │   │       │   └── EventFilters.tsx
│   │   │       ├── tickets/
│   │   │       │   ├── TicketCard.tsx
│   │   │       │   ├── TicketQR.tsx
│   │   │       │   └── TicketDownload.tsx
│   │   │       ├── checkout/
│   │   │       │   ├── CartSummary.tsx
│   │   │       │   ├── CategorySelector.tsx
│   │   │       │   └── CheckoutForm.tsx
│   │   │       ├── scan/
│   │   │       │   ├── QRScanner.tsx
│   │   │       │   ├── ScanResult.tsx
│   │   │       │   ├── OfflineIndicator.tsx
│   │   │       │   └── SyncStatus.tsx
│   │   │       └── organizer/
│   │   │           ├── EventForm.tsx
│   │   │           ├── StatsCard.tsx
│   │   │           └── StaffList.tsx
│   │   ├── layouts/
│   │   │   ├── AppLayout.tsx             # Layout principal
│   │   │   ├── AuthLayout.tsx            # Pages auth
│   │   │   ├── OrganizerLayout.tsx       # Dashboard orga
│   │   │   └── ScanLayout.tsx            # Mode scan PWA
│   │   └── pages/
│   │       ├── Welcome.tsx               # Landing page
│   │       ├── auth/
│   │       │   ├── Login.tsx
│   │       │   ├── Register.tsx
│   │       │   └── ForgotPassword.tsx
│   │       ├── events/
│   │       │   ├── Index.tsx             # Catalogue public
│   │       │   └── Show.tsx              # Détail + achat
│   │       ├── tickets/
│   │       │   ├── Index.tsx             # Mes billets
│   │       │   └── Show.tsx              # Détail billet + QR
│   │       ├── checkout/
│   │       │   ├── Index.tsx             # Panier
│   │       │   └── Success.tsx           # Confirmation
│   │       ├── organizer/
│   │       │   ├── Dashboard.tsx
│   │       │   ├── events/
│   │       │   │   ├── Index.tsx         # Liste mes events
│   │       │   │   ├── Create.tsx
│   │       │   │   ├── Edit.tsx
│   │       │   │   └── Show.tsx          # Stats event
│   │       │   └── staff/
│   │       │       └── Index.tsx         # Gestion staff
│   │       ├── scan/
│   │       │   ├── Index.tsx             # Sélection event
│   │       │   └── Event.tsx             # Scanner actif
│   │       └── settings/
│   │           └── Profile.tsx
│   ├── css/
│   │   └── app.css                       # Tailwind v4
│   └── views/
│       ├── app.blade.php                 # Shell Inertia
│       └── emails/
│           └── ticket-purchased.blade.php
│
├── routes/
│   ├── web.php                           # Routes Inertia principales
│   ├── auth.php                          # Routes auth (Fortify)
│   ├── api.php                           # API JSON (scan sync)
│   └── channels.php                      # Broadcasting (future)
│
├── tests/
│   ├── Feature/
│   │   ├── Auth/
│   │   │   └── RegistrationTest.php
│   │   ├── Events/
│   │   │   ├── EventCreationTest.php
│   │   │   └── EventListingTest.php
│   │   ├── Checkout/
│   │   │   └── PurchaseFlowTest.php
│   │   └── Scan/
│   │       ├── TicketValidationTest.php
│   │       └── OfflineSyncTest.php
│   └── Unit/
│       ├── QRCodeServiceTest.php
│       └── TicketServiceTest.php
│
├── public/
│   ├── images/
│   │   └── events/                       # Uploads événements
│   ├── sw.js                             # Service Worker (generated)
│   └── manifest.webmanifest              # PWA manifest
│
├── config/
│   ├── services.php                      # Stripe, Resend keys
│   └── pwa.php                           # Config vite-plugin-pwa
│
├── storage/
│   └── app/
│       └── tickets/                      # PDFs générés
│
├── docker-compose.yml                    # PostgreSQL + Redis
├── vite.config.ts                        # + vite-plugin-pwa
├── tailwind.config.js
├── components.json                       # shadcn config
├── tsconfig.json
└── phpunit.xml
```

### Architectural Boundaries

**API Boundaries:**

| Boundary | Type | Routes |
|----------|------|--------|
| Public | Inertia SSR | `/`, `/events`, `/events/{id}` |
| Authenticated | Inertia | `/tickets`, `/checkout`, `/settings` |
| Organizer | Inertia + Policy | `/organizer/*` |
| Scan API | JSON REST | `/api/scan/*` |
| Webhooks | JSON | `/api/webhooks/stripe` |

**Data Boundaries:**

```
┌─────────────────────────────────────────────────┐
│                   PostgreSQL                     │
│  users ──< events ──< ticket_categories          │
│    │         │              │                    │
│    └── orders ──< tickets <─┘                    │
│    │         │                                   │
│    └── staff ─┘                                  │
│              └──< scans                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                     Redis                        │
│  sessions:* | cache:events:* | queues:default   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│               IndexedDB (Client)                 │
│  tickets | pending_scans | sync_metadata        │
└─────────────────────────────────────────────────┘
```

### Requirements to Structure Mapping

| FR Category | Backend Files | Frontend Files |
|-------------|---------------|----------------|
| Gestion Comptes | `Auth/*Controller.php`, `User.php` | `pages/auth/*`, `pages/settings/*` |
| Catalogue Événements | `EventController.php`, `Event.php` | `pages/events/*`, `features/events/*` |
| Achat Billets | `CheckoutController.php`, `PaymentService.php` | `pages/checkout/*`, `features/checkout/*` |
| Gestion Billets | `TicketController.php`, `Jobs/*` | `pages/tickets/*`, `features/tickets/*` |
| Gestion Événements | `Organizer/EventController.php` | `pages/organizer/events/*` |
| Dashboard Orga | `Organizer/DashboardController.php`, `StatsService.php` | `pages/organizer/Dashboard.tsx` |
| Scan & Contrôle | `Scan/*Controller.php`, `QRCodeService.php` | `pages/scan/*`, `features/scan/*` |

### Integration Points

**External Integrations:**

| Service | Integration Point | Files |
|---------|-------------------|-------|
| Stripe | Checkout Session + Webhooks | `PaymentService.php`, `StripeWebhookController.php` |
| Resend | Email via Laravel Mail | `config/mail.php`, `Jobs/SendTicketEmail.php` |

**Internal Communication:**

```
Controller → Service → Repository (Model)
     ↓
  Inertia Props → React Page → Context/Hooks
     ↓
  IndexedDB ←→ Service Worker ←→ API Sync
```

**Data Flow:**

```
1. Achat: React Form → Inertia → CheckoutController → Stripe → Webhook → Job → Email
2. Scan: QRScanner → IndexedDB check → API validate → Update local DB → Sync queue
```

## 6. Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
Toutes les technologies choisies sont compatibles et fonctionnent ensemble sans conflit :
- Laravel 12 + PHP 8.3 ↔ PostgreSQL 17 + Redis
- React 19 + TypeScript ↔ Inertia.js SSR
- Stripe Checkout ↔ Webhooks Laravel
- vite-plugin-pwa ↔ Workbox + IndexedDB

**Pattern Consistency:**
- Naming conventions cohérentes : snake_case (DB) → camelCase (API) → PascalCase (React)
- Structure alignée : MVC backend + Feature-based frontend
- État unifié : React Context partout (pas de mix avec Redux)

**Structure Alignment:**
- Services métier isolés (TicketService, PaymentService, QRCodeService)
- Jobs asynchrones pour opérations lourdes (emails, PDF)
- Policies Laravel pour authorization granulaire

### Requirements Coverage Validation ✅

**Couverture des 37 Functional Requirements:**

| Capability Area | FRs | Status | Solution |
|-----------------|-----|--------|----------|
| Gestion Comptes | 5 | ✅ | Fortify + User model + Policies |
| Catalogue Événements | 4 | ✅ | EventController + SSR + Cache Redis |
| Achat Billets | 6 | ✅ | CheckoutController + Stripe + Jobs |
| Gestion Billets | 5 | ✅ | TicketController + QRCodeService + PDF |
| Gestion Événements | 8 | ✅ | Organizer/EventController + Staff |
| Dashboard Orga | 4 | ✅ | StatsService + Cache Redis |
| Scan & Contrôle | 5 | ✅ | PWA + IndexedDB + API sync |

**Couverture Non-Functional Requirements:**

| NFR | Cible | Status | Solution |
|-----|-------|--------|----------|
| API Response | < 300ms | ✅ | Redis cache + Eloquent eager loading |
| Mode Offline | Illimité | ✅ | IndexedDB pre-download + Service Worker |
| Uptime | 99.5% | ✅ | Coolify + Redis sessions |
| Concurrence | 100 users | ✅ | Stateless + Redis sessions |
| Scans/heure | 1000/event | ✅ | Validation locale IndexedDB |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ Toutes les décisions critiques documentées avec versions exactes
- ✅ Packages PHP et npm listés avec usage précis
- ✅ Patterns avec exemples de code concrets

**Structure Completeness:**
- ✅ Arborescence complète (80+ fichiers définis)
- ✅ Mapping explicit FRs → fichiers source
- ✅ Boundaries clairs (API, Data, Component)

**Pattern Completeness:**
- ✅ 12 points de conflit potentiels identifiés et résolus
- ✅ Conventions naming exhaustives pour DB, API, Code
- ✅ Error handling et loading states documentés

### Gap Analysis Results

**Gaps Critiques:** Aucun - Architecture prête pour implémentation MVP

**Gaps Importants (Post-MVP):**
- WebSocket pour stats temps réel organisateur (Phase 2)
- Tests E2E frontend avec Playwright
- Monitoring production (Sentry ou Laravel Pulse)

**Gaps Nice-to-have:**
- Storybook pour documentation composants UI
- OpenAPI/Swagger pour endpoints `/api/scan/*`

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed (37 FRs, 6 NFRs)
- [x] Scale and complexity assessed (Medium, PWA, multi-tenant)
- [x] Technical constraints identified (Laravel 12, Stripe, RGPD)
- [x] Cross-cutting concerns mapped (Auth, Offline, SEO)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined (Stripe, Resend)
- [x] Performance considerations addressed (Redis, IndexedDB)

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined (MVC + Feature-based)
- [x] Communication patterns specified (Inertia + Context)
- [x] Process patterns documented (Error handling, Loading)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- Stack mature et bien intégré (Laravel + React + Inertia)
- PWA offline robuste avec stratégie pre-download
- Sécurité QR solide (UUID + HMAC-SHA256)
- Structure claire et prédictible pour les agents IA
- Patterns exhaustifs évitant les conflits d'implémentation

**Areas for Future Enhancement:**
- WebSocket pour dashboard temps réel
- Tests E2E complets
- Monitoring et alerting production

### Implementation Handoff

**AI Agent Guidelines:**
1. Suivre toutes les décisions architecturales exactement comme documentées
2. Utiliser les patterns d'implémentation de manière cohérente
3. Respecter la structure du projet et les boundaries
4. Référencer ce document pour toutes questions architecturales

**First Implementation Priority:**
1. Setup Redis (docker-compose.yml)
2. Créer les migrations database
3. Implémenter Auth + rôles (Fortify)
4. CRUD événements organisateur

## 7. Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-15
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**Complete Architecture Document**
- Toutes les décisions architecturales documentées avec versions spécifiques
- Patterns d'implémentation garantissant la cohérence entre agents IA
- Structure de projet complète avec tous les fichiers et répertoires
- Mapping requirements → architecture
- Validation confirmant cohérence et complétude

**Implementation Ready Foundation**
- 15+ décisions architecturales majeures
- 12 patterns d'implémentation définis
- 7 capability areas couvertes
- 37 functional requirements supportés

**AI Agent Implementation Guide**
- Stack technologique avec versions vérifiées
- Règles de cohérence évitant les conflits d'implémentation
- Structure de projet avec boundaries clairs
- Patterns d'intégration et standards de communication

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] Toutes les décisions fonctionnent ensemble sans conflits
- [x] Choix technologiques compatibles
- [x] Patterns supportent les décisions architecturales
- [x] Structure alignée avec tous les choix

**✅ Requirements Coverage**
- [x] Tous les FRs supportés architecturalement
- [x] Tous les NFRs adressés
- [x] Préoccupations transversales gérées
- [x] Points d'intégration définis

**✅ Implementation Readiness**
- [x] Décisions spécifiques et actionnables
- [x] Patterns évitant les conflits entre agents
- [x] Structure complète et non-ambiguë
- [x] Exemples fournis pour clarification

---

**Architecture Status:** ✅ READY FOR IMPLEMENTATION

**Next Phase:** Commencer l'implémentation en utilisant les décisions et patterns documentés.

**Document Maintenance:** Mettre à jour cette architecture lors de décisions techniques majeures pendant l'implémentation.

