# `listview.json` Reference

**Schema:** `schemas/listview.schema.json`
**Location:** `project/views/<viewName>/listview.json`

`listview.json` defines the table: which fields appear as columns, what row
actions are available, the toolbar, and the filter panel layout.

---

## Minimal example

```json
{
  "$schema": "../../../../../schemas/listview.schema.json",
  "name": "usuarios",
  "type": "listView",
  "config": {
    "idAccessor": "id",
    "nameAccessor": "nome"
  },
  "columns": ["nome", "email", "actions"],
  "actions": ["record_edit", "record_delete"],
  "toolbar": [
    { "type": "title", "text": "Usuários" },
    "add"
  ]
}
```

---

## Top-level properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `$schema` | string | rec. | Relative path to `listview.schema.json` |
| `name` | string | yes | Must match the view folder name |
| `type` | `"listView"` | yes | Always `"listView"` |
| `config` | object | yes | Table-level config — see below |
| `columns` | string[] | yes | Ordered list of field names to display as columns |
| `actions` | string[] | no | Engine record actions per row — see [Row Actions](#row-actions) |
| `toolbar` | toolbarItem[] | no | Toolbar above the table — see [Toolbar](#toolbar) |
| `filterPanel` | object | no | Filter panel config — see [Filter Panel](#filter-panel) |

---

## `config` properties

| Property | Type | Description |
|----------|------|-------------|
| `idAccessor` | string | Dot-path to the unique record ID field (required by the engine) |
| `nameAccessor` | string | Dot-path to the human-readable name field. Used in form titles (`{name}` token) and delete confirmations |
| `rowClassAccessor` | string | Field name whose value is used as a CSS class on the row. Use `"none"` to disable. Used for conditional row styling (e.g. status-based colors) |
| `header` | boolean | Show the table header row (default `true`) |
| `footer` | boolean | Show the table footer row (default depends on whether any field has `footer` set) |

---

## Columns

The `columns` array is an ordered list of field names (keys in `fields.json`).
The first non-action column with `colWidth: "100%"` stretches to fill available space.

```json
"columns": ["id", "nome", "email", "status", "actions"]
```

All column appearance is configured in `fields.json`:  `header`, `colWidth`,
`colTextAlign`, `colStyles`, `render`, `footer`, etc.

---

## Row Actions

The `actions` array lists engine-handled record actions. These map to the action
buttons rendered by the `actions` field (with `render.layout: "actions"`).

| String | Renders | Description |
|--------|---------|-------------|
| `"record_detail"` | Eye icon | Opens the record in detail (read-only) form |
| `"record_edit"` | Pencil icon | Opens the record in edit form |
| `"record_delete"` | Trash icon | Triggers delete confirmation dialog |

Omit `"record_detail"` if you don't have a detail view. All three can be used
independently.

```json
"actions": ["record_detail", "record_edit", "record_delete"]
```

The visual style of action buttons (icon size, variant, etc.) is configured
globally in `app.json` under `listViews.actionToolbar`.

---

## Toolbar

The `toolbar` array defines items displayed above the table. Each item is
either a control name string (matching a key in `app.json` controls) or an
inline toolbar item object.

### Engine-handled toolbar action strings

| String | Action |
|--------|--------|
| `"add"` | Opens the add form |
| `"toggleFilterPanel"` | Toggles the filter panel open/closed |
| `"filterPanel"` | Alias — toggles the filter panel |
| `"closeFilterPanel"` | Closes the filter panel |
| `"edit"` | Opens edit form for the selected record |
| `"listViewMore"` | Opens a "more options" dropdown |

### Inline toolbar item object

```json
{ "type": "title", "text": "Usuários" }
{ "type": "spacer" }
{ "type": "separator" }
{
  "type": "textButton",
  "name": "revalidar",
  "label": "Revalidar",
  "action": "revalidate",
  "tip": "Clique para revalidar"
}
{
  "type": "iconButton",
  "name": "export",
  "icon": "download",
  "action": "exportCSV",
  "tip": "Exportar CSV"
}
```

| Object property | Type | Description |
|----------------|------|-------------|
| `type` | enum | `text` \| `title` \| `iconButton` \| `textButton` \| `separator` \| `spacer` |
| `name` | string | Logical name (for action dispatch) |
| `text` | string | Text content (for `text` \| `title`) |
| `label` | string | Button label (for buttons) |
| `icon` | string | Icon name |
| `tip` | string | Tooltip text |
| `selectedTip` | string | Tooltip when toggled on |
| `toggle` | boolean | Whether the button toggles on/off state |
| `action` | string | Action string dispatched when clicked |
| `items` | array | Dropdown menu items |

Instead of inline objects, you can also reference a named control from
`app.json` by its key:

```json
"toolbar": ["add", "separator", "revalidar", "listViewMore"]
//                                ↑ key in app.json controls
```

---

## Filter Panel

The `filterPanel` defines a collapsible panel with filter fields.

```json
"filterPanel": {
  "layout": {
    "header": ["nome", "email"],
    "sections": [
      {
        "title": "Mais filtros",
        "initialState": "collapsed",
        "columns": [
          ["status", "ativo"]
        ]
      }
    ]
  },
  "toolbar": ["filter", "filterMore"]
}
```

| Property | Description |
|----------|-------------|
| `layout` | Form layout for the filter fields — same `formLayout` shape as `form.json`. Fields reference keys from `fields.json`. |
| `toolbar` | Toolbar items inside the filter panel |

Common filter toolbar items: `"filter"` (apply), `"filterMore"` (more options),
`"closeFilterPanel"` (close).

Fields appear in the filter panel using their `filterWidth` and
`filterPlaceholder` properties from `fields.json` (falling back to `fieldWidth`
and `placeholder`).

---

## Embedded `listView` (in form tabs)

A `listView` config can also appear inside `form.json` tabs to render a
child record list. The shape is identical to `listview.json`, but it is
inlined directly in the form tab definition. See [form.md § Tabs](form.md#tabs-layout).

---

## Full example with all features

```json
{
  "$schema": "../../../../../schemas/listview.schema.json",
  "name": "empresas",
  "type": "listView",
  "config": {
    "idAccessor": "id",
    "nameAccessor": "empresa.nome",
    "rowClassAccessor": "status"
  },
  "columns": ["id", "nome", "cidade", "uf", "status", "actions"],
  "actions": ["record_edit", "record_delete"],
  "toolbar": [
    { "type": "title", "text": "Empresas" },
    "add",
    "separator",
    "filterPanel"
  ],
  "filterPanel": {
    "layout": {
      "header": ["nome", "cnpj", "status"]
    },
    "toolbar": ["filter", "filterMore"]
  }
}
```
