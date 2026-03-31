# NeoFront Architecture

NeoFront is a **metadata-driven SPA framework** for web management systems. The
central idea: UI structure, navigation, forms, and tables are defined in JSON,
not in React. Adding a new feature means writing JSON, not rewriting components.

---

## Core principle: Metadata authority

```
JSON metadata  →  engine renders  →  user sees UI
```

- The JSON files in `project/` describe *what* to show.
- The engine (`packages/neofront/`) decides *how* to show it.
- React components inside the engine contain zero domain or project knowledge.

If you find yourself encoding business logic or structure in React, you are
outside the architecture.

---

## The two layers

```
┌─────────────────────────────────────────┐
│  packages/app-*/                        │
│  Project layer                          │
│  ┌────────────┐  ┌────────────────────┐ │
│  │ project/   │  │  src/main.tsx      │ │
│  │ JSON files │  │  (thin bootstrap)  │ │
│  └────────────┘  └────────────────────┘ │
│  Responsible for: data loading,         │
│  backend integration, runtime wiring    │
├─────────────────────────────────────────┤
│  packages/neofront/                     │
│  Engine layer                           │
│  ┌──────────────────────────────────┐   │
│  │  components/  contexts/  src/    │   │
│  └──────────────────────────────────┘   │
│  Generic, metadata-driven, project-     │
│  agnostic. Never imports from app-*.    │
└─────────────────────────────────────────┘
```

The engine receives everything it needs as **React props** — `appCfg`,
`menuCfg`, `loginCfg`, `activeViews`, `metadata`, `mockData`. It never
fetches data, never reads files, never knows about your domain.

---

## Data flow at runtime

```
main.tsx
  ├── imports app.json        → appCfg
  ├── imports menu.json       → menuCfg
  ├── imports login.json      → loginCfg
  ├── imports views.json      → activeViews[]
  ├── imports metadataloader  → metadata { listView, form, fieldConfig }
  └── imports dataloader      → mockData  (or passes apiTableNames for API mode)

<App appCfg menuCfg loginCfg activeViews metadata mockData />
  └── Engine builds the full application from those props
```

---

## Source of truth per concern

| Concern | Source of truth |
|---------|----------------|
| JSON shapes and allowed values | `schemas/*.schema.json` |
| App configuration (shell, theme, controls) | `packages/app-*/project/app.json` |
| Navigation | `packages/app-*/project/menu.json` |
| Login screen | `packages/app-*/project/login.json` |
| Which views are active | `packages/app-*/project/views/views.json` |
| View structure (fields, form, list) | `packages/app-*/project/views/<name>/` |
| Mock data | `packages/app-*/project/views/<name>/data.json` |
| Options tables | `packages/app-*/project/views/<name>/<table>.json` or `_common/<table>.json` |
| Real API | `packages/mysql-api/` (test backend only) |

---

## Metadata shape consumed by the engine

```ts
// What metadataloader.js must export
{
  listView:    Record<viewName, ListViewConfig>,
  form:        Record<viewName, FormConfig>,
  fieldConfig: Record<viewName, FieldsConfig>,
}

// What dataloader.js must export (mock mode)
Record<tableName, object[]>
// Keys = view names + options table names
```

---

## What the engine never does

- Fetch data (all data arrives as props)
- Import from any `packages/app-*` path
- Branch on domain entities (empresa, usuario, etc.)
- Use inline styles or hardcoded colors (always Mantine theme tokens)
- Create new global context when `useAppUI` already provides the data

Violations of these rules in engine code are bugs, not features.

---

## What belongs where

| Item | Engine (`packages/neofront`) | Project (`packages/app-*`) |
|------|------------------------------|---------------------------|
| Form renderer | ✓ | |
| Table renderer | ✓ | |
| Shell layout | ✓ | |
| Field definitions | | ✓ `fields.json` |
| Navigation items | | ✓ `menu.json` |
| Theme colors/logos | | ✓ `app.json` |
| Mock data | | ✓ `data.json` |
| API wiring | | ✓ `main.tsx` / `dataloader.js` |
| Domain-specific logic | | ✓ (never in engine) |

---

## Validation

The `npm run ai:check` command runs three validators sequentially:

1. **schema-validator** — checks all schema files are internally consistent
2. **json-validator** — validates every project JSON against its schema
3. **metadata-analyzer** — cross-file consistency checks (e.g. fields referenced
   in listview exist in fields.json)

Run it after every JSON edit. Target a specific project with `--project`.
