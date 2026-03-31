# Project Structure

Every NeoFront application lives in `packages/app-<name>/`. This document
explains every file and folder you will encounter.

---

## Repository layout

```
nf-core/
├── schemas/                  ← JSON schemas (source of truth for JSON shape)
│   ├── app.schema.json
│   ├── fields.schema.json
│   ├── form.schema.json
│   ├── listview.schema.json
│   ├── menu.schema.json
│   ├── records.schema.json
│   ├── views.schema.json
│   └── common.schema.json    ← shared $defs used by other schemas
├── scripts/                  ← validation tooling
│   ├── ai-check.js           ← main validator (runs below three)
│   ├── schema-validator.js
│   ├── json-validator.js
│   └── metadata-analyzer.js
├── ai/                       ← AI context + examples
│   ├── README.md
│   ├── CONTEXT.md            ← dense single-file AI reference
│   └── examples/
├── packages/
│   ├── neofront/             ← engine (never touch for project work)
│   ├── app-demo/             ← example project (mock data)
│   ├── app-ssaa/             ← example project (API mode)
│   └── mysql-api/            ← test MySQL backend
└── docs/                     ← this documentation
```

---

## App package layout

```
packages/app-<name>/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/                   ← static assets (logos, icons, images)
├── src/
│   ├── main.tsx              ← entry: wires metadata + data into <App>
│   └── styles/
│       ├── theme.css         ← Mantine CSS variable overrides
│       └── app.css           ← global app styles
└── project/                  ← ALL runtime configuration lives here
    ├── app.json              ← shell, theme, controls, toolbar defaults
    ├── menu.json             ← navigation
    ├── login.json            ← login form
    └── views/
        ├── views.json        ← list of active view names
        ├── metadataloader.js ← imports and re-exports all view JSONs
        ├── dataloader.js     ← imports and re-exports all mock data
        ├── _common/          ← shared options tables used across views
        │   └── <table>.json
        └── <viewName>/       ← one folder per view
            ├── fields.json   ← field definitions (column + form)
            ├── listview.json ← table/list configuration
            ├── form.json     ← form layout
            ├── data.json     ← mock data records
            └── <options>.json← options tables for select fields
```

---

## `project/` files

### `app.json`
The central application configuration. Defines the shell layout, theme,
toolbar defaults, global control library, and list/form appearance defaults.
Every other file references controls defined here.

See [app.json reference](reference/app.md).

### `menu.json`
Defines the main navigation menu: items, submenus, badges, and icons.

See [menu.json reference](reference/menu.md).

### `login.json`
Defines the login form layout and fields. Can also be defined inline inside
`app.json` under the `login` key — both patterns are supported.

See [login.json reference](reference/login.md).

### `views/views.json`
Lists which view folders are active. Only views listed here are loaded.

```json
{ "active": ["empresas", "usuarios", "produtos"] }
```

### `views/metadataloader.js`
Imports `listview.json`, `form.json`, and `fields.json` for every active view
and re-exports them in the shape the engine expects:

```js
export default {
  listView:    { viewName: listviewJson, ... },
  form:        { viewName: formJson, ... },
  fieldConfig: { viewName: fieldsJson, ... },
};
```

### `views/dataloader.js`
Imports `data.json` for every view **and** all options table JSONs, then
re-exports them as a flat `Record<tableName, object[]>`:

```js
export default {
  usuarios,
  permissoes_usuario,   // ← options table, not a view
  empresas,
  status_empresa,       // ← options table
  ufs,                  // ← from _common/
};
```

The key names must match the `options.table` values used in `fields.json`.

---

## `views/<viewName>/` files

### `fields.json`
The most central file. Defines every field used by both the list table and
the form. Each field is a named entry that holds column rendering config,
form rendering config, data type, options, masks, and validation rules.

See [fields.json reference](reference/fields.md).

### `listview.json`
Defines which fields appear as table columns, what actions are available per
row, toolbar items, and the filter panel layout.

See [listview.json reference](reference/listview.md).

### `form.json`
Defines the form layout for add/edit/detail operations: sections, columns,
tabs, and embedded sub-lists.

See [form.json reference](reference/form.md).

### `data.json`
Array of mock data records. Used when `data.source` is `"mock"` in `app.json`.
Each object in the array is one record. Field names should match the
`accessor` values in `fields.json`.

### `<options_table>.json`
Options arrays for `select` fields. Each file is a table referenced by name
in `fields.json` under `options.table`. Format:

```json
[
  { "value": 1, "label": "Active",   "color": "green" },
  { "value": 2, "label": "Inactive", "color": "red"   }
]
```

### `_common/` folder
Options tables shared across multiple views. Place generic lookup tables here
(e.g. states/provinces, currencies). They are loaded in `dataloader.js` and
exported under their file-based key.

---

## `src/main.tsx`

The minimal bootstrap. It:

1. Imports all configuration and metadata
2. Passes everything to the `<App>` engine component
3. Does nothing else

```tsx
import { BrowserRouter } from "react-router-dom";
import { App, getRoot } from "@neofront/core";

import appCfg   from "project/app.json";
import menuCfg  from "project/menu.json";
import loginCfg from "project/login.json";
import viewsCfg from "project/views/views.json";
import metadata from "project/views/metadataloader.js";
import data     from "project/views/dataloader.js";

import "./styles/theme.css";
import "./styles/app.css";

getRoot().render(
  <BrowserRouter>
    <App
      appCfg={appCfg}
      menuCfg={menuCfg}
      loginCfg={loginCfg}
      activeViews={viewsCfg.active}
      metadata={metadata}
      mockData={data}
      // For API mode, use apiTableNames instead of mockData:
      // apiTableNames={["usuarios", "empresas"]}
    />
  </BrowserRouter>
);
```

Any app-specific data transformations (e.g. enriching API responses) belong
here or in a separate module in `src/`, passed via the `dataEnhancer` prop.
