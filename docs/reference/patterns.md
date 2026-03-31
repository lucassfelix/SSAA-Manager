# Advanced Patterns

This guide covers recurring patterns that go beyond the basics. Each pattern
appears in real projects (`app-demo`, `app-ssaa`) and is not fully explained
by the schemas alone.

---

## colorWrapper

Renders a field value inside a colored pill badge. Typically used for status
fields where each status has its own color.

### Setup

**Step 1: options table** (`status_empresa.json`)

```json
[
  { "value": 1, "label": "Ativo",     "color": "green.6" },
  { "value": 2, "label": "Inativo",   "color": "red.6" },
  { "value": 3, "label": "Pendente",  "color": "yellow.5" }
]
```

The `color` property is a Mantine color token (`palette.shade`).

**Step 2: field definition** (`fields.json`)

```json
"status": {
  "label": "Status",
  "header": "Status",
  "dataType": "select",
  "colTextAlign": "center",
  "colWidth": 100,
  "fieldWidth": 240,
  "defaultValue": 1,
  "options": {
    "table": "status_empresa",
    "valueAccessor": "value",
    "labelAccessor": "label"
  },
  "render": { "layout": "colorWrapper" },
  "wrapperWidth": 90
}
```

`wrapperWidth` sets the badge width in pixels. Omit it for auto width.

**Step 3: load the options table** (`dataloader.js`)

```js
import status_empresa from "./empresas/status_empresa.json";
export default { ..., status_empresa };
```

---

## `rowClassAccessor`

`rowClassAccessor` in `listview.json config` applies a CSS class to each row
based on a field value. Used for conditional row styling (e.g. different
background for inactive records).

```json
"config": {
  "idAccessor": "id",
  "nameAccessor": "nome",
  "rowClassAccessor": "status"
}
```

The engine reads `record[rowClassAccessor]` and applies `nf-row-<value>` as a
CSS class to the row `tr` element. You then style it in `src/styles/app.css`:

```css
tr.nf-row-2 td { opacity: 0.5; }   /* dim inactive rows */
tr.nf-row-3 td { color: orange; }  /* highlight pending rows */
```

Set `"rowClassAccessor": "none"` to disable row class application (or omit
the property entirely).

---

## `iconWithBadge` — cross-entity navigation

`iconWithBadge` renders a clickable icon with a count badge in a list column.
Clicking it opens a related record's form at a specific tab. Used to navigate
between entities without leaving the current list context.

### Prerequisites

- The target entity must have a **tabbed form** with a tab whose `name` matches `tab`.
- The badge count is derived from the related records loaded in the child list.

### Field definition

```json
"usuarios": {
  "icon": "users",
  "iconColor": "var(--nf-secondary-color)",
  "colWidth": 40,
  "colTextAlign": "center",
  "render": {
    "layout": "iconWithBadge",
    "op": "detail",
    "tab": "usuarios"
  }
}
```

| Property | Description |
|----------|-------------|
| `icon` | Icon name (from the active icon library or `iconMap`) |
| `iconColor` | Icon color — CSS variable or Mantine color token |
| `render.op` | `"detail"` or `"edit"` — which form operation to open |
| `render.tab` | The `name` of the tab in the target form |

### Target form tab (must exist in target view's `form.json`)

```json
{
  "label": "Usuários",
  "name": "usuarios",          ← must match render.tab
  "icon": "users",
  "listView": { ... }
}
```

---

## Embedded listViews in form tabs

A form tab can contain a child record list, letting you manage related records
without navigating away. The pattern is used for parent–child relationships
(e.g. clinic → users, clinic → patients).

### Form tab config (`form.json`)

```json
{
  "label": "Pacientes",
  "name": "pacientes",
  "icon": "dental",
  "iconColor": "var(--nf-secondary-color)",
  "listView": {
    "name": "pacientes",
    "config": {
      "idAccessor": "id",
      "nameAccessor": "nome",
      "rowClassAccessor": "none"
    },
    "columns": ["nome", "actions"],
    "actions": ["record_edit", "record_delete"],
    "toolbar": ["add_text"]
  }
}
```

The `name` in the embedded `listView` must match the view folder name so the
engine loads the correct `fieldConfig` and `form` for that entity.

The embedded list automatically filters records to only show children of the
currently open parent record.

### Matching `iconWithBadge` column (on the parent list)

```json
"pacientes": {
  "icon": "dental",
  "iconColor": "var(--nf-secondary-color)",
  "colWidth": 40,
  "colTextAlign": "center",
  "render": { "layout": "iconWithBadge", "op": "detail", "tab": "pacientes" }
}
```

---

## Dynamic `defaultValue` tokens

`defaultValue` in a field definition accepts special tokens that are resolved
at runtime.

### `$user.<field>` — value from the logged-in user

```json
"clinica_id": {
  "dataType": "select",
  "defaultValue": "$user.clinica_id",
  "options": { "table": "clinicas", "valueAccessor": "id", "labelAccessor": "nome" }
}
```

On new record creation, the field is pre-filled with the logged-in user's
`clinica_id`. Useful for scoping new records to the current user's context.

### `$params.<key>` — value from URL parameters

```json
"paciente_id": {
  "dataType": "select",
  "defaultValue": "$params.paciente_id",
  "options": { "table": "pacientes", "valueAccessor": "id", "labelAccessor": "nome" }
}
```

On new record creation, the field is pre-filled with the `paciente_id` URL
parameter. Used when navigating from a parent record (the parent's ID is in
the URL) to create a new related child record.

---

## `_common/` — shared options tables

Options tables used by more than one view should go in `_common/`:

```
project/views/
  _common/
    data_br_ufs.json        ← Brazilian states, used by any view with a UF field
    currencies.json
```

Load them in `dataloader.js` like any other table:

```js
import ufs from "./_common/data_br_ufs.json";
export default { ..., ufs };
```

Reference by the export key in `fields.json`:

```json
"uf": {
  "dataType": "select",
  "options": { "table": "ufs", "valueAccessor": "code", "labelAccessor": "label" }
}
```

---

## Context-filtered selects (`options.filter`)

The `filter` property in `options` restricts the displayed options to rows
where `optionRecord[filter] === currentRecord[filter]`. Used when options
depend on another field's value in the same record.

```json
"cidade": {
  "dataType": "select",
  "options": {
    "table": "cidades",
    "valueAccessor": "id",
    "labelAccessor": "nome",
    "filter": "uf_id"
  }
}
```

Only cities where `cidade.uf_id === currentRecord.uf_id` are shown.

---

## `stacked` render — multi-line cells

Renders multiple data points stacked vertically in a single cell. Useful for
showing a name + secondary info without extra columns.

```json
"nome": {
  "render": {
    "layout": "stacked",
    "values": [
      { "accessor": "empresa.nome",  "styles": ["bold", "italic"] },
      { "accessor": "empresa.cnpj",  "styles": "small",
        "mask": { "pattern": "00.000.000/0000-00", "digits": 14 } }
    ]
  }
}
```

Each entry in `values`:
- `accessor`: dot-notation path into the record
- `styles`: same as `colStyles` (string or array)
- `mask`: optional mask for the value

---

## `spacer` field — visual gap in columns

Add a blank spacer column to create visual breathing room between content and
action columns:

```json
"spacer": {
  "colWidth": 40,
  "render": { "layout": "blank" }
}
```

Add `"spacer"` to the `columns` array in `listview.json` where needed.

---

## Custom controls and actions

New toolbar actions not handled by the engine are dispatched as action strings.
Use them for app-specific features:

**Step 1: define the control in `app.json`**

```json
"controls": {
  "exportCSV": {
    "type": "textButton",
    "label": "Exportar CSV",
    "icon": "download",
    "action": "exportCSV"
  }
}
```

**Step 2: add to a view toolbar (`listview.json`)**

```json
"toolbar": ["add", "separator", "exportCSV"]
```

**Step 3: implement in the app package**

Custom action strings that don't match engine actions are logged to the
console. Wire them up in the project's `src/` using a `dataEnhancer` or an
extension point the engine exposes.

Do not implement domain-specific action handling inside the engine.
