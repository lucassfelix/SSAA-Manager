# `app.json` Reference

**Schema:** `schemas/app.schema.json`
**Location:** `project/app.json`

`app.json` is the central application configuration. It defines the shell
layout, theme, icon library, global defaults for lists and forms, and the
control library that all toolbars draw from.

---

## Top-level structure

```json
{
  "$schema": "../../../../schemas/app.schema.json",
  "version": "0.3.0",
  "language": "pt-br",
  "projectId": "my-app",
  "strings": { ... },
  "paths": { ... },
  "data": { ... },
  "shell": { ... },
  "menu": { ... },
  "toolbars": { ... },
  "topControls": { ... },
  "controls": { ... },
  "login": { ... },
  "listViews": { ... },
  "forms": { ... },
  "theme": { ... }
}
```

---

## Identity

| Property | Type | Description |
|----------|------|-------------|
| `version` | `"0.3.0"` | Schema version — always this value |
| `language` | `"en-us"` \| `"es-419"` \| `"pt-br"` | App locale |
| `projectId` | string | Unique ID used for browser settings storage (localStorage key) |
| `comments` | string | Free-form notes (ignored by engine) |

---

## `strings`

Localized UI strings. Required keys: `appVersion`, `appTitle`, `deleteItemConfirm`.

```json
"strings": {
  "appVersion": "v0.1",
  "appTitle": "My App",
  "deleteItemConfirm": "Confirmar exclusão"
}
```

Additional keys appear in the header/toolbar (e.g. `"loggedInAs"`, `"logout"`).

---

## `paths`

```json
"paths": {
  "images": "/images/"
}
```

`images` is the base path prepended to image field values when displaying
thumbnails/avatars. Required.

---

## `data`

```json
"data": {
  "source": "mock",
  "apiBaseUrl": "http://localhost:3000"
}
```

| Property | Values | Description |
|----------|--------|-------------|
| `source` | `"mock"` \| `"api"` | Data source mode |
| `apiBaseUrl` | string | Base URL for REST API calls (API mode only) |

---

## `shell`

Defines the application shell layout: header and navbar.

### `shell.header`

```json
"shell": {
  "header": {
    "fullWidth": false,
    "height": 60,
    "bordered": true,
    "items": ["collapseToggle", "logo", "spacer", "mainTitle", "themeSwitch", "userToolbar"]
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `fullWidth` | boolean | Header spans full viewport width |
| `height` | number | Header height in px |
| `bordered` | boolean | Bottom border on the header |
| `items` | string[] | Ordered items in the header bar |

Header item tokens: `collapseToggle` \| `logo` \| `spacer` \| `mainTitle` \|
`themeSwitch` \| `userToolbar`

### `shell.navbar`

```json
"shell": {
  "navbar": {
    "width": 240,
    "collapsible": true,
    "collapsedWidth": 60,
    "bordered": true,
    "icons": true,
    "footer": true,
    "items": ["mainMenu"],
    "footerItems": ["logo"]
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `width` | number | Expanded navbar width in px |
| `collapsible` | boolean | Can the navbar collapse |
| `collapsedWidth` | number | Width when collapsed (icon-only mode) |
| `bordered` | boolean | Right border on navbar |
| `icons` | boolean | Show icons in collapsed mode |
| `footer` | boolean | Show footer area in navbar |
| `items` | string[] | Items in the navbar body (usually `["mainMenu"]`) |
| `footerItems` | string[] | Items in the navbar footer (e.g. `["logo"]`) |

---

## `menu`

Global menu appearance settings (item styling, submenu behavior).

```json
"menu": {
  "openSubmenusOnHover": false,
  "submenuOffset": 8,
  "items": {
    "gap": 4,
    "radius": "sm",
    "labelSize": "sm",
    "labelWeight": "500",
    "iconFilled": false,
    "iconSize": 20,
    "iconStroke": 1.5
  }
}
```

`items` and `submenuItems` share the same shape. `submenuItems` overrides for
second-level items.

---

## `toolbars`

Global defaults applied to all toolbars unless overridden at the view level.

```json
"toolbars": {
  "horizontalPadding": 12,
  "verticalPadding": 8,
  "gap": 8,
  "align": "center",
  "upperBorder": false,
  "iconButtons": {
    "size": "sm",
    "radius": "sm",
    "filled": false,
    "iconSize": 18,
    "iconStroke": 1.5
  },
  "textButtons": {
    "size": "sm",
    "radius": "sm",
    "fontSize": "sm",
    "fontWeight": "500",
    "uppercase": false
  }
}
```

---

## `topControls`

Configuration for the fixed header UI elements.

```json
"topControls": {
  "mainTitle": { "label": "My Application" },
  "collapseToggle": {
    "rotateIcon": true,
    "tipCollapse": "Recolher menu",
    "tipExpand": "Expandir menu"
  },
  "logo": {
    "expandedHeight": 40,
    "collapsedHeight": 32,
    "altText": "Logo"
  },
  "themeSwitch": {
    "type": "iconButton",
    "tipLight": "Modo claro",
    "tipDark": "Modo escuro"
  }
}
```

`themeSwitch.type`: `"iconButton"` \| `"switch"` \| `"textButton"`

---

## `controls`

The global control library. Every button in every toolbar is defined here and
referenced by name. This is a named map of control definitions.

```json
"controls": {
  "send": {
    "type": "textButton",
    "label": "Salvar",
    "icon": "deviceFloppy",
    "tip": "Salvar as alterações",
    "action": "send"
  },
  "cancel": {
    "type": "textButton",
    "label": "Cancelar",
    "action": "cancel"
  },
  "add": {
    "type": "textButton",
    "label": "Adicionar",
    "icon": "plus",
    "action": "add"
  },
  "delete": {
    "type": "textButton",
    "label": "Excluir",
    "icon": "trash",
    "class": "critical",
    "action": "delete"
  },
  "edit": {
    "type": "iconButton",
    "icon": "edit",
    "tip": "Editar",
    "action": "edit"
  }
}
```

### Control properties

| Property | Type | Description |
|----------|------|-------------|
| `type` | `"iconButton"` \| `"textButton"` \| `"separator"` \| `"link"` | Control type |
| `name` | string | Logical name (defaults to the key) |
| `label` | string | Button text (textButton) |
| `icon` | string | Icon name |
| `tip` | string | Tooltip |
| `selectedTip` | string | Tooltip when toggled |
| `toggle` | boolean | Button toggles on/off |
| `action` | string | Action string dispatched when clicked |
| `default` | boolean | Whether this control is the default action |
| `class` | string | Visual class — `"warning"` or `"critical"` for colored buttons |
| `width` | number | Button width in px |
| `items` | array | Dropdown menu items |

### Engine-handled action strings

These action strings from controls are handled natively by the engine:

| Action | Triggered by | Description |
|--------|-------------|-------------|
| `"add"` | Toolbar | Open add form |
| `"edit"` | Toolbar / row | Open edit form |
| `"detail"` | Toolbar / row | Open detail form |
| `"delete"` | Row / form | Trigger delete confirmation |
| `"send"` | Form toolbar | Submit form |
| `"cancel"` | Form toolbar | Close form without saving |
| `"close"` | Form toolbar | Close form (same as cancel visually) |
| `"toggleFilterPanel"` | Toolbar | Toggle filter panel |
| `"lightMode"` | User toolbar | Switch to light mode |
| `"darkMode"` | User toolbar | Switch to dark mode |
| `"logout"` | User toolbar | Log out |
| `"previous"` | Form toolbar | Navigate to previous record |
| `"next"` | Form toolbar | Navigate to next record |

Custom action strings (not in the list above) will be dispatched but have no
default handler — implement them at the app level or as a new generic engine
capability.

---

## `shell.userToolbar`

Array of toolbar items displayed in the top-right header area (user menu area).

```json
"shell": {
  "userToolbar": [
    {
      "type": "iconButton",
      "icon": "user",
      "tip": "Menu do usuário",
      "items": [
        { "type": "text", "text": "{userName}" },
        { "type": "separator" },
        { "name": "logout", "label": "Sair", "icon": "logout" }
      ]
    }
  ]
}
```

---

## `listViews`

Global default appearance for all list views (unless overridden per view).

```json
"listViews": {
  "defaultList": "empresas",
  "table": {
    "striped": false,
    "bordered": false,
    "rowBorders": true,
    "horizontalSpacing": "sm",
    "verticalSpacing": "xs",
    "trueIcon": "circleCheck",
    "falseIcon": "circleX",
    "imageRadius": "xl",
    "booleanIconsSize": 18
  },
  "pagination": {
    "defaultPageSize": 25,
    "pageSizes": [10, 25, 50, 100],
    "showFirstLast": true,
    "showPageSizeSelector": true,
    "showTotalItems": true
  },
  "messageBox": {
    "deleteControls": ["confirmDelete", "cancelDelete"]
  }
}
```

`defaultList` sets which view is opened on app launch.

---

## `forms`

Global form defaults.

```json
"forms": {
  "fieldSize": "sm",
  "verticalGap": "sm",
  "fullHeight": false,
  "clearSelectionValue": "__clear__",
  "selectionCheck": true,
  "outlinedSections": false,
  "imageRadius": "md",
  "imageHeight": 120,
  "tabs": {
    "variant": "default",
    "justify": "left",
    "radius": "sm"
  }
}
```

---

## `theme`

Theme and visual configuration.

```json
"theme": {
  "defaultUIScale": 100,
  "iconFamily": "tabler",
  "mainFontFamily": null,
  "headingsFontFamily": null,
  "lightMode": {
    "expandedLogo": "logo-light.svg",
    "collapsedLogo": "logo-icon-light.svg"
  },
  "darkMode": {
    "expandedLogo": "logo-dark.svg",
    "collapsedLogo": "logo-icon-dark.svg"
  },
  "iconMapTabler": {
    "dental": "tooth"
  },
  "iconMapMaterial": {
    "dental": "dentistry"
  }
}
```

| Property | Description |
|----------|-------------|
| `defaultUIScale` | Scale percentage (100 = normal, 90 = compact) |
| `iconFamily` | `"tabler"` or `"material"` — which icon library to use |
| `mainFontFamily` | CSS font-family for body text (`null` = Mantine default) |
| `headingsFontFamily` | CSS font-family for headings |
| `lightMode` / `darkMode` | Logo files (relative to `paths.images`) |
| `iconMapTabler` | Map custom icon names to Tabler icon names |
| `iconMapMaterial` | Map custom icon names to Material Symbols names |

Icon names in `iconMapTabler`/`iconMapMaterial` let you use semantic names like
`"dental"` throughout your JSON rather than icon-library-specific names.
