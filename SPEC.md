# Spécification fonctionnelle — Todo App Next.js (Benchmark)

Référence : issue #1 — `[PROJET] Todo App Next.js — Benchmark`
Repo : `YoLoADR/todo-guyane`
Stack : Next.js 16.3.0 (App Router, TS strict) · SQLite (better-sqlite3) · Drizzle ORM · Zod · Vitest + RTL · Tailwind CSS · lucide-react
Design System : Merenza (dark-first, zinc + amber, bordures > ombres)

---

## 1. Objectif

Fournir une application Todo single-page (App Router) permettant de créer, organiser, filtrer et suivre des tâches via un Kanban drag & drop, avec basculement dark/light persisté. L'app sert de benchmark de productivité pour l'équipe Guyane (VM 102).

## 2. Périmètre

### In scope
- CRUD complet des tâches (titre, description, priorité, catégorie, date d'échéance, statut).
- Kanban 3 colonnes (À faire, En cours, Terminé) avec drag & drop.
- Filtres avancés (priorité, catégorie, statut, recherche texte).
- Toggle dark/light avec persistance localStorage.
- API REST interne (Route Handlers Next.js) testée unitairement.
- Design System Merenza : 6 composants min., tokens `--mrz-*`, accessibilité.

### Out of scope
- Authentification / multi-utilisateur.
- Synchronisation temps réel (WebSockets).
- Notifications push.
- Backend hébergé (SQLite local uniquement).

## 3. Modèle de données

### Table `tasks`

| Champ         | Type      | Contraintes                                     |
|---------------|-----------|-------------------------------------------------|
| id            | INTEGER   | PK, auto-increment                              |
| title         | TEXT      | NOT NULL, 1–200 caractères                       |
| description   | TEXT      | NULL, max 2000 caractères                       |
| priority      | TEXT      | NOT NULL, enum `low` \| `medium` \| `high`        |
| category      | TEXT      | NULL, max 50 caractères                          |
| dueDate       | TEXT      | NULL, ISO 8601 (date)                           |
| status        | TEXT      | NOT NULL, enum `todo` \| `in_progress` \| `done`|
| createdAt     | TEXT      | NOT NULL, ISO 8601 (datetime)                   |
| updatedAt     | TEXT      | NOT NULL, ISO 8601 (datetime)                   |

### Schéma Drizzle

```ts
// db/schema.ts
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull(),
  category: text("category"),
  dueDate: text("due_date"),
  status: text("status", { enum: ["todo", "in_progress", "done"] }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### Validation Zod (schémas partagés)

```ts
// lib/validations.ts
export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high"]),
  category: z.string().max(50).optional(),
  dueDate: z.string().datetime().optional(),
});
export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(["todo", "in_progress", "done"]),
});
```

## 4. Architecture

```
src/
├── app/
│   ├── layout.tsx              # ThemeProvider, data-theme sur <html>
│   ├── page.tsx                # Kanban board (CSR)
│   ├── api/
│   │   └── tasks/
│   │       ├── route.ts         # GET (list+filters), POST (create)
│   │       └── [id]/
│   │           └── route.ts    # GET, PATCH, DELETE
├── components/
│   ├── merenza/                # Button, Input, Badge, Card, EmptyState, PageHeader
│   ├── kanban/                 # Board, Column, TaskCard, useDragDrop
│   ├── filters/                # FilterBar, SearchInput, PriorityFilter, CategoryFilter, StatusFilter
│   └── theme/                  # ThemeProvider, ThemeToggle, useTheme
├── db/
│   ├── schema.ts               # Drizzle schema
│   ├── client.ts               # better-sqlite3 instance + drizzle()
│   └── migrations/             # SQL migrations
├── lib/
│   ├── validations.ts          # Zod schemas (shared API + UI)
│   └── utils.ts                # cn(), date formatting
└── tests/
    ├── api/                    # tests intégration Route Handlers
    ├── components/             # tests RTL (Merenza, Kanban, Filters)
    └── e2e/                    # tests Playwright (optionnel)
```

## 5. API REST

| Méthode | Route              | Description                              | Query params                          |
|---------|--------------------|-------------------------------------------|---------------------------------------|
| GET     | `/api/tasks`       | Liste paginée, filtrée                    | `priority`, `category`, `status`, `q` |
| POST    | `/api/tasks`       | Crée une tâche                            | —                                     |
| GET     | `/api/tasks/:id`   | Récupère une tâche                        | —                                     |
| PATCH   | `/api/tasks/:id`   | Modifie une tâche (partial update)        | —                                     |
| DELETE  | `/api/tasks/:id`   | Supprime une tâche                        | —                                     |

### Codes de retour

| Situation                | Code |
|--------------------------|------|
| Succès (GET, PATCH)      | 200  |
| Création (POST)          | 201  |
| Suppression (DELETE)     | 204  |
| Validation échouée        | 400  |
| Ressource introuvable     | 404  |
| Erreur serveur            | 500  |

### Exemples

**POST /api/tasks**
```json
{
  "title": "Corriger bug login",
  "description": "Le bouton ne répond pas sur Safari",
  "priority": "high",
  "category": "Frontend",
  "dueDate": "2026-08-10T00:00:00.000Z"
}
```

**Réponse 201**
```json
{
  "id": 1,
  "title": "Corriger bug login",
  "description": "Le bouton ne répond pas sur Safari",
  "priority": "high",
  "category": "Frontend",
  "dueDate": "2026-08-10T00:00:00.000Z",
  "status": "todo",
  "createdAt": "2026-08-04T14:00:00.000Z",
  "updatedAt": "2026-08-04T14:00:00.000Z"
}
```

## 6. Design System Merenza — Conformité

### Tokens CSS (`globals.css`)

```css
:root,
[data-theme="dark"] {
  --mrz-bg: #18181b;          /* zinc-900 */
  --mrz-surface: #27272a;     /* zinc-800 */
  --mrz-border: #3f3f46;      /* zinc-700 */
  --mrz-text: #fafafa;        /* zinc-50 */
  --mrz-text-muted: #a1a1aa;  /* zinc-400 */
  --mrz-accent: #f59e0b;      /* amber-500 */
  --mrz-accent-hover: #d97706;/* amber-600 */
  --mrz-radius-sm: 6px;
  --mrz-radius-md: 8px;
  --mrz-shadow: none;         /* pas d'ombres en dark */
  --mrz-transition: 150ms ease;
}

[data-theme="light"] {
  --mrz-bg: #fafafa;
  --mrz-surface: #ffffff;
  --mrz-border: #e4e4e7;
  --mrz-text: #18181b;
  --mrz-text-muted: #71717a;
  --mrz-accent: #f59e0b;
  --mrz-accent-hover: #d97706;
  --mrz-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
```

### Composants requis (6 minimum)

| Composant    | Variants / Props                                                    | Remarques                              |
|--------------|---------------------------------------------------------------------|----------------------------------------|
| Button       | `primary` `secondary` `ghost` `danger` × `sm` `md` `lg`             | focus ring `ring-2 ring-amber-500/50`  |
| Input        | `label`, `error`, `icon` (lucide), `type`                           | `aria-invalid` si error                |
| Badge        | 11 variants (priority × 3, status × 3, category, default, outline, success, danger) | `rounded-full`             |
| Card         | `padding` `sm` `md` `lg`, `interactive`, `selected`                 | bordure `--mrz-border`                |
| EmptyState   | `icon` (32px), `title`, `description`, `action`                      | lucide icon                            |
| PageHeader   | `title`, `subtitle`, `actions`                                      | —                                      |

### Règles non-négociables

1. Dark-first — `data-theme="dark"` par défaut sur `<html>`.
2. Palette zinc + amber uniquement — pas d'autres couleurs sémantiques.
3. Bordures > ombres — `box-shadow: none` en dark.
4. lucide-react — `currentColor`, taille 16/20/24/32px.
5. System fonts — `font-family: system-ui, -apple-system, sans-serif`.
6. Focus ring — `ring-2 ring-amber-500/50 ring-offset-2`.
7. Accessibilité — `aria-label`, `role="status"`, `role="alert"`, hiérarchie de titres, navigation clavier, `prefers-reduced-motion`.

## 7. Règles métier

| Règle | Description |
|-------|-------------|
| R1 | Le `title` est obligatoire (1–200 caractères). |
| R2 | La `priority` est obligatoire (`low`, `medium`, `high`), défaut `medium`. |
| R3 | Le `status` par défaut à la création est `todo`. |
| R4 | Le drag & drop met à jour le `status` : colonne « À faire » → `todo`, « En cours » → `in_progress`, « Terminé » → `done`. |
| R5 | Les filtres s'appliquent en combinaison (AND) sur la liste Kanban. |
| R6 | La recherche texte filtre sur `title` + `description` (case-insensitive, substring). |
| R7 | Le thème est persisté dans `localStorage("merenza-theme")`, fallback `prefers-color-scheme` → dark. |
| R8 | Toute modification met à jour `updatedAt`. |
| R9 | La suppression d'une tâche est définitive (pas de soft delete). |
| R10 | `dueDate` ne peut pas être dans le passé à la création (validation côté API). |

## 8. Tests

### Stratégie TDD

1. **RED** — écrire un test qui échoue.
2. **GREEN** — implémenter le minimum pour passer.
3. **REFACTOR** — nettoyer sans casser les tests.

### Couverture attendue

| Niveau      | Cible                                   | Outil         |
|-------------|-----------------------------------------|---------------|
| Unité       | Validations Zod, utils                  | Vitest        |
| Intégration | Route Handlers API (CRUD + filtres)    | Vitest        |
| Composant   | Merenza (6), Kanban, Filters            | RTL + Vitest  |
| E2E         | Flux critique (create → drag → done)    | Playwright (optionnel) |

## 9. User Stories (synthèse)

| #   | Titre                                          | Labels                  |
|-----|-----------------------------------------------|-------------------------|
| US1 | Créer une tâche                                | user-story, benchmark   |
| US2 | Lister et filtrer les tâches                   | user-story, benchmark   |
| US3 | Modifier une tâche                             | user-story, benchmark   |
| US4 | Supprimer une tâche                            | user-story, benchmark   |
| US5 | Glisser-déposer une tâche dans le Kanban        | user-story, benchmark   |
| US6 | Basculer entre dark et light theme              | user-story, benchmark   |
| US7 | Filtrer les tâches par priorité, catégorie, statut et recherche | user-story, benchmark |
| US8 | Composants Design System Merenza (6 min.)       | user-story, benchmark   |

---

## 10. User Stories Gherkin détaillées

### US1 — Créer une tâche

**En tant que** utilisateur
**Je veux** créer une tâche avec titre, description, priorité, catégorie et date d'échéance
**Afin de** suivre mes actions à accomplir

```gherkin
Fonctionnalité : Création d'une tâche

  Scénario : Création réussie avec tous les champs
    Étant donné que je suis sur la page d'accueil
    Quand je clique sur le bouton "Nouvelle tâche"
    Et que je remplis le titre avec "Corriger le bug de login"
    Et que je remplis la description avec "Le bouton ne répond pas sur Safari"
    Et que je sélectionne la priorité "Haute"
    Et que je remplis la catégorie avec "Frontend"
    Et que je sélectionne la date d'échéance "2026-08-10"
    Et que je clique sur "Enregistrer"
    Alors la tâche apparaît dans la colonne "À faire"
    Et la tâche a le statut "todo"
    Et un badge de priorité "Haute" est affiché

  Scénario : Création avec le strict minimum (titre + priorité par défaut)
    Étant donné que je suis sur la page d'accueil
    Quand je clique sur le bouton "Nouvelle tâche"
    Et que je remplis le titre avec "Acheter du café"
    Et que je clique sur "Enregistrer"
    Alors la tâche apparaît dans la colonne "À faire"
    Et la priorité par défaut est "Medium"

  Scénario : Création échoue sans titre
    Étant donné que je suis sur le formulaire de création
    Quand je laisse le titre vide
    Et que je clique sur "Enregistrer"
    Alors un message d'erreur "Le titre est obligatoire" est affiché
    Et la tâche n'est pas créée

  Scénario : Création échoue avec un titre trop long
    Étant donné que je suis sur le formulaire de création
    Quand je remplis le titre avec une chaîne de 201 caractères
    Et que je clique sur "Enregistrer"
    Alors un message d'erreur "Le titre doit faire moins de 200 caractères" est affiché

  Scénario : Création échoue avec une date d'échéance passée
    Étant donné que je suis sur le formulaire de création
    Quand je remplis le titre avec "Tâche rétroactive"
    Et que je sélectionne une date d'échéance antérieure à aujourd'hui
    Et que je clique sur "Enregistrer"
    Alors un message d'erreur "La date d'échéance ne peut pas être dans le passé" est affiché

  Scénario : API POST /api/tasks renvoie 201
    Étant donné une requête POST valide sur /api/tasks
    Quand j'envoie le corps JSON avec title, priority et category
    Alors la réponse a le statut 201
    Et le corps contient un id, un status "todo", createdAt et updatedAt

  Scénario : API POST /api/tasks renvoie 400 si validation échoue
    Étant donné une requête POST sur /api/tasks
    Quand j'envoie un corps sans title
    Alors la réponse a le statut 400
    Et le corps contient un tableau d'erreurs de validation
```

### US2 — Lister et filtrer les tâches

**En tant que** utilisateur
**Je veux** voir mes tâches organisées en colonnes Kanban
**Afin de** visualiser l'état d'avancement

```gherkin
Fonctionnalité : Affichage du Kanban

  Scénario : Le tableau Kanban affiche 3 colonnes
    Étant donné que je suis sur la page d'accueil
    Alors je vois 3 colonnes nommées "À faire", "En cours" et "Terminé"
    Et chaque colonne affiche le nombre de tâches qu'elle contient

  Scénario : Les tâches sont réparties selon leur statut
    Étant donné qu'il existe des tâches avec statut "todo", "in_progress" et "done"
    Quand je consulte le Kanban
    Alors les tâches "todo" sont dans la colonne "À faire"
    Et les tâches "in_progress" sont dans la colonne "En cours"
    Et les tâches "done" sont dans la colonne "Terminé"

  Scénario : État vide quand aucune tâche n'existe
    Étant donné qu'aucune tâche n'existe en base
    Quand je consulte le Kanban
    Alors chaque colonne affiche un composant EmptyState
    Et l'EmptyState a une icône lucide de 32px
    Et l'EmptyState propose une action "Créer une tâche"

  Scénario : API GET /api/tasks renvoie la liste
    Étant donné des tâches en base
    Quand j'envoie une requête GET sur /api/tasks
    Alors la réponse a le statut 200
    Et le corps est un tableau de tâches

  Scénario : API GET /api/tasks avec filtre priority=high
    Étant donné des tâches de priorités variées en base
    Quand j'envoie une requête GET sur /api/tasks?priority=high
    Alors la réponse ne contient que des tâches de priorité "high"
```

### US3 — Modifier une tâche

**En tant que** utilisateur
**Je veux** modifier le titre, la description, la priorité, la catégorie ou la date d'échéance d'une tâche
**Afin de** garder mes informations à jour

```gherkin
Fonctionnalité : Modification d'une tâche

  Scénario : Modification réussie du titre
    Étant donné qu'une tâche existe avec le titre "Ancien titre"
    Quand j'ouvre la tâche en édition
    Et que je modifie le titre en "Nouveau titre"
    Et que je clique sur "Enregistrer"
    Alors la tâche affiche "Nouveau titre" dans le Kanban
    Et le champ updatedAt est mis à jour

  Scénario : Modification de la priorité
    Étant donné qu'une tâche existe avec priorité "low"
    Quand je la passe en priorité "high"
    Et que je clique sur "Enregistrer"
    Alors le badge de priorité devient "Haute"

  Scénario : Modification échoue avec un titre vide
    Étant donné que j'édite une tâche existante
    Quand je vide le titre
    Et que je clique sur "Enregistrer"
    Alors un message d'erreur "Le titre est obligatoire" est affiché
    Et la tâche n'est pas modifiée

  Scénario : Modification du statut via édition
    Étant donné qu'une tâche existe avec statut "todo"
    Quand je modifie son statut en "in_progress"
    Et que je clique sur "Enregistrer"
    Alors la tâche se déplace dans la colonne "En cours"

  Scénario : API PATCH /api/tasks/:id renvoie 200
    Étant donné une tâche existante avec id 1
    Quand j'envoie une requête PATCH sur /api/tasks/1 avec {"title": "Modifié"}
    Alors la réponse a le statut 200
    Et le corps contient title "Modifié"
    Et updatedAt est postérieur à createdAt

  Scénario : API PATCH /api/tasks/999 renvoie 404
    Étant donné qu'aucune tâche n'a l'id 999
    Quand j'envoie une requête PATCH sur /api/tasks/999
    Alors la réponse a le statut 404

  Scénario : API PATCH avec validation invalide renvoie 400
    Étant donné une tâche existante
    Quand j'envoie une requête PATCH avec {"priority": "invalid"}
    Alors la réponse a le statut 400
```

### US4 — Supprimer une tâche

**En tant que** utilisateur
**Je veux** supprimer une tâche
**Afin de** nettoyer ma liste

```gherkin
Fonctionnalité : Suppression d'une tâche

  Scénario : Suppression avec confirmation
    Étant donné qu'une tâche existe dans le Kanban
    Quand je clique sur l'icône de suppression (Trash2, lucide)
    Alors une boîte de dialogue demande "Confirmer la suppression ?"
    Et que je clique sur "Supprimer"
    Alors la tâche disparaît du Kanban
    Et le compteur de la colonne est décrémenté

  Scénario : Annulation de la suppression
    Étant donné qu'une tâche existe
    Quand je clique sur l'icône de suppression
    Et que je clique sur "Annuler"
    Alors la tâche reste dans le Kanban

  Scénario : API DELETE /api/tasks/:id renvoie 204
    Étant donné une tâche existante avec id 1
    Quand j'envoie une requête DELETE sur /api/tasks/1
    Alors la réponse a le statut 204
    Et un GET ultérieur sur /api/tasks/1 renvoie 404

  Scénario : API DELETE /api/tasks/999 renvoie 404
    Étant donné qu'aucune tâche n'a l'id 999
    Quand j'envoie une requête DELETE sur /api/tasks/999
    Alors la réponse a le statut 404
```

### US5 — Glisser-déposer une tâche dans le Kanban

**En tant que** utilisateur
**Je veux** déplacer une tâche entre colonnes par glisser-déposer
**Afin de** mettre à jour son statut visuellement

```gherkin
Fonctionnalité : Drag & drop Kanban

  Scénario : Déplacement de "À faire" vers "En cours"
    Étant donné qu'une tâche existe dans la colonne "À faire"
    Quand je la glisse dans la colonne "En cours"
    Alors la tâche apparaît dans la colonne "En cours"
    Et son statut est "in_progress" en base
    Et le compteur "À faire" est décrémenté
    Et le compteur "En cours" est incrémenté

  Scénario : Déplacement de "En cours" vers "Terminé"
    Étant donné qu'une tâche existe dans la colonne "En cours"
    Quand je la glisse dans la colonne "Terminé"
    Alors la tâche apparaît dans la colonne "Terminé"
    Et son statut est "done" en base

  Scénario : Déplacement vers une colonne adjacente et retour
    Étant donné qu'une tâche est dans "En cours"
    Quand je la glisse vers "À faire"
    Alors son statut redevient "todo"
    Quand je la glisse à nouveau vers "En cours"
    Alors son statut redevient "in_progress"

  Scénario : API PATCH appelée lors du drop
    Étant donné qu'une tâche est glissée d'une colonne à une autre
    Alors une requête PATCH /api/tasks/:id est envoyée avec le nouveau status
    Et la réponse est 200

  Scénario : Échec réseau lors du drop
    Étant donné qu'une tâche est glissée
    Quand la requête PATCH échoue (réseau)
    Alors la tâche revient à sa position d'origine
    Et un message d'erreur "Échec de la mise à jour" est affiché (role="alert")

  Scénario : Accessibilité — déplacement clavier
    Étant donné qu'une tâche a le focus clavier
    Quand j'appuie sur la touche flèche droite
    Alors la tâche se déplace dans la colonne suivante
    Et un aria-live annonce "Tâche déplacée vers En cours"
```

### US6 — Basculer entre dark et light theme

**En tant que** utilisateur
**Je veux** basculer entre le thème sombre et clair
**Afin de** adapter l'affichage à mon environnement

```gherkin
Fonctionnalité : Toggle de thème dark/light

  Scénario : Thème dark par défaut
    Étant donné qu'aucune préférence n'est stockée
    Quand j'ouvre l'application pour la première fois
    Alors l'attribut data-theme de <html> est "dark"
    Et le fond est zinc-900 (#18181b)

  Scénario : Bascule vers light
    Étant donné que le thème actuel est "dark"
    Quand je clique sur le bouton de toggle (icône Sun, lucide)
    Alors l'attribut data-theme devient "light"
    Et le fond devient zinc-50 (#fafafa)
    Et localStorage("merenza-theme") contient "light"

  Scénario : Bascule vers dark
    Étant donné que le thème actuel est "light"
    Quand je clique sur le bouton de toggle (icône Moon, lucide)
    Alors l'attribut data-theme devient "dark"
    Et localStorage("merenza-theme") contient "dark"

  Scénario : Persistance du thème au rechargement
    Étant donné que localStorage contient "light"
    Quand je recharge la page
    Alors le thème reste "light"

  Scénario : Fallback prefers-color-scheme
    Étant donné qu'aucune préférence n'est stockée
    Et que prefers-color-scheme est "light"
    Quand j'ouvre l'application
    Alors le thème est "light"

  Scénario : Respect de prefers-reduced-motion
    Étant donné que prefers-reduced-motion est activé
    Alors les transitions CSS sont désactivées
```

### US7 — Filtrer les tâches par priorité, catégorie, statut et recherche texte

**En tant que** utilisateur
**Je veux** filtrer et rechercher mes tâches
**Afin de** trouver rapidement les tâches pertinentes

```gherkin
Fonctionnalité : Filtres avancés

  Scénario : Filtrer par priorité "Haute"
    Étant donné des tâches de priorités variées
    Quand je sélectionne le filtre priorité "Haute"
    Alors seules les tâches de priorité "high" sont affichées dans le Kanban
    Et les compteurs reflètent uniquement les tâches filtrées

  Scénario : Filtrer par catégorie "Frontend"
    Étant donné des tâches avec catégories "Frontend" et "Backend"
    Quand je sélectionne le filtre catégorie "Frontend"
    Alors seules les tâches de catégorie "Frontend" sont affichées

  Scénario : Filtrer par statut "Terminé"
    Étant donné des tâches dans toutes les colonnes
    Quand je sélectionne le filtre statut "Terminé"
    Alors seules les colonnes "Terminé" contient des tâches
    Et les colonnes "À faire" et "En cours" sont vides (EmptyState)

  Scénario : Recherche texte sur le titre
    Étant donné des tâches avec titres "Bug login", "Doc API", "Refacto DB"
    Quand je tape "login" dans la barre de recherche
    Alors seule la tâche "Bug login" est affichée

  Scénario : Recherche texte sur la description
    Étant donné une tâche avec description "Problème sur Safari"
    Quand je tape "Safari" dans la barre de recherche
    Alors cette tâche est affichée

  Scénario : Combinaison de filtres (AND)
    Étant donné des tâches variées
    Quand je sélectionne priorité "Haute" ET catégorie "Frontend"
    Alors seules les tâches avec priorité "high" ET catégorie "Frontend" sont affichées

  Scénario : Réinitialisation des filtres
    Étant donné que des filtres sont actifs
    Quand je clique sur "Réinitialiser les filtres"
    Alors toutes les tâches sont affichées
    Et les champs de filtre reviennent à leur valeur par défaut

  Scénario : API GET /api/tasks?priority=high&category=Frontend&q=login
    Étant donné des tâches variées en base
    Quand j'envoie une requête GET avec tous les filtres
    Alors seules les tâches correspondant à tous les critères sont renvoyées

  Scénario : Filtre ne correspond à aucune tâche
    Étant donné des filtres actifs
    Quand aucune tâche ne correspond
    Alors un EmptyState "Aucune tâche ne correspond à vos filtres" est affiché
```

### US8 — Composants Design System Merenza

**En tant que** développeur
**Je veux** implémenter les 6 composants Merenza
**Afin de** respecter le design system obligatoire

```gherkin
Fonctionnalité : Composants Merenza

  Scénario : Button — 4 variants et 3 tailles
    Étant donné le composant Button
    Quand je le rends avec variant "primary", "secondary", "ghost", "danger"
    Alors chaque variant utilise la palette zinc + amber
    Et le focus ring est ring-2 ring-amber-500/50 ring-offset-2
    Et les tailles sm/md/lg sont disponibles

  Scénario : Input — label, error, icon
    Étant donné le composant Input
    Quand je le rends avec un label "Titre" et une erreur "Obligatoire"
    Alors le label est associé via htmlFor/id
    Et aria-invalid="true" est présent
    Et l'icône lucide est affichée avec currentColor

  Scénario : Badge — 11 variants
    Étant donné le composant Badge
    Alors les variants disponibles sont : priority-low, priority-medium, priority-high, status-todo, status-in_progress, status-done, category, default, outline, success, danger
    Et le border-radius est rounded-full

  Scénario : Card — 3 paddings, interactive, selected
    Étant donné le composant Card
    Quand je le rends avec padding "sm", "md", "lg"
    Alors le padding interne correspond au token --mrz-spacing
    Et en mode interactive, un hover affiche une bordure --mrz-accent
    Et en mode selected, la bordure est --mrz-accent

  Scénario : EmptyState — icon 32px, title, description, action
    Étant donné le composant EmptyState
    Quand je le rends avec une icône lucide (32px), un title et une description
    Alors l'icône fait exactement 32px
    Et l'action est un Button Merenza

  Scénario : PageHeader — title, subtitle, actions
    Étant donné le composant PageHeader
    Quand je le rends avec title "Todo App", subtitle "Benchmark Haiti"
    Alors le titre est un <h1>
    Et le subtitle est un <p> sémantiquement subordonné

  Scénario : Tokens CSS --mrz-* présents
    Étant donné le fichier globals.css
    Alors les tokens --mrz-bg, --mrz-surface, --mrz-border, --mrz-text, --mrz-text-muted, --mrz-accent, --mrz-radius-sm, --mrz-radius-md, --mrz-transition sont définis
    Et les valeurs dark et light respectent la palette zinc + amber

  Scénario : Pas d'ombres en dark mode
    Étant donné le thème dark actif
    Alors --mrz-shadow est "none"
    Et aucun composant n'applique de box-shadow

---

## 11. CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
```

## 12. Définition of Done (par issue)

- [ ] Tests unitaires et d'intégration passent (Vitest).
- [ ] Lint (ESLint) et typecheck (tsc --noEmit) passent.
- [ ] Composants Merenza conformes (tokens, pas d'ombres en dark).
- [ ] Accessibilité validée (aria, clavier, contrastes).
- [ ] Code documenté (JSDoc).
- [ ] PR reviewée et approuvée.
- [ ] Kanban à jour.

---

*Spécification générée par Hermes Agent — PO autonomous mode.*

---

## 13. Synthèse des User Stories pour GitHub Issues

| Issue | Titre | Labels | Estimation |
|-------|-------|--------|------------|
| US1 | Créer une tâche | user-story, benchmark | 3 |
| US2 | Lister et filtrer les tâches | user-story, benchmark | 2 |
| US3 | Modifier une tâche | user-story, benchmark | 2 |
| US4 | Supprimer une tâche | user-story, benchmark | 1 |
| US5 | Glisser-déposer une tâche dans le Kanban | user-story, benchmark | 3 |
| US6 | Basculer entre dark et light theme | user-story, benchmark | 1 |
| US7 | Filtrer les tâches par priorité, catégorie, statut et recherche | user-story, benchmark | 2 |
| US8 | Composants Design System Merenza (6 min.) | user-story, benchmark | 3 |

### Dépendances entre User Stories

```
US8 (Merenza) ──┬── US1 (Créer)
                ├── US2 (Lister/Afficher)
                ├── US3 (Modifier)
                ├── US4 (Supprimer)
                └── US5 (Drag & Drop)

US1 ─── US2 ─── US5
 │        │
 └─── US7 (filtres dépend de l'affichage)
 US6 (indépendant)
```

### Ordre de réalisation recommandé

1. **US8** — Composants Merenza (fondation UI)
2. **US1** — Créer une tâche (API + UI)
3. **US2** — Lister et afficher en Kanban
4. **US5** — Drag & drop Kanban
5. **US3** — Modifier une tâche
6. **US4** — Supprimer une tâche
7. **US7** — Filtres avancés
8. **US6** — Toggle thème (indépendant, peut se faire à tout moment)