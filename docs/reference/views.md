# `views.json` Reference

**Schema:** `schemas/views.schema.json`
**Location:** `project/views/views.json`

`views.json` is the active view registry. Only views listed here are loaded
and available in the application.

---

## Structure

```json
{
  "$schema": "../../../../schemas/views.schema.json",
  "active": [
    "empresas",
    "usuarios",
    "produtos"
  ]
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `active` | string[] | yes | Names of active views. Each name must match a folder in `project/views/` |

---

## How it works

1. The app imports `views.json` and passes `viewsCfg.active` to the engine as `activeViews`.
2. The engine uses this list to know which views are valid navigation targets.
3. `metadataloader.js` and `dataloader.js` must export data for every view in the `active` list.

---

## View folder requirements

For each name in `active`, the following files must exist:

```
project/views/<name>/
  fields.json    ← imported by metadataloader.js
  listview.json  ← imported by metadataloader.js
  form.json      ← imported by metadataloader.js
  data.json      ← imported by dataloader.js (mock mode)
```

---

## Adding a new view — checklist

1. Create the `project/views/<name>/` folder with the four JSON files
2. Add `"<name>"` to the `active` array in `views.json`
3. Add imports + exports to `metadataloader.js`
4. Add import + export to `dataloader.js`
5. Add a `menuItem` in `menu.json`
6. Run `npm run ai:check`

---

## Removing a view

1. Remove the name from `active`
2. Remove imports from `metadataloader.js` and `dataloader.js`
3. Remove the menu item from `menu.json`
4. Optionally delete the view folder (confirm first)
