---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish", "step-12-complete"]
currentStep: "completed"
status: "completed"
completedAt: "2026-01-15"
inputDocuments: ["product-brief-event-cool.md"]
workflowType: "prd"
date: 2026-01-15
author: Laurent
project_name: Event Cool
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
classification:
  projectType: "web_app"
  projectSubtype: "PWA"
  domain: "e-commerce/ticketing"
  complexity: "medium"
  projectContext: "greenfield"
  keyConcerns:
    - "Sécurité des paiements (PCI DSS via Stripe)"
    - "Conformité RGPD"
    - "Performance du scan QR offline"
    - "UX mobile-first"
---

# Product Requirements Document - Event Cool

**Author:** Laurent
**Date:** 2026-01-15
**Version:** 1.0 (MVP)

---

## Executive Summary

**Event Cool** est une plateforme de billetterie en ligne sous forme de PWA (Progressive Web App) pour le marché français. Sa philosophie : **simple à prendre en main**.

### Proposition de Valeur

| Utilisateur | Valeur |
|-------------|--------|
| **Acheteurs** | Achat en quelques clics, billet QR par email, récupération autonome |
| **Organisateurs** | Création événement < 30 min, scan offline, dashboard stats |

### Chiffres Clés

| Métrique | MVP | 12 mois |
|----------|-----|---------|
| Événements créés | 50+ | 200+ |
| Billets vendus | 1,000+ | 10,000+ |
| Commission | 5% + 0.50€ | 5% + 0.50€ |

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Backend | Laravel 12 |
| Frontend | React 19 + Inertia.js |
| Database | PostgreSQL |
| Paiement | Stripe Checkout |
| Type | PWA (offline scan) |

### Scope MVP

- **37 Functional Requirements**
- **4 User Journeys** supportés
- **6 Capability Areas** : Comptes, Catalogue, Achat, Billets, Événements, Scan

---

## 1. Classification du Projet

| Critère | Valeur |
|---------|--------|
| **Type** | Web App (PWA) |
| **Domaine** | E-commerce / Ticketing |
| **Complexité** | Medium |
| **Contexte** | Greenfield |

## 2. Success Criteria

### User Success - Acheteur

| Critère | Mesure | Cible |
|---------|--------|-------|
| **Achat rapide** | Nombre de clics pour acheter | ≤ 4 clics |
| **Inscription fluide** | Temps d'inscription/connexion | < 1 minute |
| **UX intuitive** | Taux d'abandon panier | < 30% |
| **Design attractif** | Note UX utilisateurs | > 4/5 |

**Moment "aha!" Acheteur :** *"J'ai mon billet en quelques clics, c'était trop simple !"*

### User Success - Organisateur

| Critère | Mesure | Cible |
|---------|--------|-------|
| **Dashboard accessible** | Clics pour accéder au dashboard | ≤ 2 clics après login |
| **Création événement** | Temps de création complète | < 30 minutes |
| **Gestion complète** | Fonctionnalités disponibles | Prix, dates, galerie photos |
| **Scan efficace** | Temps de validation billet | < 2 secondes |
| **NPS Organisateurs** | Score de recommandation | > 40 |

**Moment "aha!" Organisateur :** *"Mon événement est en ligne et je peux scanner sans connexion !"*

### Business Success

| Critère | Mesure | Cible MVP | Cible 12 mois |
|---------|--------|-----------|---------------|
| **Commission** | % + fixe par vente | 5% + 0.50€ | 5% + 0.50€ |
| **Événements créés** | Nombre total | 50+ (3 mois) | 200+ |
| **Billets vendus** | Volume | 1000+ (3 mois) | 10,000+ |
| **Organisateurs actifs** | Comptes avec ≥1 événement | 20+ | 100+ |

### Technical Success

| Critère | Mesure | Cible |
|---------|--------|-------|
| **Performance** | Temps de chargement pages | < 300ms |
| **Mode offline scan** | Durée autonomie | Illimité (cache local complet) |
| **Fiabilité** | Uptime | > 99.5% |
| **Taux scan réussi** | Billets scannés OK | > 95% |
| **Dysfonctionnements** | Bugs critiques en prod | 0 |

## 3. Product Scope

### MVP - Minimum Viable Product

**Acheteur :**
- Parcourir événements (liste + recherche basique)
- Créer compte / Se connecter (email)
- Acheter billets (multi-catégories)
- Payer par CB (Stripe)
- Recevoir billet QR (Email)

**Organisateur :**
- Créer compte organisateur
- Dashboard : créer événement (titre, description, date, lieu, prix, jauge)
- Définir catégories de billets
- Voir stats de vente basiques
- Scanner billets (PWA offline)

**Technique :**
- PWA responsive
- Mode offline pour scan
- Performance < 300ms

### Growth Features (Post-MVP)

- Envoi billet par WhatsApp
- Galerie photos événements
- Filtres avancés (date, lieu, type)
- Politique de remboursement configurable
- Stats avancées (graphiques, export)
- Plans d'abonnement premium

### Vision (Future)

- App native iOS/Android
- Multi-langue
- Places assignées (plans de salle)
- Intégration réseaux sociaux
- Programme de fidélité
- API pour partenaires

## 4. User Journeys

### Journey 1: Sophie achète son premier billet

**Persona :** Sophie, 28 ans, aime les concerts, découvre Event Cool via Instagram

**Parcours :**
1. Voit une pub pour un concert sur Instagram → clique
2. Arrive sur la page événement → voit les infos, prix
3. Choisit sa catégorie (Standard) et quantité (2 billets)
4. Crée son compte (email rapide)
5. Paye par CB (Stripe)
6. Reçoit ses billets par email avec QR codes
7. Le jour J, présente son QR → entre en 2 secondes

**Moment clé :** *"Wow, c'était trop rapide !"*

---

### Journey 2: Marc crée son premier événement

**Persona :** Marc, 35 ans, organise des soirées électro, veut digitaliser sa billetterie

**Parcours :**
1. S'inscrit comme organisateur
2. Accède à son dashboard
3. Crée un événement : nom, date, lieu, description, image
4. Configure 3 catégories : Early Bird (15€), Standard (25€), VIP (50€)
5. Définit les jauges par catégorie
6. Publie l'événement
7. Partage le lien sur ses réseaux
8. Suit les ventes en temps réel dans son dashboard

**Moment clé :** *"Mon événement est en ligne en 20 minutes !"*

---

### Journey 3: Marc scanne les billets le jour J

**Persona :** Marc (organisateur) ou son staff à l'entrée

**Parcours :**
1. Ouvre l'app PWA sur son téléphone
2. Se connecte à son compte organisateur
3. Sélectionne l'événement du jour
4. Active le mode scan (télécharge les billets en cache)
5. Scanne les QR codes des participants
6. Voit instantanément : ✅ Valide ou ❌ Déjà utilisé/Invalide
7. Continue même sans connexion internet

**Moment clé :** *"Ça marche même dans le sous-sol sans réseau !"*

---

### Journey 4: Admin gère la plateforme

**Persona :** Laurent, admin d'Event Cool

**Parcours :**
1. Se connecte au backoffice admin
2. Voit le dashboard global : événements, ventes, revenus
3. Peut modérer un événement signalé
4. Gère les organisateurs (activation/désactivation)
5. Consulte les transactions et commissions
6. Exporte les données pour comptabilité

**Moment clé :** *"Je vois tout ce qui se passe sur ma plateforme"*

---

### Journey 5: Lucas, staff contrôleur invité

**Persona :** Lucas, 22 ans, ami de Marc, aide bénévolement à l'entrée

**Parcours :**
1. Reçoit un email d'invitation de Marc "Rejoins mon équipe pour [Nom événement]"
2. Clique sur le lien → crée un compte (ou se connecte)
3. Accepte l'invitation → accès limité au scan pour cet événement uniquement
4. Le jour J, ouvre l'app PWA sur son téléphone
5. Voit uniquement l'événement où il est staff
6. Active le mode scan → télécharge le cache
7. Scanne les billets comme Marc
8. N'a PAS accès aux stats, revenus, ou modification de l'événement

**Moment clé :** *"Je scanne direct, pas besoin de formation !"*

---

### Journey 6: Sophie ne reçoit pas son billet (Edge Case)

**Persona :** Sophie, après son achat, n'a pas reçu l'email

**Parcours :**
1. Sophie paye → confirmation à l'écran "Billet envoyé par email"
2. Vérifie sa boîte mail... rien (spam ? erreur ?)
3. Panique légère 😰
4. Retourne sur Event Cool → se connecte à son compte
5. Va dans "Mes billets" → voit son achat avec le QR code directement
6. Peut : Télécharger le PDF, Renvoyer l'email, Copier le lien du billet
7. Soulagement 😌 → elle a son billet

**Parcours alternatif (achat guest) :**
1. Sophie a acheté sans créer de compte
2. Utilise "Retrouver mon billet" avec son email + n° de commande
3. Reçoit un lien de récupération
4. Accède à son billet

**Moment clé :** *"Ouf, je peux récupérer mon billet moi-même !"*

---

### Journey Requirements Summary

| Capability | Révélée par Journey |
|------------|---------------------|
| Catalogue événements + page détail | J1 |
| Inscription/Connexion rapide | J1, J5 |
| Panier + Checkout Stripe | J1 |
| Génération QR + envoi email | J1 |
| Espace "Mes billets" | J6 |
| Récupération billet guest | J6 |
| Dashboard organisateur | J2 |
| Création événement (infos, catégories, jauges) | J2 |
| Stats de vente temps réel | J2 |
| Mode scan PWA offline | J3, J5 |
| Système invitation staff | J5 |
| Rôle Staff (permissions limitées) | J5 |
| Backoffice admin | J4 |
| Modération événements | J4 |
| Gestion organisateurs | J4 |
| Dashboard revenus/commissions | J4 |

## 5. Domain-Specific Requirements

### Compliance & Réglementaire

| Exigence | Impact | Responsabilité |
|----------|--------|----------------|
| **RGPD** | Consentement, droit à l'oubli, portabilité | Event Cool |
| **PCI-DSS** | Sécurité paiements CB | Stripe (délégué) |
| **Droit conso français** | Droit de rétractation, CGV | Event Cool |
| **Facturation** | Factures conformes, TVA | Event Cool |

### Contraintes Techniques

| Contrainte | Détail |
|------------|--------|
| **Données personnelles** | Chiffrement au repos, logs d'accès |
| **Consentement cookies** | Bannière RGPD obligatoire |
| **Conservation données** | Durée légale (factures 10 ans, données perso limitée) |
| **Sécurité comptes** | Hashage mots de passe (bcrypt), 2FA optionnel |

### Risques & Mitigations

| Risque | Mitigation |
|--------|------------|
| Fraude CB | Stripe Radar + 3D Secure |
| Revente billets | QR unique, nom sur billet |
| Double scan | Statut temps réel + sync offline |
| Faux événements | Modération admin |

## 6. Web App (PWA) Specific Requirements

### Project-Type Overview

| Aspect | Décision |
|--------|----------|
| **Type** | SPA (Single Page Application) / PWA |
| **Rendu** | Client-side avec SSR pour SEO (Inertia.js) |
| **Installation** | Add to Home Screen (PWA) |
| **Offline** | Service Worker pour scan billets |

### Browser Support Matrix

| Navigateur | Version Min | Support |
|------------|-------------|---------|
| Chrome | 90+ | Full |
| Firefox | 90+ | Full |
| Safari | 14+ | Full |
| Edge | 90+ | Full |
| Chrome Mobile | 90+ | Full (prioritaire) |
| Safari iOS | 14+ | Full (prioritaire) |

### Responsive Design

| Breakpoint | Cible | Priorité |
|------------|-------|----------|
| Mobile | < 768px | Prioritaire (mobile-first) |
| Tablet | 768px - 1024px | Important |
| Desktop | > 1024px | Supporté |

### Performance Targets

| Métrique | Cible |
|----------|-------|
| **FCP** (First Contentful Paint) | < 1.5s |
| **LCP** (Largest Contentful Paint) | < 2.5s |
| **TTI** (Time to Interactive) | < 3s |
| **API Response** | < 300ms |
| **Lighthouse Score** | > 90 |

### SEO Strategy

| Page | Indexable | Priorité |
|------|-----------|----------|
| Accueil | Oui | Haute |
| Catalogue événements | Oui | Haute |
| Page événement | Oui (Schema.org Event) | Haute |
| Dashboard organisateur | Non (noindex) | - |
| Checkout / Paiement | Non (noindex) | - |

### Real-Time Features

| Feature | Utilisateur | Technologie |
|---------|-------------|-------------|
| Stats ventes live | Organisateur | WebSocket / Laravel Echo |
| Jauge restante | Acheteur | Polling ou WebSocket |
| Notifications scan | Organisateur | Push / WebSocket |

### Accessibility (WCAG AA)

| Critère | Implémentation |
|---------|----------------|
| **Contraste** | Ratio minimum 4.5:1 |
| **Navigation clavier** | Tab, Enter, Escape fonctionnels |
| **Focus visible** | Outline visible |
| **Labels** | Tous les inputs avec labels |
| **Alt text** | Images avec attribut alt |
| **ARIA** | Landmarks, roles, live regions |

### PWA Capabilities

| Capability | Utilisation |
|------------|-------------|
| **Service Worker** | Cache offline pour scan |
| **Web App Manifest** | Installation home screen |
| **IndexedDB** | Stockage billets offline |
| **Camera API** | Scan QR code |

## 7. Project Scoping & Phased Development

### MVP Strategy & Philosophy

**Approche :** MVP "Problem-Solving" - résoudre le problème core avant d'ajouter du nice-to-have.

**Question clé :** Quel est le minimum pour que l'organisateur dise "c'est utile" et l'acheteur dise "c'était simple" ?

### MVP Feature Set (Phase 1)

**Journeys Supportés :**
- J1 : Sophie achète un billet (happy path)
- J2 : Marc crée un événement
- J3 : Marc scanne les billets
- J6 : Récupération billet (version simplifiée)

**Must-Have Capabilities :**

| Module | Fonctionnalités |
|--------|-----------------|
| **Auth** | Inscription/Connexion email |
| **Événements** | CRUD événement, catégories billets, publication |
| **Achat** | Sélection billets, checkout Stripe, confirmation |
| **Billets** | Génération QR, envoi email, page "Mes billets" |
| **Scan** | PWA scan QR, mode offline basique |
| **Dashboard Orga** | Liste événements, stats basiques |

**Explicitement OUT du MVP :**
- Invitation staff (scan multi-utilisateurs)
- Envoi WhatsApp
- Galerie photos événement
- Stats temps réel (WebSocket)
- Filtres avancés catalogue
- Backoffice admin complet

### Post-MVP Features

**Phase 2 - Growth :**
- Invitation staff pour scan
- Stats temps réel (WebSocket)
- Envoi billets WhatsApp
- Filtres avancés catalogue
- Backoffice admin complet

**Phase 3 - Expansion :**
- Plans abonnement organisateurs
- Galerie photos événements
- API partenaires
- Multi-langue

### Risk Mitigation Strategy

| Risque | Type | Mitigation |
|--------|------|------------|
| Offline scan | Technique | POC early, test sur vrais devices |
| Stripe integration | Technique | Utiliser Stripe Checkout (hosted) |
| Adoption organisateurs | Marché | 5-10 beta testers ciblés |
| Scope creep | Ressource | Discipline stricte sur MVP |

## 8. Functional Requirements

### Gestion des Comptes

- **FR1:** Un visiteur peut créer un compte avec son email
- **FR2:** Un utilisateur peut se connecter à son compte
- **FR3:** Un utilisateur peut réinitialiser son mot de passe
- **FR4:** Un utilisateur peut se déconnecter
- **FR5:** Un utilisateur peut choisir son rôle (acheteur ou organisateur)

### Catalogue Événements

- **FR6:** Un visiteur peut voir la liste des événements publiés
- **FR7:** Un visiteur peut voir le détail d'un événement (infos, date, lieu, prix)
- **FR8:** Un visiteur peut rechercher un événement par mot-clé
- **FR9:** Un visiteur peut voir les catégories de billets disponibles et leurs prix

### Achat de Billets

- **FR10:** Un acheteur peut sélectionner une catégorie de billet
- **FR11:** Un acheteur peut choisir la quantité de billets
- **FR12:** Un acheteur peut voir le récapitulatif de sa commande avant paiement
- **FR13:** Un acheteur peut payer par carte bancaire
- **FR14:** Un acheteur reçoit une confirmation de commande à l'écran
- **FR15:** Un acheteur reçoit ses billets par email après paiement

### Gestion des Billets (Acheteur)

- **FR16:** Un acheteur peut accéder à la liste de ses billets ("Mes billets")
- **FR17:** Un acheteur peut voir le QR code de chaque billet
- **FR18:** Un acheteur peut télécharger son billet en PDF
- **FR19:** Un acheteur peut demander le renvoi de son billet par email
- **FR20:** Un visiteur peut récupérer son billet avec email + n° de commande (achat guest)

### Gestion des Événements (Organisateur)

- **FR21:** Un organisateur peut créer un événement
- **FR22:** Un organisateur peut définir les informations d'un événement (titre, description, date, lieu, image)
- **FR23:** Un organisateur peut créer plusieurs catégories de billets par événement
- **FR24:** Un organisateur peut définir le prix et la jauge de chaque catégorie
- **FR25:** Un organisateur peut publier un événement
- **FR26:** Un organisateur peut dépublier un événement
- **FR27:** Un organisateur peut modifier un événement
- **FR28:** Un organisateur peut supprimer un événement (si aucune vente)

### Dashboard Organisateur

- **FR29:** Un organisateur peut voir la liste de ses événements
- **FR30:** Un organisateur peut voir les statistiques de vente d'un événement
- **FR31:** Un organisateur peut voir la liste des billets vendus
- **FR32:** Un organisateur peut voir le montant total des ventes

### Scan & Contrôle d'Accès

- **FR33:** Un organisateur peut accéder au mode scan sur son mobile
- **FR34:** Un organisateur peut scanner un QR code de billet
- **FR35:** Un organisateur peut voir le résultat du scan (valide/invalide/déjà utilisé)
- **FR36:** Un organisateur peut scanner des billets sans connexion internet (mode offline)
- **FR37:** Le système synchronise les scans offline quand la connexion revient

## 9. Non-Functional Requirements

### Performance

| NFR | Cible |
|-----|-------|
| **NFR-P1** | Temps de réponse API < 300ms |
| **NFR-P2** | First Contentful Paint < 1.5s |
| **NFR-P3** | Time to Interactive < 3s |
| **NFR-P4** | Temps de scan QR < 2s (feedback visuel) |
| **NFR-P5** | Lighthouse Score > 90 |

### Security

| NFR | Exigence |
|-----|----------|
| **NFR-S1** | Mots de passe hashés avec bcrypt (rounds ≥ 12) |
| **NFR-S2** | Communications HTTPS uniquement |
| **NFR-S3** | Tokens sessions expirables (24h par défaut) |
| **NFR-S4** | QR codes non prédictibles (UUID + signature) |
| **NFR-S5** | Protection CSRF sur tous les formulaires |
| **NFR-S6** | Rate limiting sur endpoints sensibles |
| **NFR-S7** | Paiements délégués à Stripe (PCI-DSS compliant) |

### Scalability

| NFR | Cible |
|-----|-------|
| **NFR-SC1** | Support 100 utilisateurs concurrents (MVP) |
| **NFR-SC2** | Support 10 événements actifs simultanés |
| **NFR-SC3** | Support 1000 scans/heure par événement |
| **NFR-SC4** | Architecture stateless (scale horizontal) |

### Accessibility (WCAG AA)

| NFR | Exigence |
|-----|----------|
| **NFR-A1** | Contraste couleurs ratio ≥ 4.5:1 |
| **NFR-A2** | Navigation clavier complète |
| **NFR-A3** | Focus visible sur éléments interactifs |
| **NFR-A4** | Labels sur tous les inputs |
| **NFR-A5** | Alt text sur toutes les images |
| **NFR-A6** | Support zoom 200% sans perte |

### Integration

| NFR | Exigence |
|-----|----------|
| **NFR-I1** | Stripe Checkout pour paiements |
| **NFR-I2** | Stripe Webhooks pour confirmation asynchrone |
| **NFR-I3** | Service email transactionnel (SMTP ou API) |
| **NFR-I4** | Timeout intégrations externes : 30s max |

### Reliability

| NFR | Cible |
|-----|-------|
| **NFR-R1** | Uptime 99.5% (hors maintenance planifiée) |
| **NFR-R2** | Mode offline scan : 100% fonctionnel sans réseau |
| **NFR-R3** | Sync offline → online sans perte de données |
| **NFR-R4** | Backup base de données quotidien |
| **NFR-R5** | RTO (Recovery Time Objective) < 4h |

