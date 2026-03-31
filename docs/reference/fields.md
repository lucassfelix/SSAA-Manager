# `fields.json` Reference

**Schema:** `schemas/fields.schema.json`
**Location:** `project/views/<viewName>/fields.json`

`fields.json` is the most important file in a view. It declares every field
used in both the list table and the form. The same field definition drives
column appearance, form appearance, validation, and data formatting.

---

## Minimal example

```json
{
  "$schema": "../../../../../schemas/fields.schema.json",
  "name": "usuarios",
  "strings": {
    "singular": "usuário",
    "plural": "usuários",
    "theItem": "o usuário"
  },
  "fields": {
    "id": { "label": "ID", "dataType": "string", "readOnly": true },
    "nome": { "label": "Nome", "dataType": "string", "required": true }
  }
}
```

---

## Top-level properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `$schema` | string | rec. | Relative path to `fields.schema.json` |
| `name` | string | yes | Must match the view folder name |
| `strings.singular` | string | yes | E.g. `"produto"` — used in form titles |
| `strings.plural` | string | yes | E.g. `"produtos"` — used in table headers |
| `strings.theItem` | string | yes | E.g. `"o produto"` — used in delete confirmation |
| `fields` | object | yes | Named map of field definitions |

---

## Field properties

All field properties are optional unless marked (required).

### Identity

| Property | Type | Description |
|----------|------|-------------|
| `dataType` | enum | Data type — see [Data Types](#data-types) |
| `accessor` | string | Dot-notation path into the data record. Defaults to the field key. Use when the JSON key doesn't match the field name (e.g. `"accessor": "empresa.nome"`) |

### Column (table) properties

| Property | Type | Description |
|----------|------|-------------|
| `header` | string | Column header text. Defaults to `label`. Use `""` for icon-only headers |
| `headerIcon` | string | Icon displayed beside the header text |
| `icon` | string | Icon in the column header (replaces text) |
| `iconColor` | string | Color for the header icon (CSS variable OK, e.g. `"var(--nf-secondary-color)"`) |
| `colWidth` | int \| string | Column width in px (`80`) or percentage (`"30%"`). Use `"100%"` for the name column to take remaining space |
| `colTextAlign` | `"left"` \| `"center"` \| `"right"` | Horizontal alignment of column data |
| `colStyles` | string \| string[] | Typography styles — see [Column Styles](#column-styles) |
| `emphasizeColumn` | boolean | Applies visual emphasis (typically bold background) to the column |
| `footer` | string | Footer template: `"{count} empresas"`, `"{unique} cidades"`, `"{sum}"` |
| `footerIcon` | string | Icon in the footer (replaces text) |
| `render` | object | Custom render layout — see [Render Layouts](#render-layouts) |
| `wrapperWidth` | integer | Width of the colorWrapper badge in px (used with `render.layout: "colorWrapper"`) |

### Form properties

| Property | Type | Description |
|----------|------|-------------|
| `label` | string | Field label displayed in the form |
| `fieldWidth` | int \| string | Width in px or percentage |
| `filterWidth` | int \| string | Override width when this field appears in a filter panel |
| `placeholder` | string | Placeholder text when the field is empty |
| `filterPlaceholder` | string | Placeholder override for filter panels |
| `defaultValue` | any | Default value for new records. Supports `"$user.<field>"` and `"$params.<key>"` — see [Patterns](patterns.md) |
| `required` | boolean | Field is required for form submission. Engine marks it with a colored left border |
| `readOnly` | boolean | Field is displayed but not editable |
| `enabled` | boolean | Whether the field is enabled (default `true`) |
| `multiple` | boolean | Allow multiple selections (for `select` fields) |
| `options` | object | Options source for `select` fields — see [Select Fields](#select-fields) |
| `mask` | object | Input mask — see [Masks](#masks) |

---

## Data Types

| `dataType` | Description | Notes |
|------------|-------------|-------|
| `string` | Text input | Default type |
| `integer` | Whole number | Numeric keyboard on mobile |
| `decimal` | Decimal number | Use `render.layout: "decimal"` for column formatting |
| `boolean` | True/false | Renders as Switch in form. Use `render` for column display |
| `date` | Date picker | Use `render.layout: "date"` for column formatting |
| `select` | Dropdown | Requires `options` |
| `password` | Password (hashed, display only) | Shows a lock icon; field value is never revealed |
| `passwordInput` | Password input | Password entry field in forms with show/hide toggle |
| `image` | Image URL | Renders as thumbnail/avatar |
| `json` | JSON freeform | Multi-line text area accepting raw JSON |

---

## Select Fields

A `select` field requires an `options` definition pointing to a data table:

```json
"status": {
  "label": "Status",
  "dataType": "select",
  "fieldWidth": 240,
  "placeholder": "Selecione",
  "options": {
    "table": "status_empresa",
    "valueAccessor": "value",
    "labelAccessor": "label"
  }
}
```

| `options` property | Default | Description |
|--------------------|---------|-------------|
| `table` | (required) | Key in `dataloader.js` export |
| `valueAccessor` | `"value"` | Path in each record used as the stored value |
| `labelAccessor` | `"label"` | Path in each record used as the displayed label |
| `filter` | — | Field name: only show option rows where `row[filter] == currentRecord[filter]`. Used for context-filtered selects (e.g. show only cities in the selected state) |

The options table file (`<table>.json`) is a simple array:

```json
[
  { "value": 1, "label": "Ativo",   "color": "green.6" },
  { "value": 2, "label": "Inativo", "color": "red.6" }
]
```

The `color` property is used by `colorWrapper` render layout. For any extra
property needed in rendering, just add it to the record — `additionalProperties`
is allowed.

For multi-select, set `"multiple": true` on the field.

---

## Masks

Masks format string/integer values for display and constrain input:

```json
"cpf": {
  "dataType": "string",
  "mask": { "pattern": "000.000.000-00", "digits": 11 }
}
```

| Property | Description |
|----------|-------------|
| `pattern` | Format string. `0` = digit placeholder, other chars are literals |
| `digits` | Total number of digits expected. Engine infers it from `pattern` if omitted |

Common patterns:

| Use | Pattern | Digits |
|-----|---------|--------|
| 4-digit ID | `"0000"` | 4 |
| Brazilian CPF | `"000.000.000-00"` | 11 |
| Brazilian CNPJ | `"00.000.000/0000-00"` | 14 |
| Brazilian phone | `"(00) 00000-0000"` | 11 |
| Brazilian CEP | `"00000-000"` | 8 |

---

## Column Styles

`colStyles` accepts a single string or an array. All values are combinable:

| Value | Effect |
|-------|--------|
| `light` | Light font weight |
| `normal` | Normal font weight |
| `semibold` | Semi-bold |
| `bold` | Bold |
| `italic` | Italic |
| `xs` / `sm` / `md` / `lg` / `xl` | Font size (Mantine size tokens) |
| `smallest` / `smaller` / `small` | Relative smaller sizes |
| `largest` / `larger` / `large` | Relative larger sizes |
| `tabular` | Tabular (monospace) numbers — good for IDs and numbers |

Example: `"colStyles": ["semibold", "tabular"]`

---

## Render Layouts

The `render` object controls how a field value is displayed in the table column.
It has no effect in form fields (form rendering is driven by `dataType`).

### `link`

Makes the cell value a clickable link that opens a form operation.

```json
"render": { "layout": "link", "op": "edit" }
// op: "edit" | "detail" | "email"
```

Use `"op": "email"` to open the user's mail client with the email pre-filled.

### `stacked`

Renders multiple values stacked vertically in the same cell.

```json
"render": {
  "layout": "stacked",
  "values": [
    { "accessor": "empresa.nome", "styles": ["bold", "italic"] },
    { "accessor": "empresa.cnpj", "styles": "small",
      "mask": { "pattern": "00.000.000/0000-00", "digits": 14 } }
  ]
}
```

Each `values` entry: `accessor` (dot-path), `styles` (same as `colStyles`), optional `mask`.

### `colorWrapper`

Renders the value inside a colored pill/badge. The color comes from the `color`
property of the matching options record. Requires `options` on the field.

```json
"render": { "layout": "colorWrapper" },
"wrapperWidth": 90
```

`wrapperWidth` sets the badge width in pixels (default: auto).

### `booleanIcon`

Renders true/false as icons (configured globally in `app.json` under
`listViews.table.trueIcon` / `falseIcon`).

```json
"render": { "layout": "booleanIcon" }
```

### `booleanWrapper`

Like `colorWrapper` but for boolean values (colored green/red pill).

### `booleanValue`

Renders boolean as custom text strings (configure via options).

### `date`

Formats a date value.

```json
"render": { "layout": "date", "format": "DD/MM/YY" }
// Special format: "relative"  → "2 hours ago", "3 days ago"
```

### `decimal`

Formats a decimal number with locale-appropriate separators.

```json
"render": { "layout": "decimal" }
```

### `image`

Renders the value as a thumbnail/avatar image.

```json
"render": { "layout": "image" }
```

Image radius and height defaults come from `app.json` under `forms.imageRadius`
and `forms.imageHeight`.

### `actions`

Renders the row action buttons (edit/detail/delete). Typically used in a
dedicated `actions` field with an empty header:

```json
"actions": {
  "header": "",
  "colWidth": 100,
  "colTextAlign": "center",
  "render": { "layout": "actions" }
}
```

The actual buttons shown are controlled by `listview.json` → `actions`.

### `iconWithBadge`

Renders an icon with a count badge. Clicking opens a related record's form
at a specific tab. Used for cross-entity navigation.

```json
"usuarios": {
  "icon": "users",
  "iconColor": "var(--nf-secondary-color)",
  "colWidth": 40,
  "colTextAlign": "center",
  "render": { "layout": "iconWithBadge", "op": "detail", "tab": "usuarios" }
}
```

- `op`: `"detail"` or `"edit"` — which form operation to open
- `tab`: the tab `name` in the target form that contains the related list

### `blank`

Renders an empty spacer cell. Useful for visual padding.

```json
"spacer": {
  "colWidth": 40,
  "render": { "layout": "blank" }
}
```

---

## Using `accessor` for nested data

When records have nested objects, use `accessor` to reach into them:

```json
"nome": {
  "accessor": "empresa.nome",
  "header": "Empresa",
  "dataType": "string",
  "label": "Nome da empresa"
}
```

The field key (`"nome"`) is used in layouts. The `accessor` is the actual
dot-notation path into the data record. This lets you use a short, readable
key in `form.json` and `listview.json` column arrays while accessing deep paths.
