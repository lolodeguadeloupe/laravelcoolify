---
stepsCompleted: [1, 2]
currentStep: completed
inputDocuments: ["CLAUDE.md"]
date: 2026-01-14
author: Laurent
project_name: Event Cool
status: completed
---

# Product Brief: Event Cool 🎫

## 1. Vision Produit

**Event Cool** est une plateforme de billetterie en ligne sous forme de **PWA** (Progressive Web App), conçue pour le marché français. Sa philosophie : **simple à prendre en main** pour les organisateurs comme pour les acheteurs.

### Proposition de Valeur
- Pour les **acheteurs** : Achat rapide, billets dématérialisés (QR code), reçus par Email et WhatsApp
- Pour les **organisateurs** : Création d'événements intuitive, scan hors-ligne, tableau de bord complet

---

## 2. Utilisateurs Cibles

| Persona | Description | Besoins Clés |
|---------|-------------|--------------|
| 🎫 **Acheteur** | Grand public français, achète des billets pour spectacles/concerts/soirées | Parcours d'achat simple, paiement CB sécurisé, billet accessible facilement |
| 🎪 **Organisateur** | Producteurs de spectacles, organisateurs de soirées, salles de concert | Création événements, gestion des ventes, scan billets sur place, suivi revenus |

---

## 3. Fonctionnalités MVP

### Côté Acheteur
| Fonctionnalité | Description |
|----------------|-------------|
| Catalogue événements | Parcourir les événements disponibles (spectacles, concerts, soirées) |
| Recherche & filtres | Trouver par date, lieu, type d'événement |
| Achat billets | Sélection catégorie (VIP, Standard, Early Bird...), quantité |
| Paiement CB | Intégration Stripe sécurisée |
| Billet numérique | QR code unique + numéro de référence |
| Notifications | Envoi par Email + WhatsApp |

### Côté Organisateur
| Fonctionnalité | Description |
|----------------|-------------|
| Inscription libre | Création de compte organisateur sans validation |
| Création événement | Titre, description, date, lieu, image, jauge |
| Catégories billets | Définir plusieurs catégories avec prix et quantités |
| Scanner PWA | Scan QR code avec mode hors-ligne |
| Tableau de bord | Stats de vente, revenus, liste des participants |
| Politique remboursement | Définie par l'organisateur |

---

## 4. Modèle Économique

| Source de Revenus | Description |
|-------------------|-------------|
| **Commission** | Pourcentage sur chaque vente (ex: 5%) + frais fixes |
| **Abonnement** | Plans mensuels pour organisateurs (fonctionnalités premium) |

---

## 5. Spécifications Techniques

| Aspect | Choix |
|--------|-------|
| **Stack** | Laravel 12 + React 19 + Inertia.js |
| **Type d'app** | PWA (Progressive Web App) |
| **Base de données** | PostgreSQL |
| **Paiement** | Stripe |
| **Notifications** | Email (Laravel Mail) + WhatsApp (API) |
| **QR Code** | Génération côté serveur, scan côté client |
| **Mode hors-ligne** | Service Worker + IndexedDB pour cache billets |

---

## 6. Contraintes & Hypothèses

### Contraintes
- Marché cible : **France uniquement** (conformité RGPD, Stripe FR)
- Pas de limite de jauge (petits < 500, moyens 500-2000, grands > 2000)

### Hypothèses
- Les organisateurs gèrent leur propre politique de remboursement
- L'inscription organisateur est libre (pas de validation manuelle)
- WhatsApp Business API disponible pour l'envoi des billets

---

## 7. Métriques de Succès (MVP)

| Métrique | Objectif |
|----------|----------|
| Événements créés | 50+ dans les 3 premiers mois |
| Billets vendus | 1000+ dans les 3 premiers mois |
| Taux de scan réussi | > 95% |
| NPS Organisateurs | > 40 |

---

## 8. Prochaines Étapes

1. ✅ Product Brief (ce document)
2. ⏭️ PRD détaillé (`/bmad:pm` puis `*create-prd`)
3. ⏭️ Architecture technique (`/bmad:architect`)
4. ⏭️ Epics & Stories (`/bmad:pm` puis `*epics-stories`)

---

*Document généré avec BMad Method - Mary (Analyst) 📊*
