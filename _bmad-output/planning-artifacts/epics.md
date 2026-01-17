---
project_name: Event Cool
created_at: 2026-01-15
source: prd.md
total_epics: 8
total_stories: 40
status: ready_for_development
---

# Event Cool - Epics & User Stories

## Overview

| Epic | Stories | Priority | Complexity |
|------|---------|----------|------------|
| E0: Page d'Accueil | 3 | P0 | Low |
| E1: Auth & Comptes | 5 | P0 | Low |
| E2: Catalogue Événements | 4 | P0 | Low |
| E3: Achat Billets | 6 | P0 | High |
| E4: Gestion Billets | 5 | P0 | Medium |
| E5: Gestion Événements | 8 | P0 | Medium |
| E6: Dashboard Organisateur | 4 | P1 | Low |
| E7: Scan & Contrôle | 5 | P0 | High |

---

## E0: Page d'Accueil

**Objectif:** Créer une page d'accueil attrayante qui met en avant les événements à la une et incite les visiteurs à explorer le catalogue.

**Dépendances:** E2 (catalogue événements pour les composants EventCard)

### Stories

#### S0.1: Section Hero
**En tant que** visiteur
**Je veux** voir une section d'accroche en arrivant sur le site
**Afin de** comprendre immédiatement ce qu'est Event Cool

**Critères d'acceptation:**
- [ ] Titre accrocheur "Découvrez les meilleurs événements"
- [ ] Sous-titre explicatif court
- [ ] Bouton CTA "Explorer les événements" vers /events
- [ ] Design responsive (mobile-first)
- [ ] Support dark mode

**Données techniques:**
- Route: `GET /`
- Controller: `WelcomeController@index` (nouveau)
- Page: `pages/welcome.tsx` (remplacer contenu existant)

---

#### S0.2: Événements à la une
**En tant que** visiteur
**Je veux** voir les événements mis en avant sur la page d'accueil
**Afin de** découvrir rapidement les événements populaires

**Critères d'acceptation:**
- [ ] Section "Événements à la une" avec titre
- [ ] Affichage de 3-6 événements avec `is_featured = true`
- [ ] Utilisation du composant EventCard existant
- [ ] Message si aucun événement à la une
- [ ] Lien "Voir tous les événements" en bas de section

**Données techniques:**
- Query: `Event::where('is_featured', true)->where('status', 'published')->take(6)->get()`
- Réutiliser: `EventCard` de `events/index.tsx`
- Props Inertia: `featuredEvents`

---

#### S0.3: Événements à venir
**En tant que** visiteur
**Je veux** voir les prochains événements sur la page d'accueil
**Afin de** découvrir ce qui se passe bientôt

**Critères d'acceptation:**
- [ ] Section "Prochains événements" sous les événements à la une
- [ ] Affichage des 6 prochains événements (par date)
- [ ] Exclure les événements déjà passés
- [ ] Utilisation du composant EventCard existant
- [ ] Lien "Voir le calendrier complet" vers /events

**Données techniques:**
- Query: `Event::where('status', 'published')->where('date', '>=', now())->orderBy('date')->take(6)->get()`
- Props Inertia: `upcomingEvents`

---

## E1: Auth & Comptes

**Objectif:** Permettre aux utilisateurs de créer un compte, se connecter et gérer leur profil.

**Dépendances:** Aucune (fondation)

### Stories

#### S1.1: Inscription utilisateur
**En tant que** visiteur
**Je veux** créer un compte avec mon email
**Afin de** pouvoir acheter des billets ou créer des événements

**Critères d'acceptation:**
- [ ] Formulaire avec email, mot de passe, confirmation mot de passe
- [ ] Validation email unique
- [ ] Mot de passe min 8 caractères
- [ ] Email de confirmation envoyé
- [ ] Redirection vers dashboard après inscription

**Données techniques:**
- Route: `POST /register`
- Controller: `RegisteredUserController`
- Validation: `StoreUserRequest`

---

#### S1.2: Connexion utilisateur
**En tant que** utilisateur inscrit
**Je veux** me connecter à mon compte
**Afin d'** accéder à mes billets ou mon dashboard organisateur

**Critères d'acceptation:**
- [ ] Formulaire email + mot de passe
- [ ] Message d'erreur si identifiants incorrects
- [ ] Option "Se souvenir de moi"
- [ ] Redirection vers page précédente ou dashboard

**Données techniques:**
- Route: `POST /login`
- Controller: `AuthenticatedSessionController`
- Session: Redis

---

#### S1.3: Réinitialisation mot de passe
**En tant que** utilisateur
**Je veux** réinitialiser mon mot de passe
**Afin de** récupérer l'accès à mon compte si je l'oublie

**Critères d'acceptation:**
- [ ] Formulaire "Mot de passe oublié" avec email
- [ ] Email avec lien de réinitialisation (expire 1h)
- [ ] Page de saisie nouveau mot de passe
- [ ] Confirmation succès + redirection login

**Données techniques:**
- Route: `POST /forgot-password`, `POST /reset-password`
- Controller: `PasswordResetController`
- Token: table `password_reset_tokens`

---

#### S1.4: Déconnexion
**En tant que** utilisateur connecté
**Je veux** me déconnecter
**Afin de** sécuriser mon compte sur un appareil partagé

**Critères d'acceptation:**
- [ ] Bouton déconnexion visible dans le header
- [ ] Destruction de la session
- [ ] Redirection vers page d'accueil

**Données techniques:**
- Route: `POST /logout`
- Session Redis invalidée

---

#### S1.5: Choix du rôle utilisateur
**En tant que** utilisateur inscrit
**Je veux** indiquer si je suis acheteur ou organisateur
**Afin d'** accéder aux fonctionnalités adaptées

**Critères d'acceptation:**
- [ ] Choix proposé après inscription ou dans profil
- [ ] Un utilisateur peut être les deux (switch de vue)
- [ ] L'organisateur accède au dashboard orga
- [ ] L'acheteur accède à "Mes billets"

**Données techniques:**
- Champ `role` sur User ou table séparée
- Middleware `EnsureUserIsOrganizer`

---

## E2: Catalogue Événements

**Objectif:** Permettre aux visiteurs de découvrir et explorer les événements.

**Dépendances:** E1 (pour certaines actions), E5 (événements créés)

### Stories

#### S2.1: Liste des événements
**En tant que** visiteur
**Je veux** voir la liste des événements publiés
**Afin de** découvrir les événements disponibles

**Critères d'acceptation:**
- [ ] Affichage grille/liste des événements publiés
- [ ] Image, titre, date, lieu, prix "à partir de"
- [ ] Tri par date (prochains en premier)
- [ ] Pagination (12 par page)
- [ ] SSR pour SEO

**Données techniques:**
- Route: `GET /events`
- Controller: `EventController@index`
- Cache Redis: 5 min

---

#### S2.2: Détail d'un événement
**En tant que** visiteur
**Je veux** voir le détail complet d'un événement
**Afin de** décider si je veux y participer

**Critères d'acceptation:**
- [ ] Titre, description complète, date/heure, lieu
- [ ] Image principale
- [ ] Liste des catégories de billets avec prix
- [ ] Bouton "Acheter" par catégorie
- [ ] Schema.org Event pour SEO
- [ ] URL friendly (slug)

**Données techniques:**
- Route: `GET /events/{slug}`
- Controller: `EventController@show`
- Eager loading: `categories`

---

#### S2.3: Recherche d'événements
**En tant que** visiteur
**Je veux** rechercher un événement par mot-clé
**Afin de** trouver rapidement ce que je cherche

**Critères d'acceptation:**
- [ ] Champ de recherche dans le header
- [ ] Recherche sur titre, description, lieu
- [ ] Résultats filtrés en temps réel (debounce 300ms)
- [ ] Message si aucun résultat

**Données techniques:**
- Route: `GET /events?search=xxx`
- PostgreSQL ILIKE ou full-text search

---

#### S2.4: Affichage catégories de billets
**En tant que** visiteur
**Je veux** voir les catégories disponibles et leurs prix
**Afin de** choisir le type de billet qui me convient

**Critères d'acceptation:**
- [ ] Liste des catégories sur la page événement
- [ ] Nom, description, prix de chaque catégorie
- [ ] Indication "Épuisé" si plus de stock
- [ ] Indication "Bientôt disponible" si vente pas ouverte

**Données techniques:**
- Relation `Event hasMany TicketCategory`
- Calcul: `quantity - quantity_sold`

---

## E3: Achat de Billets

**Objectif:** Permettre aux acheteurs d'acheter des billets via Stripe.

**Dépendances:** E1 (compte), E2 (catalogue)

### Stories

#### S3.1: Sélection catégorie de billet
**En tant qu'** acheteur
**Je veux** sélectionner une catégorie de billet
**Afin de** l'ajouter à mon panier

**Critères d'acceptation:**
- [ ] Bouton "Sélectionner" sur chaque catégorie
- [ ] Catégorie ajoutée au panier (CartContext)
- [ ] Feedback visuel (toast ou animation)
- [ ] Impossible si épuisé

**Données techniques:**
- State: `CartContext`
- Validation stock côté serveur au checkout

---

#### S3.2: Choix quantité
**En tant qu'** acheteur
**Je veux** choisir le nombre de billets
**Afin d'** acheter pour moi et mes amis

**Critères d'acceptation:**
- [ ] Sélecteur quantité (1-10 ou max_per_order)
- [ ] Mise à jour du sous-total
- [ ] Limite par catégorie respectée
- [ ] Vérification stock disponible

**Données techniques:**
- Validation: `max_per_order` de TicketCategory
- Stock check: `quantity - quantity_sold >= requested`

---

#### S3.3: Récapitulatif commande
**En tant qu'** acheteur
**Je veux** voir le récapitulatif avant de payer
**Afin de** vérifier ma commande

**Critères d'acceptation:**
- [ ] Liste des billets sélectionnés
- [ ] Prix unitaire et quantité
- [ ] Sous-total par catégorie
- [ ] Frais de service (5% + 0.50€)
- [ ] Total à payer
- [ ] Bouton "Modifier" pour revenir

**Données techniques:**
- Page: `pages/checkout/Index.tsx`
- Calcul fees: `(subtotal * 0.05) + 50` (en centimes)

---

#### S3.4: Paiement Stripe
**En tant qu'** acheteur
**Je veux** payer par carte bancaire
**Afin de** finaliser mon achat

**Critères d'acceptation:**
- [ ] Redirection vers Stripe Checkout
- [ ] Paiement CB sécurisé (3D Secure si requis)
- [ ] Gestion erreur paiement
- [ ] Retour sur Event Cool après paiement

**Données techniques:**
- Service: `PaymentService`
- Stripe Checkout Session
- success_url, cancel_url

---

#### S3.5: Confirmation commande
**En tant qu'** acheteur
**Je veux** voir une confirmation après paiement
**Afin d'** être rassuré que ma commande est validée

**Critères d'acceptation:**
- [ ] Page de succès avec n° de commande
- [ ] Récapitulatif des billets achetés
- [ ] Message "Billets envoyés par email"
- [ ] Lien vers "Mes billets"

**Données techniques:**
- Page: `pages/checkout/Success.tsx`
- Webhook Stripe déclenche création Order + Tickets

---

#### S3.6: Envoi billets par email
**En tant qu'** acheteur
**Je veux** recevoir mes billets par email
**Afin de** les avoir toujours accessibles

**Critères d'acceptation:**
- [ ] Email envoyé après paiement confirmé
- [ ] Un email par billet ou récapitulatif
- [ ] QR code inclus dans l'email
- [ ] PDF en pièce jointe

**Données techniques:**
- Job: `SendTicketEmail`
- Queue: Redis
- PDF: `GenerateTicketPDF` job

---

## E4: Gestion des Billets (Acheteur)

**Objectif:** Permettre aux acheteurs de consulter et gérer leurs billets.

**Dépendances:** E3 (achat effectué)

### Stories

#### S4.1: Liste "Mes billets"
**En tant qu'** acheteur connecté
**Je veux** voir la liste de mes billets
**Afin de** retrouver facilement mes achats

**Critères d'acceptation:**
- [ ] Page "Mes billets" accessible depuis le menu
- [ ] Liste groupée par événement
- [ ] Statut de chaque billet (valide, utilisé)
- [ ] Date de l'événement visible
- [ ] Billets passés séparés des futurs

**Données techniques:**
- Route: `GET /tickets`
- Controller: `TicketController@index`
- Query: user_id via order

---

#### S4.2: Affichage QR code
**En tant qu'** acheteur
**Je veux** voir le QR code de mon billet
**Afin de** le présenter à l'entrée

**Critères d'acceptation:**
- [ ] QR code grand et lisible
- [ ] Nom de l'événement visible
- [ ] Catégorie du billet
- [ ] Date et heure
- [ ] Luminosité écran augmentée (suggestion)

**Données techniques:**
- Route: `GET /tickets/{uuid}`
- QR: généré côté client ou image serveur
- Format: `{uuid}:{hmac}`

---

#### S4.3: Téléchargement PDF
**En tant qu'** acheteur
**Je veux** télécharger mon billet en PDF
**Afin de** l'imprimer ou le sauvegarder

**Critères d'acceptation:**
- [ ] Bouton "Télécharger PDF"
- [ ] PDF avec QR code, infos événement, infos billet
- [ ] Design propre et imprimable
- [ ] Nom fichier: `billet-{event}-{uuid}.pdf`

**Données techniques:**
- Route: `GET /tickets/{uuid}/pdf`
- Package: `barryvdh/laravel-dompdf`

---

#### S4.4: Renvoi email
**En tant qu'** acheteur
**Je veux** renvoyer le billet à mon email
**Afin de** le retrouver si je l'ai perdu

**Critères d'acceptation:**
- [ ] Bouton "Renvoyer par email"
- [ ] Confirmation envoi
- [ ] Limite: 3 renvois par heure (anti-spam)

**Données techniques:**
- Route: `POST /tickets/{uuid}/resend`
- Rate limiting: Redis
- Job: `SendTicketEmail`

---

#### S4.5: Récupération billet guest
**En tant que** visiteur ayant acheté sans compte
**Je veux** récupérer mon billet avec email + n° commande
**Afin d'** y accéder sans créer de compte

**Critères d'acceptation:**
- [ ] Formulaire "Retrouver mon billet"
- [ ] Champs: email + référence commande
- [ ] Affichage du billet si trouvé
- [ ] Message d'erreur si non trouvé

**Données techniques:**
- Route: `GET /tickets/recover`
- Validation: email + order.reference

---

## E5: Gestion des Événements (Organisateur)

**Objectif:** Permettre aux organisateurs de créer et gérer leurs événements.

**Dépendances:** E1 (compte organisateur)

### Stories

#### S5.1: Création événement
**En tant qu'** organisateur
**Je veux** créer un nouvel événement
**Afin de** vendre des billets

**Critères d'acceptation:**
- [ ] Formulaire de création accessible depuis dashboard
- [ ] Champs obligatoires: titre, date, lieu
- [ ] Sauvegarde en brouillon possible
- [ ] Redirection vers édition après création

**Données techniques:**
- Route: `POST /organizer/events`
- Controller: `Organizer\EventController@store`
- Request: `StoreEventRequest`

---

#### S5.2: Informations événement
**En tant qu'** organisateur
**Je veux** définir les informations de mon événement
**Afin de** le présenter aux acheteurs

**Critères d'acceptation:**
- [ ] Titre (max 100 caractères)
- [ ] Description (rich text ou markdown)
- [ ] Date et heure de début
- [ ] Date et heure de fin (optionnel)
- [ ] Lieu (nom + adresse + ville)
- [ ] Image principale (upload)

**Données techniques:**
- Upload image: `storage/app/public/events`
- Slug généré automatiquement depuis titre
- Validation image: max 2MB, jpg/png

---

#### S5.3: Création catégories billets
**En tant qu'** organisateur
**Je veux** créer plusieurs catégories de billets
**Afin d'** offrir différentes options (VIP, Standard, etc.)

**Critères d'acceptation:**
- [ ] Ajout dynamique de catégories
- [ ] Nom de la catégorie (ex: "VIP", "Standard")
- [ ] Description optionnelle
- [ ] Ordre d'affichage modifiable

**Données techniques:**
- Route: `POST /organizer/events/{id}/categories`
- Controller: `Organizer\TicketCategoryController`
- Relation: Event hasMany TicketCategory

---

#### S5.4: Prix et jauge par catégorie
**En tant qu'** organisateur
**Je veux** définir le prix et la quantité par catégorie
**Afin de** contrôler mes ventes

**Critères d'acceptation:**
- [ ] Prix en euros (min 0€ pour gratuit)
- [ ] Quantité totale disponible
- [ ] Limite par commande (optionnel, défaut 10)
- [ ] Dates de vente (début/fin optionnel)

**Données techniques:**
- Prix stocké en centimes (integer)
- Validation: price >= 0, quantity >= 1

---

#### S5.5: Publication événement
**En tant qu'** organisateur
**Je veux** publier mon événement
**Afin de** le rendre visible aux acheteurs

**Critères d'acceptation:**
- [ ] Bouton "Publier" visible sur événement en brouillon
- [ ] Vérification: au moins 1 catégorie avec stock > 0
- [ ] Statut passe à "published"
- [ ] Événement visible dans le catalogue

**Données techniques:**
- Route: `POST /organizer/events/{id}/publish`
- Validation: hasActiveCategories()

---

#### S5.6: Dépublication événement
**En tant qu'** organisateur
**Je veux** dépublier mon événement
**Afin de** le retirer temporairement du catalogue

**Critères d'acceptation:**
- [ ] Bouton "Dépublier" sur événement publié
- [ ] Événement retiré du catalogue public
- [ ] Billets déjà vendus restent valides
- [ ] Possibilité de republier

**Données techniques:**
- Route: `POST /organizer/events/{id}/unpublish`
- Status: published → draft

---

#### S5.7: Modification événement
**En tant qu'** organisateur
**Je veux** modifier mon événement
**Afin de** corriger ou mettre à jour les informations

**Critères d'acceptation:**
- [ ] Tous les champs modifiables
- [ ] Sauvegarde des modifications
- [ ] Historique non requis (MVP)
- [ ] Notification aux acheteurs non requise (MVP)

**Données techniques:**
- Route: `PUT /organizer/events/{id}`
- Request: `UpdateEventRequest`

---

#### S5.8: Suppression événement
**En tant qu'** organisateur
**Je veux** supprimer un événement
**Afin de** le retirer définitivement

**Critères d'acceptation:**
- [ ] Suppression possible uniquement si aucune vente
- [ ] Confirmation requise ("Êtes-vous sûr ?")
- [ ] Suppression définitive (soft delete optionnel)
- [ ] Message si ventes existantes

**Données techniques:**
- Route: `DELETE /organizer/events/{id}`
- Validation: orders_count === 0

---

## E6: Dashboard Organisateur

**Objectif:** Donner aux organisateurs une vue sur leurs ventes et événements.

**Dépendances:** E5 (événements créés)

### Stories

#### S6.1: Liste mes événements
**En tant qu'** organisateur
**Je veux** voir la liste de mes événements
**Afin de** les gérer facilement

**Critères d'acceptation:**
- [ ] Dashboard avec liste des événements
- [ ] Statut visible (brouillon, publié, passé)
- [ ] Nombre de billets vendus / total
- [ ] Actions: Éditer, Voir stats, Scanner

**Données techniques:**
- Route: `GET /organizer/events`
- Controller: `Organizer\EventController@index`

---

#### S6.2: Statistiques de vente
**En tant qu'** organisateur
**Je veux** voir les stats de vente d'un événement
**Afin de** suivre mes performances

**Critères d'acceptation:**
- [ ] Nombre total de billets vendus
- [ ] Répartition par catégorie
- [ ] Taux de remplissage (%)
- [ ] Dernières ventes (liste)

**Données techniques:**
- Route: `GET /organizer/events/{id}`
- Service: `StatsService`
- Agrégations SQL optimisées

---

#### S6.3: Liste billets vendus
**En tant qu'** organisateur
**Je veux** voir la liste des billets vendus
**Afin de** savoir qui vient

**Critères d'acceptation:**
- [ ] Liste des billets avec acheteur (email)
- [ ] Catégorie du billet
- [ ] Date d'achat
- [ ] Statut (valide, scanné)
- [ ] Recherche par email optionnelle

**Données techniques:**
- Route: `GET /organizer/events/{id}/tickets`
- Pagination: 50 par page

---

#### S6.4: Montant total des ventes
**En tant qu'** organisateur
**Je veux** voir le montant total généré
**Afin de** connaître mes revenus

**Critères d'acceptation:**
- [ ] Total brut (avant commission)
- [ ] Commission Event Cool
- [ ] Net à percevoir
- [ ] Détail par catégorie optionnel

**Données techniques:**
- Calcul: sum(order.total) - fees
- Affichage sur page stats événement

---

## E7: Scan & Contrôle d'Accès

**Objectif:** Permettre le contrôle des billets à l'entrée, même sans connexion internet.

**Dépendances:** E3 (billets créés), E5 (événement publié)

### Stories

#### S7.1: Accès mode scan
**En tant qu'** organisateur
**Je veux** accéder au mode scan sur mon mobile
**Afin de** contrôler les entrées

**Critères d'acceptation:**
- [ ] Bouton "Scanner" sur l'événement
- [ ] Interface optimisée mobile
- [ ] Demande d'accès caméra
- [ ] Sélection de l'événement à scanner

**Données techniques:**
- Route: `GET /scan`
- Page: `pages/scan/Index.tsx`
- Context: `ScanContext`

---

#### S7.2: Scan QR code
**En tant qu'** organisateur
**Je veux** scanner un QR code de billet
**Afin de** valider l'entrée d'un participant

**Critères d'acceptation:**
- [ ] Caméra active avec viseur QR
- [ ] Détection automatique du QR
- [ ] Vibration/son au scan
- [ ] Temps de réponse < 2s

**Données techniques:**
- Package: `html5-qrcode`
- Component: `QRScanner.tsx`
- Validation: UUID + HMAC signature

---

#### S7.3: Résultat du scan
**En tant qu'** organisateur
**Je veux** voir le résultat du scan immédiatement
**Afin de** savoir si je laisse entrer la personne

**Critères d'acceptation:**
- [ ] ✅ VALIDE : fond vert, nom catégorie
- [ ] ❌ DÉJÀ UTILISÉ : fond orange, heure du premier scan
- [ ] ❌ INVALIDE : fond rouge, message erreur
- [ ] Retour automatique au scan après 2s

**Données techniques:**
- Component: `ScanResult.tsx`
- États: success, already_used, invalid, cancelled

---

#### S7.4: Mode offline
**En tant qu'** organisateur
**Je veux** scanner sans connexion internet
**Afin de** fonctionner même dans un lieu sans réseau

**Critères d'acceptation:**
- [ ] Téléchargement des billets au lancement du scan
- [ ] Indicateur "Mode hors-ligne" visible
- [ ] Scans stockés localement
- [ ] Validation 100% locale
- [ ] Aucune perte de donnée

**Données techniques:**
- IndexedDB: tables `tickets`, `pending_scans`
- Package: `idb`
- Service Worker: Workbox

---

#### S7.5: Synchronisation offline → online
**En tant que** système
**Je veux** synchroniser les scans quand la connexion revient
**Afin de** maintenir la cohérence des données

**Critères d'acceptation:**
- [ ] Détection automatique retour connexion
- [ ] Upload des scans en attente
- [ ] Mise à jour du cache local
- [ ] Indicateur de synchronisation
- [ ] Gestion des conflits (double scan)

**Données techniques:**
- API: `POST /api/scan/sync`
- Background Sync API ou polling
- Conflict resolution: premier scan gagne

---

## Appendix: Story Dependencies

```
E1 (Auth) ─────────────────────────────────────────┐
    │                                               │
    ├──> E2 (Catalogue) ──────────────────────────>─┤
    │         │                                     │
    │         v                                     │
    ├──> E3 (Achat) ───> E4 (Gestion Billets)      │
    │                           │                   │
    ├──> E5 (Événements) ──────>├───> E6 (Dashboard)
    │         │                 │
    │         v                 v
    └──> E7 (Scan) <────────────┘
```

## Appendix: Technical Stack per Epic

| Epic | Backend | Frontend | External |
|------|---------|----------|----------|
| E1 | Fortify, User model | Auth pages | - |
| E2 | EventController, Cache | Event pages, SSR | - |
| E3 | CheckoutController, PaymentService | Checkout flow | Stripe |
| E4 | TicketController, Jobs | Ticket pages | Resend |
| E5 | Organizer controllers | Dashboard pages | - |
| E6 | StatsService | Stats components | - |
| E7 | ScanController, SyncController | PWA, IndexedDB | - |
