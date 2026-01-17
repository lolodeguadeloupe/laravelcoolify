# Story 0.1: Section Hero

Status: ready-for-dev

## Story

**En tant que** visiteur,
**Je veux** voir une section d'accroche en arrivant sur le site,
**Afin de** comprendre immédiatement ce qu'est Event Cool.

## Acceptance Criteria

1. **AC1**: Titre accrocheur "Découvrez les meilleurs événements"
2. **AC2**: Sous-titre explicatif court
3. **AC3**: Bouton CTA "Explorer les événements" vers /events
4. **AC4**: Design responsive (mobile-first)
5. **AC5**: Support dark mode

## Tasks / Subtasks

- [x] **Task 1: Créer le composant HeroSection** (AC: 1, 2, 3)
  - [x] 1.1 Créer `resources/js/components/welcome/hero-section.tsx`
  - [x] 1.2 Ajouter le titre avec highlight sur "événements"
  - [x] 1.3 Ajouter le sous-titre descriptif
  - [x] 1.4 Ajouter le bouton CTA avec lien Wayfinder

- [x] **Task 2: Intégrer dans la page welcome** (AC: 1, 2, 3)
  - [x] 2.1 Importer HeroSection dans `welcome.tsx`
  - [x] 2.2 Placer le composant en haut du main content

- [x] **Task 3: Responsive design** (AC: 4)
  - [x] 3.1 Utiliser les breakpoints Tailwind (md:, lg:)
  - [x] 3.2 Adapter la taille du texte pour mobile/desktop

- [x] **Task 4: Dark mode** (AC: 5)
  - [x] 4.1 Utiliser les classes Tailwind sémantiques (bg-background, text-primary, etc.)
  - [x] 4.2 Vérifier le rendu en mode sombre

- [ ] **Task 5: Tests et validation** (AC: tous)
  - [ ] 5.1 Test visuel mobile
  - [ ] 5.2 Test visuel desktop
  - [ ] 5.3 Test dark mode
  - [ ] 5.4 Test du lien CTA vers /events

## Dev Notes

### ⚠️ CODE DÉJÀ IMPLÉMENTÉ

Cette story est **quasi-complète**. Le code existe déjà dans le projet :

| Fichier | Status | Notes |
|---------|--------|-------|
| `resources/js/components/welcome/hero-section.tsx` | ✅ Existe | Composant complet |
| `resources/js/pages/welcome.tsx` | ✅ Existe | Intégration faite |
| `app/Http/Controllers/WelcomeController.php` | ✅ Existe | Route configurée |

### Code Existant Analysé

**HeroSection (`hero-section.tsx`)**
```typescript
// ✅ Titre avec highlight
<h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
    Découvrez les meilleurs <span className="text-primary">événements</span>
</h1>

// ✅ Sous-titre
<p className="text-lg text-muted-foreground md:text-xl">
    Concerts, festivals, spectacles... Trouvez et réservez vos places en quelques clics.
</p>

// ✅ CTA avec Wayfinder
<Button asChild size="lg">
    <Link href={eventsIndex().url}>Explorer les événements</Link>
</Button>
```

**Responsive** : ✅ Classes `md:` et `lg:` utilisées pour les breakpoints

**Dark Mode** : ✅ Classes sémantiques Tailwind (`bg-background`, `text-primary`, `text-muted-foreground`)

### Travail Restant

Le travail restant est principalement de la **validation** :

1. **Tests visuels** - Vérifier le rendu sur différents appareils
2. **Test fonctionnel** - Cliquer sur le CTA et vérifier la navigation
3. **Review du code** - Valider que le code suit les conventions

### Points d'Amélioration Optionnels

Si demandé, on pourrait améliorer :
- Ajouter une animation d'entrée (framer-motion)
- Ajouter une image de fond ou illustration
- Ajouter des stats (ex: "500+ événements")

### Architecture Compliance

✅ **Composant feature-based** : `components/welcome/hero-section.tsx`
✅ **Wayfinder** : Utilisation de `eventsIndex()` pour le lien
✅ **shadcn/ui** : Utilisation de `Button`
✅ **Tailwind** : Classes utilitaires, pas de CSS custom

### Fichiers Concernés

```
resources/js/
├── components/
│   └── welcome/
│       └── hero-section.tsx     # ✅ Composant Hero
├── pages/
│   └── welcome.tsx              # ✅ Page d'accueil
```

### Tests Recommandés

```typescript
// tests/Feature/WelcomeControllerTest.php
it('displays the hero section', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) =>
        $page->component('welcome')
    );
});
```

```typescript
// Test E2E (optionnel - Pest Browser)
it('navigates to events from hero CTA', function () {
    visit('/')
        ->assertSee('Découvrez les meilleurs événements')
        ->click('Explorer les événements')
        ->assertPathIs('/events');
});
```

### References

- [Source: planning-artifacts/epics.md#S0.1: Section Hero]
- [Source: planning-artifacts/architecture.md#Frontend Architecture]
- [Source: planning-artifacts/project-context.md#Frontend Patterns]

## Dev Agent Record

### Agent Model Used

_(Code pré-existant - développé avant création de la story)_

### Debug Log References

N/A

### Completion Notes List

- Code déjà implémenté avant la story
- Validation requise pour marquer comme done

### File List

- `resources/js/components/welcome/hero-section.tsx` (existant)
- `resources/js/pages/welcome.tsx` (existant)
- `app/Http/Controllers/WelcomeController.php` (existant)
