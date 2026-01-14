# BMad Method - Framework de Développement Assisté par IA 🧙

Bienvenue dans **BMad Method** (Build More, Architect Dreams) !

## Agents Disponibles

| Agent | Commande | Rôle |
|-------|----------|------|
| 📊 Mary (Analyst) | `/bmad/analyst` | Business Analyst - Recherche, brainstorming, product brief |
| 📋 John (PM) | `/bmad/pm` | Product Manager - PRD, epics, stories |
| 🏗️ Winston (Architect) | `/bmad/architect` | System Architect - Architecture technique |
| 🏃 Bob (SM) | `/bmad/sm` | Scrum Master - Sprint planning, création de stories |
| 💻 Amelia (Dev) | `/bmad/dev` | Developer - Implémentation des stories |

## Les 4 Phases du Développement

```
Phase 1: ANALYSE (optionnel)
  └─> Brainstorming, Recherche, Product Brief

Phase 2: PLANIFICATION (requis)
  └─> PRD (Product Requirements Document)

Phase 3: SOLUTIONING (requis pour BMad Method)
  └─> Architecture → Epics & Stories

Phase 4: IMPLÉMENTATION
  └─> Sprint Planning → Create Story → Dev Story → Code Review
```

## Quick Start

### 1. Initialiser le projet
```
/bmad/analyst puis *workflow-status
```

### 2. Créer le PRD
```
/bmad/pm puis *create-prd
```

### 3. Créer l'Architecture
```
/bmad/architect puis *create-architecture
```

### 4. Créer Epics & Stories
```
/bmad/pm puis *epics-stories
```

### 5. Sprint Planning
```
/bmad/sm puis *sprint-planning
```

### 6. Implémenter
```
/bmad/dev puis *dev-story
```

## Dossiers Importants

- `_bmad/` - Configuration et agents BMad
- `_bmad-output/` - Artefacts générés (PRD, Architecture, Stories)
- `.claude/commands/bmad/` - Commandes Claude Code

## Conseil Important
**Utilisez toujours un nouveau chat** pour chaque workflow afin d'éviter les problèmes de contexte.

## Pour Commencer
Charge un agent ci-dessus avec sa commande, ou décris-moi ton projet !
