# `menu.json` Reference

**Schema:** `schemas/menu.schema.json`
**Location:** `project/menu.json`

`menu.json` defines the main navigation menu rendered in the sidebar navbar.

---

## Minimal example

```json
{
  "$schema": "../../../../schemas/menu.schema.json",
  "items": [
    {
      "type": "menuItem",
      "name": "empresas",
      "label": "Empresas",
      "icon": "building"
    },
    {
      "type": "menuItem",
      "name": "usuarios",
      "label": "Usuários",
      "icon": "users"
    }
  ]
}
```

---

## Top-level properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `$schema` | string | rec. | Relative path to `menu.schema.json` |
| `items` | array | yes | List of menu items |

---

## Menu item types

### `menuItem`

A navigable menu item. The `name` must match a view name from `views.json`
for navigation to work, unless using a `resolver`.

```json
{
  "type": "menuItem",
  "name": "usuarios",
  "label": "Usuários",
  "description": "Gerenciar usuários do sistema",
  "icon": "users",
  "badge": 5,
  "badgeEmphasis": "red.6",
  "emphasis": "blue.5"
}
```

| Property | Type | Description |
|----------|------|-------------|
| `type` | `"menuItem"` | Item type |
| `name` | string | View name (used for routing) or logical name with `resolver` |
| `label` | string | Display text |
| `description` | string | Subtitle text below the label |
| `icon` | string | Icon name (from the active icon library or `iconMap`) |
| `emphasis` | string | Color emphasis — e.g. `"blue.5"`, `"green.6"`. Applied as a color hint to the item |
| `badge` | string \| number | Badge label (count or text) displayed beside the item |
| `badgeEmphasis` | string | Badge color — e.g. `"red.6"` |
| `resolver` | string | Named resolver function for dynamic URL generation or special routing. See [Resolver](#resolver) |
| `items` | menuItem[] | Sub-items (creates a submenu) |

### `separator`

A horizontal divider line.

```json
{ "type": "separator" }
```

### `subtitle`

A non-navigable label that groups items below it.

```json
{
  "type": "subtitle",
  "label": "Cadastros"
}
```

---

## Submenus

Nest `items` inside a `menuItem` to create a submenu:

```json
{
  "type": "menuItem",
  "name": "financeiro",
  "label": "Financeiro",
  "icon": "wallet",
  "items": [
    { "type": "menuItem", "name": "contas", "label": "Contas", "icon": "creditCard" },
    { "type": "menuItem", "name": "lancamentos", "label": "Lançamentos", "icon": "cash" }
  ]
}
```

Global submenu behavior (hover vs click, offset) is set in `app.json` under `menu`.

---

## Resolver

The `resolver` property lets a menu item point to a custom route or dynamic
URL instead of a standard `?v=<name>` view URL. The value is a string key
that maps to a resolver function registered in the app package.

```json
{
  "type": "menuItem",
  "name": "usuarios",
  "label": "Meus usuários",
  "icon": "users",
  "resolver": "currentUserFilter"
}
```

Resolver functions are app-specific and live in the project's `src/` folder.
The resolver receives context (e.g. the logged-in user) and returns a URL string.

---

## Full example

```json
{
  "$schema": "../../../../schemas/menu.schema.json",
  "items": [
    {
      "type": "subtitle",
      "label": "Principal"
    },
    {
      "type": "menuItem",
      "name": "dashboard",
      "label": "Dashboard",
      "icon": "layoutDashboard"
    },
    {
      "type": "separator"
    },
    {
      "type": "subtitle",
      "label": "Cadastros"
    },
    {
      "type": "menuItem",
      "name": "empresas",
      "label": "Empresas",
      "icon": "building",
      "description": "Gerenciar cadastro de empresas"
    },
    {
      "type": "menuItem",
      "name": "usuarios",
      "label": "Usuários",
      "icon": "users",
      "badge": "novo",
      "badgeEmphasis": "blue.6"
    },
    {
      "type": "menuItem",
      "name": "vendas",
      "label": "Vendas",
      "icon": "shoppingCart",
      "items": [
        { "type": "menuItem", "name": "pedidos",  "label": "Pedidos",  "icon": "fileInvoice" },
        { "type": "menuItem", "name": "produtos", "label": "Produtos", "icon": "package" }
      ]
    }
  ]
}
```
