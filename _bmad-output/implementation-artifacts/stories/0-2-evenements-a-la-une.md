# Story 0.2: Événements à la une

Status: ready-for-dev

## Story

**En tant que** visiteur,
**Je veux** voir les événements mis en avant sur la page d'accueil,
**Afin de** découvrir rapidement les événements populaires.

## Acceptance Criteria

1. **AC1**: Section "Événements à la une" avec titre
2. **AC2**: Affichage de 3-6 événements avec `is_featured = true`
3. **AC3**: Utilisation du composant EventCard existant
4. **AC4**: Message si aucun événement à la une (section masquée)
5. **AC5**: Lien "Voir tous les événements" en bas de section

## Tasks / Subtasks

- [x] **Task 1: Créer le composant FeaturedEventsSection** (AC: 1, 2, 4)
  - [x] 1.1 Créer `resources/js/components/welcome/featured-events-section.tsx`
  - [x] 1.2 Ajouter le titre "Événements à la une" avec icône Star
  - [x] 1.3 Gérer le cas "aucun événement" (retourne null)

- [x] **Task 2: Créer le composant EventCard** (AC: 3)
  - [x] 2.1 Créer `resources/js/components/events/event-card.tsx`
  - [x] 2.2 Afficher image, titre, date, lieu, prix
  - [x] 2.3 Badge "En vedette" si `is_featured`
  - [x] 2.4 Skeleton loading state

- [x] **Task 3: Query backend** (AC: 2)
  - [x] 3.1 Filtrer `is_featured = true` et `status = published`
  - [x] 3.2 Exclure les événements passés
  - [x] 3.3 Limiter à 6 événements
  - [x] 3.4 Eager load `ticketCategories`

- [x] **Task 4: Lien "Voir tout"** (AC: 5)
  - [x] 4.1 Bouton avec lien Wayfinder vers /events

- [x] **Task 5: Tests** (AC: tous)
  - [x] 5.1 Test affichage événements featured
  - [x] 5.2 Test exclusion événements passés
  - [x] 5.3 Test limite à 6 événements

## Dev Notes

### ⚠️ CODE DÉJÀ IMPLÉMENTÉ

Cette story est **complète**. Tous les fichiers existent :

| Fichier | Status |
|---------|--------|
| `resources/js/components/welcome/featured-events-section.tsx` | ✅ |
| `resources/js/components/events/event-card.tsx` | ✅ |
| `app/Http/Controllers/WelcomeController.php` | ✅ |
| `tests/Feature/WelcomeControllerTest.php` | ✅ 9 tests |

### Code Analysé

**FeaturedEventsSection**
- ✅ Titre "Événements à la une" avec icône Star
- ✅ Grille responsive (1-2-3 colonnes)
- ✅ Retourne `null` si pas d'événements
- ✅ Bouton "Voir tout" vers /events

**EventCard**
- ✅ Image avec fallback
- ✅ Badge "En vedette"
- ✅ Date formatée (formatDate)
- ✅ Lieu (location + city)
- ✅ Prix le plus bas (getLowestPrice)
- ✅ Hover effects
- ✅ Skeleton pour loading

**WelcomeController Query**
```php
Event::query()
    ->where('status', 'published')
    ->where('is_featured', true)
    ->where('starts_at', '>=', now())
    ->with('ticketCategories')
    ->orderBy('starts_at')
    ->take(6)
    ->get();
```

### Tests Existants (9 tests)

- ✅ `it displays the home page`
- ✅ `it shows featured events`
- ✅ `it shows upcoming events`
- ✅ `it excludes past events from featured`
- ✅ `it excludes unpublished events from featured`
- ✅ `it limits featured events to 6`
- ✅ `it limits upcoming events to 6`
- ✅ `it separates featured events from upcoming events`
- ✅ `it orders events by date ascending`

### Architecture Compliance

✅ **Feature-based components** : `components/welcome/`, `components/events/`
✅ **Wayfinder** : `eventsIndex()`, `eventsShow.url(slug)`
✅ **shadcn/ui** : Card, Badge, Button, Skeleton
✅ **Tailwind** : Classes utilitaires, responsive grid
✅ **Types** : Interface `Event`, `FeaturedEventsSectionProps`

### References

- [Source: planning-artifacts/epics.md#S0.2: Événements à la une]
- [Source: planning-artifacts/architecture.md#Frontend Architecture]

## Dev Agent Record

### Agent Model Used

_(Code pré-existant)_

### Completion Notes List

- Code complet avant création de la story
- 9 tests Feature passent
- Prêt pour validation

### File List

- `resources/js/components/welcome/featured-events-section.tsx`
- `resources/js/components/events/event-card.tsx`
- `resources/js/pages/welcome.tsx`
- `app/Http/Controllers/WelcomeController.php`
- `tests/Feature/WelcomeControllerTest.php`
