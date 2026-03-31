# Quickstart: Build a new view in ~15 minutes

This guide walks you through creating a fully working view — list table + form
— from scratch. We'll create a `produtos` (products) view as the example.

**Prerequisites:** an existing app package (copy `packages/app-demo/` as a
starting point).

---

## Step 1: Create the view folder

```
packages/app-<name>/project/views/produtos/
```

Inside it, create four empty files:

```
fields.json
listview.json
form.json
data.json
```

---

## Step 2: Write `fields.json`

Every field used in either the table or the form must be declared here.

```json
{
  "$schema": "../../../../../schemas/fields.schema.json",
  "name": "produtos",
  "strings": {
    "singular": "produto",
    "plural": "produtos",
    "theItem": "o produto"
  },
  "fields": {
    "id": {
      "label": "ID",
      "header": "Nº",
      "dataType": "string",
      "colWidth": 50,
      "fieldWidth": 80,
      "colStyles": ["semibold", "tabular"],
      "mask": { "pattern": "0000", "digits": 4 },
      "readOnly": true
    },
    "nome": {
      "label": "Nome",
      "header": "Produto",
      "dataType": "string",
      "colWidth": "100%",
      "fieldWidth": "70%",
      "required": true,
      "render": { "layout": "link", "op": "edit" }
    },
    "preco": {
      "label": "Preço",
      "header": "Preço",
      "dataType": "decimal",
      "colWidth": 100,
      "fieldWidth": 140,
      "colTextAlign": "right",
      "render": { "layout": "decimal" },
      "footer": "{sum}"
    },
    "estoque": {
      "label": "Estoque",
      "header": "Estoque",
      "dataType": "integer",
      "colWidth": 80,
      "fieldWidth": 120,
      "colTextAlign": "right"
    },
    "ativo": {
      "label": "Ativo",
      "header": "Ativo",
      "dataType": "boolean",
      "fieldWidth": 180,
      "defaultValue": true,
      "render": { "layout": "booleanIcon" }
    },
    "actions": {
      "header": "",
      "colWidth": 100,
      "colTextAlign": "center",
      "render": { "layout": "actions" }
    }
  }
}
```

---

## Step 3: Write `listview.json`

```json
{
  "$schema": "../../../../../schemas/listview.schema.json",
  "name": "produtos",
  "type": "listView",
  "config": {
    "idAccessor": "id",
    "nameAccessor": "nome"
  },
  "columns": ["nome", "preco", "estoque", "ativo", "actions"],
  "actions": ["record_edit", "record_delete"],
  "toolbar": [
    { "type": "title", "text": "Produtos" },
    "add",
    "separator",
    "filterPanel"
  ],
  "filterPanel": {
    "layout": { "header": ["nome"] },
    "toolbar": ["filter", "filterMore"]
  }
}
```

The `columns` array references field names from `fields.json`. The `actions`
array references engine action strings (see [listview reference](reference/listview.md)
for the full list). The toolbar strings (`"add"`, `"filter"`, etc.) reference
control names defined in `project/app.json`.

---

## Step 4: Write `form.json`

```json
{
  "$schema": "../../../../../schemas/form.schema.json",
  "name": "produtos",
  "layout": {
    "sections": [
      {
        "initialState": "noheader",
        "columns": [
          [
            ["id", "ativo"],
            "nome"
          ],
          [
            "preco",
            "estoque"
          ]
        ]
      }
    ]
  },
  "add": {
    "title": "Novo produto",
    "toolbar": ["send", "cancel"]
  },
  "edit": {
    "title": "Editar {name}",
    "toolbar": ["previous", "next", { "type": "spacer" }, "send", "cancel"]
  },
  "detail": {
    "title": "{name}",
    "toolbar": ["edit", "close"]
  }
}
```

The `layout.sections[].columns` is a 2D array:

- Each item in the outer array is a **column** (rendered side by side).
- Each item inside a column is a **row** within that column.
- A row can be a single field name `"nome"` or an array of fields sharing the
  same row `["id", "ativo"]`.

Toolbar strings map to control names in `app.json`. The `{name}` and
`{singular}` tokens are replaced at runtime using `nameAccessor` and `strings`.

---

## Step 5: Write `data.json`

```json
[
  { "id": "0001", "nome": "Produto A", "preco": 29.90, "estoque": 100, "ativo": true },
  { "id": "0002", "nome": "Produto B", "preco": 49.90, "estoque": 25,  "ativo": true },
  { "id": "0003", "nome": "Produto C", "preco": 9.90,  "estoque": 0,   "ativo": false }
]
```

---

## Step 6: Register the view

### `views.json` — add the view name to `active`

```json
{ "active": ["empresas", "usuarios", "produtos"] }
```

### `metadataloader.js` — import and export the three JSON files

```js
import list_produtos   from "./produtos/listview.json";
import form_produtos   from "./produtos/form.json";
import fields_produtos from "./produtos/fields.json";

// merge into the existing export:
export default {
  listView:    { ..., produtos: list_produtos   },
  form:        { ..., produtos: form_produtos   },
  fieldConfig: { ..., produtos: fields_produtos },
};
```

### `dataloader.js` — import and export the data

```js
import produtos from "./produtos/data.json";

export default {
  ...,
  produtos,
};
```

---

## Step 7: Add a menu item

In `project/menu.json`, add an entry to `items`:

```json
{
  "type": "menuItem",
  "name": "produtos",
  "label": "Produtos",
  "icon": "package"
}
```

The `name` must match the view name exactly (used for routing).

---

## Step 8: Validate

```bash
npm run ai:check -- --project ./packages/app-<name>/project
```

Fix any errors before running the app.

---

## Result

You now have a fully working view with:

- A searchable, sortable table with edit/delete actions
- An add form and an edit form
- A filter panel
- Record navigation (previous/next) in the edit form

No React code was written.

---

## Next steps

- Add a `select` field with options → [fields.md § select](reference/fields.md#select-fields)
- Add tabs to the form → [form.md § tabs](reference/form.md#tabs-layout)
- Add a colorWrapper status badge → [patterns.md § colorWrapper](reference/patterns.md#colorwrapper)
- Embed a child list inside a form tab → [patterns.md § embedded listViews](reference/patterns.md#embedded-listviews-in-form-tabs)
