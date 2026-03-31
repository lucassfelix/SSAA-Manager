# `form.json` Reference

**Schema:** `schemas/form.schema.json`
**Location:** `project/views/<viewName>/form.json`

`form.json` defines the form layout for add, edit, and detail operations.
It does not define fields (those live in `fields.json`) — it only arranges them.

---

## Minimal example

```json
{
  "$schema": "../../../../../schemas/form.schema.json",
  "name": "usuarios",
  "layout": {
    "sections": [
      {
        "initialState": "noheader",
        "columns": [
          ["nome", "email"]
        ]
      }
    ]
  },
  "add":    { "title": "Novo usuário",    "toolbar": ["send", "cancel"] },
  "edit":   { "title": "Editar {name}",  "toolbar": ["send", "cancel"] },
  "detail": { "title": "{name}",          "toolbar": ["edit", "close"] }
}
```

---

## Top-level properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `$schema` | string | rec. | Relative path to `form.schema.json` |
| `name` | string | yes | Must match the view folder name |
| `layout` | object | yes | Form layout — sections or tabs |
| `add` | object | no | Config for the add operation |
| `edit` | object | no | Config for the edit operation |
| `detail` | object | no | Config for the detail (read-only) operation |

Each of `add`, `edit`, `detail`:

| Property | Description |
|----------|-------------|
| `title` | Form title. Supports `{name}` (nameAccessor value), `{singular}` |
| `toolbar` | Array of control name strings or inline toolbar item objects |

If an operation is omitted, it is not available for that view.

---

## Sections layout

The standard layout is a `sections` array within `layout`.

```json
"layout": {
  "header": ["id", "status"],
  "sections": [
    {
      "title": "Dados gerais",
      "initialState": "expanded",
      "columns": [
        [
          ["nome", "ativo"],
          "email"
        ],
        [
          "telefone",
          "endereco"
        ]
      ]
    },
    {
      "title": "Configurações",
      "initialState": "collapsed",
      "columns": [
        ["configuracao1", "configuracao2"]
      ]
    }
  ]
}
```

### `layout.header`

Optional. Array of field names pinned above all sections. These fields are
always visible regardless of accordion state.

### Section properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | string | Section title (shown in accordion header) |
| `initialState` | enum | `"expanded"` (default) \| `"collapsed"` \| `"fixed"` (no accordion) \| `"noheader"` (no header bar, always visible) |
| `columns` | array | The field arrangement — see [Column Layout](#column-layout) |

### Column layout

`columns` is an array of columns (rendered side by side). Each column is an
array of rows. A row is either:

- A string: a single field taking the full column width
- An array of strings: multiple fields side by side within the row

```json
"columns": [
  // Column 1
  [
    ["id", "ativo"],   // row: two fields side by side
    "nome",            // row: full width
    "email"            // row: full width
  ],
  // Column 2
  [
    "empresa",         // row: full width
    "foto"             // row: full width
  ]
]
```

Each field's width within a row is controlled by its `fieldWidth` in
`fields.json`. If you have two fields in a row and don't set widths, they
split equally.

---

## Tabs layout

Use `tabs` instead of `sections` when you need a tabbed form. Tabs and
sections are mutually exclusive in the same `layout`.

```json
"layout": {
  "tabs": [
    {
      "label": "Cadastro",
      "name": "cadastro",
      "sections": [
        {
          "initialState": "noheader",
          "columns": [
            ["nome", "email"]
          ]
        }
      ]
    },
    {
      "label": "Usuários",
      "name": "usuarios",
      "icon": "users",
      "iconColor": "var(--nf-secondary-color)",
      "listView": {
        "name": "usuarios",
        "config": { "idAccessor": "id", "nameAccessor": "nome" },
        "columns": ["nome", "actions"],
        "actions": ["record_edit", "record_delete"],
        "toolbar": ["add_text"]
      }
    }
  ]
}
```

### Tab properties

| Property | Type | Description |
|----------|------|-------------|
| `label` | string | Tab label text |
| `name` | string | Logical tab name (used for URL routing and `iconWithBadge` tab targeting) |
| `icon` | string | Icon beside the tab label |
| `iconColor` | string | Icon color (CSS variable OK) |
| `textColor` | string | Label text color |
| `header` | string[] | Fields pinned above sections in this tab |
| `sections` | section[] | Regular sections (same as in sections layout) |
| `listView` | object | Embedded list view — see below |

A tab has either `sections` **or** `listView`, not both.

### Embedded `listView` in a tab

An embedded list view renders a child record table inside a form tab. It uses
the same `listView` shape as `listview.json`, inlined directly:

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

The `name` in the embedded `listView` must match the source view name so the
engine knows which metadata to load for the child list.

See also [Patterns: embedded listViews](patterns.md#embedded-listviews-in-form-tabs).

---

## Toolbar reference for forms

Common toolbar control names for form operations:

| Control name | Renders | Description |
|-------------|---------|-------------|
| `"send"` | Save button | Submits the form |
| `"cancel"` | Cancel button | Closes without saving |
| `"edit"` | Edit button | Switches detail view to edit mode |
| `"close"` | Close button | Closes the form |
| `"delete"` | Delete button | Triggers delete confirmation |
| `"previous"` | ← button | Navigate to previous record |
| `"next"` | → button | Navigate to next record |
| `{ "type": "spacer" }` | Flexible space | Pushes subsequent items to the right |

A common edit toolbar pattern:

```json
"toolbar": ["previous", "next", { "type": "spacer" }, "send", "cancel"]
```

---

## Full example with sections + tabs

```json
{
  "$schema": "../../../../../schemas/form.schema.json",
  "name": "clinicas",
  "layout": {
    "tabs": [
      {
        "label": "Cadastro",
        "name": "cadastro",
        "sections": [
          {
            "initialState": "noheader",
            "columns": [
              ["id", "nome"]
            ]
          }
        ]
      },
      {
        "label": "Usuários",
        "name": "usuarios",
        "icon": "users",
        "listView": {
          "name": "usuarios",
          "config": { "idAccessor": "id", "nameAccessor": "nome" },
          "columns": ["nome", "actions"],
          "actions": ["record_edit", "record_delete"],
          "toolbar": ["add_text"]
        }
      }
    ]
  },
  "edit":   { "title": "Clínica {name}", "toolbar": ["send", "delete", "cancel"] },
  "add":    { "title": "Nova clínica",   "toolbar": ["send", "cancel"] },
  "detail": { "title": "Clínica {name}", "toolbar": ["edit", "close"] }
}
```
