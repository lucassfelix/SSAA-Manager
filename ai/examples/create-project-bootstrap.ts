/**
 * Example: Full project bootstrap — wiring a new app package.
 *
 * Use this as a template when creating a new app-* package from scratch.
 * Every piece is minimal; only the essential wiring is shown.
 *
 * Steps:
 * 1. Create the folder structure
 * 2. Write the four project JSON files (app, menu, login, views)
 * 3. Write fields/listview/form/data for each view
 * 4. Wire metadataloader.js and dataloader.js
 * 5. Wire main.tsx
 * 6. Run npm run ai:check
 */

export {};

/*

=======================================================================
1. FOLDER STRUCTURE
=======================================================================

packages/app-<name>/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── images/
│       ├── logo-light.svg
│       └── logo-dark.svg
├── src/
│   ├── main.tsx
│   └── styles/
│       ├── theme.css
│       └── app.css
└── project/
    ├── app.json
    ├── menu.json
    ├── login.json
    └── views/
        ├── views.json
        ├── metadataloader.js
        ├── dataloader.js
        └── <viewName>/
            ├── fields.json
            ├── listview.json
            ├── form.json
            └── data.json


=======================================================================
2a. project/app.json (minimal)
=======================================================================

{
  "$schema": "../../../../schemas/app.schema.json",
  "version": "0.3.0",
  "language": "pt-br",
  "projectId": "app-name",
  "strings": {
    "appVersion": "v0.1",
    "appTitle": "My App",
    "deleteItemConfirm": "Confirmar exclusão"
  },
  "paths": { "images": "/images/" },
  "data": { "source": "mock" },
  "shell": {
    "header": {
      "height": 60,
      "bordered": true,
      "items": ["collapseToggle", "logo", "spacer", "mainTitle", "themeSwitch", "userToolbar"]
    },
    "navbar": {
      "width": 240,
      "collapsible": true,
      "collapsedWidth": 60,
      "bordered": true,
      "icons": true,
      "items": ["mainMenu"]
    },
    "userToolbar": [
      {
        "type": "iconButton",
        "icon": "user",
        "tip": "Menu do usuário",
        "items": [
          { "type": "text", "text": "{userName}" },
          { "type": "separator" },
          { "name": "logout", "label": "Sair", "icon": "logout", "action": "logout" }
        ]
      }
    ]
  },
  "menu": {
    "items": {
      "gap": 4,
      "radius": "sm",
      "labelSize": "sm",
      "labelWeight": "500",
      "iconFilled": false,
      "iconSize": 20,
      "iconStroke": 1.5
    }
  },
  "toolbars": {
    "horizontalPadding": 12,
    "verticalPadding": 8,
    "gap": 8,
    "iconButtons": { "size": "sm", "radius": "sm", "iconSize": 18, "iconStroke": 1.5 },
    "textButtons":  { "size": "sm", "radius": "sm", "fontSize": "sm", "fontWeight": "500" }
  },
  "topControls": {
    "mainTitle": { "label": "My App" },
    "collapseToggle": { "rotateIcon": true, "tipCollapse": "Recolher", "tipExpand": "Expandir" },
    "logo": { "expandedHeight": 40, "collapsedHeight": 32, "altText": "Logo" },
    "themeSwitch": { "type": "iconButton", "tipLight": "Modo claro", "tipDark": "Modo escuro" }
  },
  "controls": {
    "send":          { "type": "textButton", "label": "Salvar",    "icon": "deviceFloppy", "action": "send" },
    "cancel":        { "type": "textButton", "label": "Cancelar",                           "action": "cancel" },
    "close":         { "type": "textButton", "label": "Fechar",                             "action": "close" },
    "edit":          { "type": "textButton", "label": "Editar",    "icon": "edit",          "action": "edit" },
    "delete":        { "type": "textButton", "label": "Excluir",   "icon": "trash",         "action": "delete", "class": "critical" },
    "add":           { "type": "textButton", "label": "Adicionar", "icon": "plus",          "action": "add" },
    "add_text":      { "type": "textButton", "label": "Adicionar",                          "action": "add" },
    "previous":      { "type": "iconButton", "icon": "chevronLeft",  "tip": "Anterior",     "action": "previous" },
    "next":          { "type": "iconButton", "icon": "chevronRight", "tip": "Próximo",      "action": "next" },
    "filter":        { "type": "textButton", "label": "Filtrar",  "icon": "filter",         "action": "filter" },
    "filterMore":    { "type": "iconButton", "icon": "dotsVertical", "tip": "Mais opções",  "action": "filterMore" },
    "filterPanel":   { "type": "iconButton", "icon": "filter",       "tip": "Filtros",      "action": "toggleFilterPanel", "toggle": true },
    "confirmDelete": { "type": "textButton", "label": "Confirmar exclusão", "class": "critical", "action": "confirmDelete" },
    "cancelDelete":  { "type": "textButton", "label": "Cancelar",                           "action": "cancelDelete" }
  },
  "listViews": {
    "defaultList": "<firstViewName>",
    "table": {
      "striped": false,
      "bordered": false,
      "rowBorders": true,
      "horizontalSpacing": "sm",
      "verticalSpacing": "xs",
      "trueIcon": "circleCheck",
      "falseIcon": "circleX",
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
  },
  "forms": {
    "fieldSize": "sm",
    "verticalGap": "sm",
    "fullHeight": false,
    "clearSelectionValue": "__clear__",
    "selectionCheck": true
  },
  "theme": {
    "defaultUIScale": 100,
    "iconFamily": "tabler",
    "lightMode": { "expandedLogo": "logo-light.svg", "collapsedLogo": "logo-light.svg" },
    "darkMode":  { "expandedLogo": "logo-dark.svg",  "collapsedLogo": "logo-dark.svg" }
  }
}


=======================================================================
2b. project/menu.json (minimal)
=======================================================================

{
  "$schema": "../../../../schemas/menu.schema.json",
  "items": [
    {
      "type": "menuItem",
      "name": "<viewName>",
      "label": "<Label>",
      "icon": "<iconName>"
    }
  ]
}


=======================================================================
2c. project/login.json (minimal)
=======================================================================

{
  "$schema": "../../../../schemas/form.schema.json",
  "name": "login",
  "layout": {
    "sections": [
      {
        "initialState": "noheader",
        "columns": [ ["username", "password"] ]
      }
    ]
  },
  "add": { "toolbar": ["login"] }
}

// Also add to app.json:
// "login": {
//   "fullHeight": true,
//   "width": 400,
//   "themeSwitch": true,
//   "logo": { "height": 60, "altText": "Logo",
//     "lightMode": { "image": "logo-light.svg" },
//     "darkMode":  { "image": "logo-dark.svg" } },
//   "fields": {
//     "username": { "label": "Usuário",   "dataType": "string",        "required": true },
//     "password": { "label": "Senha",     "dataType": "passwordInput", "required": true }
//   }
// }
// And add "login" control: { "type": "textButton", "label": "Entrar", "action": "login" }


=======================================================================
2d. project/views/views.json
=======================================================================

{
  "$schema": "../../../../schemas/views.schema.json",
  "active": ["<viewName>"]
}


=======================================================================
3. Per-view files (repeat for each view, see create-form-from-schema.ts)
=======================================================================

// fields.json, listview.json, form.json, data.json — see that example.


=======================================================================
4. project/views/metadataloader.js
=======================================================================

import list_X   from "./<viewName>/listview.json";
import form_X   from "./<viewName>/form.json";
import fields_X from "./<viewName>/fields.json";

export default {
  listView:    { "<viewName>": list_X },
  form:        { "<viewName>": form_X },
  fieldConfig: { "<viewName>": fields_X },
};


=======================================================================
5. project/views/dataloader.js
=======================================================================

import viewName from "./<viewName>/data.json";

export default { "<viewName>": viewName };


=======================================================================
6. src/main.tsx
=======================================================================

import { BrowserRouter } from "react-router-dom";
import { App, getRoot } from "@neofront/core";

import appCfg   from "project/app.json";
import menuCfg  from "project/menu.json";
import loginCfg from "project/login.json";
import viewsCfg from "project/views/views.json";
import metadata from "project/views/metadataloader.js";
import mockData from "project/views/dataloader.js";

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
      mockData={mockData}
    />
  </BrowserRouter>
);

// For API mode: replace mockData={mockData} with apiTableNames={viewsCfg.active}
// and add dataEnhancer for any response transformation needed.


=======================================================================
7. VERIFY
=======================================================================

npm run ai:check -- --project ./packages/app-<name>/project

*/
