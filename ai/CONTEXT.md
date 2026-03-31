# NeoFront — AI Context Reference

> **Purpose:** Dense single-file reference for LLM-assisted engineering.
> Use this as system prompt context or attach it to any new chat session.
> For full human-readable docs see `docs/INDEX.md`.

---

## Mental model

```
schemas/          → source of truth for JSON shape
packages/app-*/   → source of truth for app metadata + mock data
  project/        → JSON config files (app.json, menu.json, login.json, views/)
  src/main.tsx    → thin bootstrap (wires JSON into <App>)
packages/neofront/→ engine (generic, never project-specific)
scripts/          → validators (run: npm run ai:check)
docs/             → human + AI documentation
```

**Architecture contract (never violate):**
- Engine components never import from `app-*`, never fetch data, never branch on domain entities.
- All UI structure originates from JSON metadata.
- Adding a feature = write/edit JSON, NOT rewrite React components.
- Only modify engine code to enable a reusable, generic metadata capability.

---

## Project file tree

```
project/
├── app.json              shell, theme, controls library, list/form defaults
├── menu.json             navigation items
├── login.json            login form (or inline in app.json login key)
└── views/
    ├── views.json        active view names list
    ├── metadataloader.js imports + re-exports { listView, form, fieldConfig }
    ├── dataloader.js     imports + re-exports { viewName: records[], tableName: options[] }
    ├── _common/          shared options tables
    │   └── <table>.json
    └── <viewName>/
        ├── fields.json   field definitions (column + form)
        ├── listview.json table columns, row actions, toolbar, filter panel
        ├── form.json     form layout (sections or tabs)
        ├── data.json     mock records
        └── <opts>.json   options table for select fields
```

---

## metadataloader.js pattern

```js
import list_X   from "./X/listview.json";
import form_X   from "./X/form.json";
import fields_X from "./X/fields.json";

export default {
  listView:    { X: list_X },
  form:        { X: form_X },
  fieldConfig: { X: fields_X },
};
```

## dataloader.js pattern

```js
import X          from "./X/data.json";
import opts_table from "./X/opts_table.json";

export default { X, opts_table };
```

## main.tsx pattern

```tsx
import { App, getRoot } from "@neofront/core";
import appCfg   from "project/app.json";
import menuCfg  from "project/menu.json";
import loginCfg from "project/login.json";
import viewsCfg from "project/views/views.json";
import metadata from "project/views/metadataloader.js";
import data     from "project/views/dataloader.js";

getRoot().render(
  <BrowserRouter>
    <App appCfg={appCfg} menuCfg={menuCfg} loginCfg={loginCfg}
         activeViews={viewsCfg.active} metadata={metadata} mockData={data} />
  </BrowserRouter>
);
// API mode: replace mockData with apiTableNames={["X", "Y"]}
```

---

## `fields.json` quick reference

```json
{
  "name": "<viewName>",
  "strings": { "singular": "item", "plural": "itens", "theItem": "o item" },
  "fields": {
    "<key>": { ...field props }
  }
}
```

### Field property table

| Property | Context | Type | Notes |
|----------|---------|------|-------|
| `dataType` | both | enum | `string` `integer` `decimal` `boolean` `date` `select` `image` `password` `passwordInput` `json` |
| `accessor` | both | string | Dot-path into record. Defaults to field key |
| `label` | form | string | Form label |
| `header` | column | string | Column header. `""` for no text |
| `colWidth` | column | int\|`"X%"` | px or %. `"100%"` fills remaining space |
| `fieldWidth` | form | int\|`"X%"` | |
| `filterWidth` | filter | int\|`"X%"` | Overrides fieldWidth in filter panel |
| `colTextAlign` | column | `left`\|`center`\|`right` | |
| `colStyles` | column | string\|string[] | `light` `normal` `semibold` `bold` `italic` `tabular` `xs`…`xl` `smallest`…`largest` |
| `emphasizeColumn` | column | boolean | Visual emphasis on column |
| `icon` / `iconColor` | column | string | Column header icon |
| `footer` | column | string | `"{count} X"` `"{unique} X"` `"{sum}"` |
| `footerIcon` | column | string | Icon instead of footer text |
| `render` | column | object | See renders below |
| `wrapperWidth` | column | int | colorWrapper badge width px |
| `required` | form | boolean | Colored left border + validation |
| `readOnly` | form | boolean | |
| `enabled` | form | boolean | Default true |
| `defaultValue` | form | any | Supports `"$user.<field>"` and `"$params.<key>"` |
| `placeholder` | form | string | |
| `filterPlaceholder` | filter | string | |
| `multiple` | form | boolean | Multi-select |
| `options` | form+col | object | `{ table, valueAccessor, labelAccessor, filter }` |
| `mask` | both | object | `{ pattern: "00.000-00", digits: 7 }` |

### `render.layout` values

| layout | Description | Extra props |
|--------|-------------|-------------|
| `link` | Clickable → opens form | `op`: `edit`\|`detail`\|`email` |
| `stacked` | Multi-line cell | `values[]`: `{ accessor, styles, mask }` |
| `colorWrapper` | Colored badge | Requires options with `color`. `wrapperWidth`: px |
| `booleanIcon` | True/false icons | (none) |
| `booleanWrapper` | Colored bool pill | (none) |
| `booleanValue` | Bool as text | (none) |
| `date` | Format date | `format`: `"DD/MM/YY"` or `"relative"` |
| `decimal` | Locale decimal | (none) |
| `image` | Thumbnail | (none) |
| `actions` | Row action buttons | (none — controlled by listview `actions`) |
| `iconWithBadge` | Icon + count badge → opens form tab | `op`: `edit`\|`detail`, `tab`: tab name |
| `blank` | Empty spacer cell | (none) |

### Masks — common patterns

| Usage | `pattern` | `digits` |
|-------|-----------|---------|
| 4-digit ID | `"0000"` | 4 |
| CPF | `"000.000.000-00"` | 11 |
| CNPJ | `"00.000.000/0000-00"` | 14 |
| Phone | `"(00) 00000-0000"` | 11 |
| CEP | `"00000-000"` | 8 |

---

## `listview.json` quick reference

```json
{
  "name": "<viewName>",
  "type": "listView",
  "config": {
    "idAccessor": "id",
    "nameAccessor": "nome",
    "rowClassAccessor": "none"
  },
  "columns": ["nome", "status", "actions"],
  "actions": ["record_detail", "record_edit", "record_delete"],
  "toolbar": [
    { "type": "title", "text": "Title" },
    "add", "separator", "filterPanel"
  ],
  "filterPanel": {
    "layout": { "header": ["nome", "status"] },
    "toolbar": ["filter", "filterMore"]
  }
}
```

### Engine-handled row actions

`"record_detail"` · `"record_edit"` · `"record_delete"`

### Engine-handled toolbar action strings

`"add"` · `"toggleFilterPanel"` / `"filterPanel"` · `"closeFilterPanel"` · `"edit"` · `"listViewMore"`

### `rowClassAccessor`

Sets `nf-row-<value>` CSS class on each row. Style in `app.css`. Use `"none"` to disable.

---

## `form.json` quick reference

```json
{
  "name": "<viewName>",
  "layout": {
    "header": ["id"],
    "sections": [
      {
        "title": "Section title",
        "initialState": "noheader",
        "columns": [
          [["id", "ativo"], "nome"],
          ["email", "empresa"]
        ]
      }
    ]
  },
  "add":    { "title": "Novo {singular}", "toolbar": ["send", "cancel"] },
  "edit":   { "title": "Editar {name}",  "toolbar": ["previous", "next", {"type":"spacer"}, "send", "cancel"] },
  "detail": { "title": "{name}",          "toolbar": ["edit", "close"] }
}
```

### `initialState` values

`"expanded"` · `"collapsed"` · `"fixed"` · `"noheader"`

### Tabs layout

```json
"layout": {
  "tabs": [
    {
      "label": "Cadastro", "name": "cadastro",
      "icon": "user", "iconColor": "var(--nf-secondary-color)",
      "sections": [...]
    },
    {
      "label": "Filhos", "name": "filhos",
      "listView": {
        "name": "filhos",
        "config": { "idAccessor": "id", "nameAccessor": "nome" },
        "columns": ["nome", "actions"],
        "actions": ["record_edit", "record_delete"],
        "toolbar": ["add_text"]
      }
    }
  ]
}
```

### Form toolbar control names

`"send"` · `"cancel"` · `"close"` · `"edit"` · `"delete"` · `"previous"` · `"next"` · `{ "type": "spacer" }`

---

## `app.json` key sections

### `data`
```json
"data": { "source": "mock", "apiBaseUrl": "http://localhost:3000" }
```

### `controls` (library)
```json
"controls": {
  "send":   { "type": "textButton", "label": "Salvar",   "action": "send" },
  "cancel": { "type": "textButton", "label": "Cancelar", "action": "cancel" },
  "add":    { "type": "textButton", "label": "Adicionar","action": "add", "icon": "plus" },
  "delete": { "type": "textButton", "label": "Excluir",  "action": "delete", "class": "critical" }
}
```
`class`: `"warning"` or `"critical"` for colored buttons.

### `theme`
```json
"theme": {
  "iconFamily": "tabler",
  "iconMapTabler":   { "myIcon": "tabler-icon-name" },
  "iconMapMaterial": { "myIcon": "material-symbol-name" }
}
```

### `listViews`
```json
"listViews": {
  "defaultList": "viewName",
  "table": { "striped": false, "trueIcon": "circleCheck", "falseIcon": "circleX" },
  "pagination": { "defaultPageSize": 25, "pageSizes": [10, 25, 50, 100] },
  "messageBox": { "deleteControls": ["confirmDelete", "cancelDelete"] }
}
```

---

## `menu.json` quick reference

```json
{
  "items": [
    { "type": "subtitle",  "label": "Group" },
    { "type": "menuItem",  "name": "view", "label": "Label", "icon": "iconName",
      "badge": 5, "badgeEmphasis": "red.6", "emphasis": "blue.5" },
    { "type": "separator" },
    { "type": "menuItem",  "name": "parent", "label": "With Sub",
      "items": [
        { "type": "menuItem", "name": "child", "label": "Child" }
      ]
    }
  ]
}
```

---

## Key patterns

### colorWrapper (status badge)
1. Options table: each record has `{ value, label, color }` where `color` is a Mantine color token
2. Field: `"dataType": "select"`, `"render": { "layout": "colorWrapper" }`, `"wrapperWidth": 90`
3. Load options table in `dataloader.js`

### iconWithBadge (cross-entity link)
```json
"field": {
  "icon": "users", "iconColor": "var(--nf-secondary-color)",
  "colWidth": 40, "colTextAlign": "center",
  "render": { "layout": "iconWithBadge", "op": "detail", "tab": "tabName" }
}
```
Target form must have a tab with matching `"name": "tabName"`.

### Dynamic defaultValue tokens
- `"$user.<field>"` — value from the logged-in user object
- `"$params.<key>"` — value from the current URL search params

### `stacked` cell render
```json
"render": {
  "layout": "stacked",
  "values": [
    { "accessor": "path.to.name", "styles": ["bold"] },
    { "accessor": "path.to.sub",  "styles": "small",
      "mask": { "pattern": "000.000.000-00", "digits": 11 } }
  ]
}
```

### `_common/` shared tables
Put shared options tables in `views/_common/`. Load in `dataloader.js` and
reference by key in `fields.json options.table`.

### Context-filtered select
```json
"options": { "table": "cidades", "valueAccessor": "id", "labelAccessor": "nome", "filter": "state_id" }
```
Only shows options where `option.state_id === currentRecord.state_id`.

---

## Validation

```bash
npm run ai:check                                       # default project
npm run ai:check -- --project ./packages/app-X/project # target project
```

Exit 0 = clean. Exit 3 = errors. Log files in `scripts/logs/`.

Three validators run sequentially:
1. `schema-validator` — schema internal hygiene
2. `json-validator` — all project JSONs against schemas
3. `metadata-analyzer` — cross-file consistency

---

## New view — minimum diff checklist

```
□ Create project/views/<name>/ with fields.json, listview.json, form.json, data.json
□ Add "<name>" to project/views/views.json active[]
□ Add 3 imports + 3 exports to metadataloader.js
□ Add 1 import + 1 export to dataloader.js (+ any options tables)
□ Add menuItem to menu.json
□ Run npm run ai:check
```

---

## What to NEVER do

- Put business logic or domain structure in `packages/neofront/` components
- Fetch data inside engine components
- Import from `app-*` inside the engine
- Hardcode colors, spacing, or typography (use Mantine tokens)
- Create new global context when `useAppUI` already covers the need
- Rewrite files — prefer line-level diffs
