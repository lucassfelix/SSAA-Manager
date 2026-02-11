/**
 * Example: Creating a form purely from metadata.
 *
 * Goal: teach the “metadata-first” path by showing the minimum set of files
 * required for a view form to work in NeoFront.
 *
 * Notes (important):
 * - The engine renders forms via `packages/neofront/src/components/form/Form.tsx`.
 * - The app wires metadata+data via `App` props in `packages/app-<projname>/src/main.tsx`.
 * - Form ops supported by the engine: "add" | "edit" | "detail" ("filter" is special).
 */

export {};

/*

STEP 1) Create the view folder

  packages/app-demo/project/views/<viewName>/
    form.json
    listview.json
    fields.json
    data.json                 (or records.json in other projects)

TODO: Replace <viewName> with your view key (must match JSON "name").

STEP 2) Add to active views

  packages/app-demo/project/views/views.json

  {
    "active": [
      "<viewName>"
    ]
  }

STEP 3) Register it in the project metadata loader

  packages/app-demo/project/views/metadataloader.js

  import list_<viewName> from "./<viewName>/listview.json";
  import form_<viewName> from "./<viewName>/form.json";
  import fields_<viewName> from "./<viewName>/fields.json";

  export default {
    listView: { <viewName>: list_<viewName> },
    form: { <viewName>: form_<viewName> },
    fieldConfig: { <viewName>: fields_<viewName> },
  };

STEP 4) Provide data (mock)

  packages/app-demo/project/views/dataloader.js

  import <viewName> from "./<viewName>/data.json";
  export default { <viewName> };

STEP 5) Minimal form.json

  packages/app-demo/project/views/<viewName>/form.json

  {
    "$schema": "../../../../../schemas/form.schema.json",
    "name": "<viewName>",
    "layout": {
      "sections": [
        {
          "columns": [
            [
              ["id"],
              "name"
            ]
          ]
        }
      ]
    },
    "add": {
      "title": "Novo {singular}",
      "toolbar": ["send", "cancel"]
    },
    "edit": {
      "title": "Editar {name}",
      "toolbar": ["previous", "next", {"type": "spacer"}, "send", "cancel"]
    },
    "detail": {
      "title": "{name}",
      "toolbar": ["edit", "close"]
    }
  }

The toolbar strings ("send", "cancel", etc.) map to `appCfg.controls` entries
from packages/app-<projname>/project/app.json.

STEP 6) Minimal fields.json

  packages/app-demo/project/views/<viewName>/fields.json

  {
    "$schema": "../../../../../schemas/fields.schema.json",
    "name": "<viewName>",
    "strings": {
      "singular": "item",
      "plural": "itens",
      "theItem": "o item"
    },
    "fields": {
      "id": { "label": "ID", "dataType": "string", "readOnly": true },
      "name": { "label": "Nome", "dataType": "string", "required": true }
    }
  }

STEP 7) Verify

  npm run ai:check

*/
