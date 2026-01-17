# Story 1.1: Inscription Utilisateur

Status: ready-for-dev

## Story

**En tant que** visiteur,
**Je veux** créer un compte avec mon email,
**Afin de** pouvoir acheter des billets ou créer des événements.

## Acceptance Criteria

1. **AC1**: Formulaire avec champs email, mot de passe, confirmation mot de passe
2. **AC2**: Validation email unique dans la base de données
3. **AC3**: Mot de passe minimum 8 caractères
4. **AC4**: Email de confirmation envoyé après inscription
5. **AC5**: Redirection vers dashboard après inscription réussie
6. **AC6**: Messages d'erreur en français
7. **AC7**: Support dark mode

## Tasks / Subtasks

- [ ] **Task 1: Activer la vérification d'email** (AC: 4)
  - [ ] 1.1 Implémenter `MustVerifyEmail` sur le modèle User
  - [ ] 1.2 Configurer le mail driver (Resend ou SMTP)
  - [ ] 1.3 Vérifier que l'event `Registered` déclenche bien l'email

- [ ] **Task 2: Adapter le formulaire d'inscription** (AC: 1, 6, 7)
  - [ ] 2.1 Traduire les labels et placeholders en français
  - [ ] 2.2 Vérifier le support dark mode (déjà géré par shadcn/ui)
  - [ ] 2.3 Adapter le titre et description de la page

- [ ] **Task 3: Valider les règles de validation** (AC: 2, 3)
  - [ ] 3.1 Vérifier que `unique:users` fonctionne sur l'email
  - [ ] 3.2 Confirmer que Password::defaults() inclut min 8 caractères
  - [ ] 3.3 Traduire les messages d'erreur Laravel en français

- [ ] **Task 4: Ajuster la redirection post-inscription** (AC: 5)
  - [ ] 4.1 Vérifier la redirection vers `/dashboard`
  - [ ] 4.2 S'assurer que la route dashboard existe

- [ ] **Task 5: Écrire les tests** (AC: tous)
  - [ ] 5.1 Test inscription réussie
  - [ ] 5.2 Test email unique (erreur si existe)
  - [ ] 5.3 Test mot de passe trop court
  - [ ] 5.4 Test confirmation mot de passe ne correspond pas

## Dev Notes

### État Actuel du Code

Le starter kit Laravel Breeze a déjà installé l'authentification. Les fichiers clés sont :

| Fichier | État | Action |
|---------|------|--------|
| `app/Http/Controllers/Auth/RegisteredUserController.php` | Existe | Modifier validation |
| `resources/js/pages/auth/register.tsx` | Existe | Traduire en FR |
| `app/Models/User.php` | Existe | Ajouter MustVerifyEmail |
| `routes/auth.php` | Existe | Aucune modification |

### Architecture Compliance

**Pattern obligatoire** : Form Request pour validation

```php
// ACTUEL (dans RegisteredUserController.php)
$request->validate([...]);  // ❌ Inline validation

// CIBLE (à créer)
public function store(StoreUserRequest $request)  // ✅ Form Request
```

**Décision** : Pour cette story, la validation inline est acceptable car c'est du code Breeze standard. Créer un Form Request est optionnel mais recommandé pour la cohérence.

### Fichiers à Modifier

```
app/
├── Models/User.php                          # Ajouter MustVerifyEmail
├── Http/Controllers/Auth/
│   └── RegisteredUserController.php         # Optionnel: Form Request
└── Http/Requests/
    └── StoreUserRequest.php                 # Optionnel: créer

resources/js/pages/auth/
└── register.tsx                             # Traduire labels FR

config/
└── app.php                                  # Vérifier locale = 'fr'

lang/fr/                                     # Messages FR si pas existant
└── validation.php
```

### Dépendances Techniques

| Dépendance | Version | Usage |
|------------|---------|-------|
| Laravel Fortify | v1 | Authentification backend |
| Inertia.js | v2 | Rendu React SSR |
| shadcn/ui | latest | Composants UI (Button, Input, Label) |

### Configuration Email

```env
# .env - Configuration Resend (production)
MAIL_MAILER=resend
RESEND_KEY=re_xxxxxxxxxxxx

# .env - Configuration locale (dev)
MAIL_MAILER=log  # ou mailpit via Sail
```

### Validation Rules (Password::defaults)

Laravel 12 `Password::defaults()` inclut par défaut :
- Minimum 8 caractères
- Peut être personnalisé dans `AppServiceProvider::boot()`

```php
// Pour renforcer (optionnel)
Password::defaults(function () {
    return Password::min(8)
        ->letters()
        ->mixedCase()
        ->numbers();
});
```

### Project Structure Notes

- Les pages auth sont dans `resources/js/pages/auth/` (lowercase)
- Wayfinder génère les routes dans `@/actions/` et `@/routes/`
- Le composant `Form` d'Inertia v2 est utilisé (pas useForm)

### Tests Pattern

```php
// tests/Feature/Auth/RegistrationTest.php
it('registers a new user', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
});

it('requires unique email', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'existing@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
});
```

### References

- [Source: planning-artifacts/architecture.md#Authentication & Security]
- [Source: planning-artifacts/epics.md#S1.1: Inscription utilisateur]
- [Source: planning-artifacts/project-context.md#Backend Patterns]
- [Laravel Fortify Documentation](https://laravel.com/docs/12.x/fortify)

## Dev Agent Record

### Agent Model Used

_(À remplir par le Dev Agent)_

### Debug Log References

_(À remplir pendant l'implémentation)_

### Completion Notes List

_(À remplir après implémentation)_

### File List

_(À remplir avec les fichiers modifiés/créés)_
