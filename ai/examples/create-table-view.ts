/**
 * Example: Creating a list/table view from metadata.
 *
 * The engine renders list views via:
 * - `packages/neofront/src/components/listView/ListView.tsx`
 * - `packages/neofront/src/components/listView/DataTable.tsx`
 *
 * Key idea: the table is defined by:
 * - listview.json: columns, actions, toolbar, filter panel
 * - fields.json: column rendering, labels, formatting, options
 */

export {};

/*

Minimal listview.json

  packages/app-demo/project/views/<viewName>/listview.json

  {
    "$schema": "../../../../../schemas/listview.schema.json",
    "name": "<viewName>",
    "type": "listView",
    "language": "ptBR",
    "config": {
      "idAccessor": "id",
      "nameAccessor": "name"
    },
    "columns": ["name", "email", "actions"],

    // IMPORTANT:
    // `actions` is a list of CONTROL NAMES from appCfg.controls.
    // Those controls carry an `action` string that the engine handles.
    "actions": ["record_detail", "record_edit", "record_delete"],

    // Toolbar can be control names OR inline toolbar items (objects).
    "toolbar": [
      {"type": "title", "text": "<Título>"},
      "add",
      "separator",
      "search",
      "filterPanel",
      "listViewMore"
    ],

    // Optional: filter panel config
    "filterPanel": {
      "layout": { "header": ["name", "email"] },
      "toolbar": ["filter", "filterMore"]
    }
  }

Minimal fields.json additions

  packages/app-demo/project/views/<viewName>/fields.json

  {
    "$schema": "../../../../../schemas/fields.schema.json",
    "name": "<viewName>",
    "language": "ptBR",
    "strings": {
      "singular": "item",
      "plural": "itens",
      "theItem": "o item"
    },
    "fields": {
      "name": {
        "label": "Nome",
        "dataType": "string",

        // Link rendering uses the engine URL pattern.
        // Example: clicking navigates to ?v=<viewName>&op=detail&id=<id>
        "render": { "layout": "link", "op": "detail" }
      },

      "actions": {
        "header": "",
        "render": { "layout": "actions" }
      }
    }
  }

Engine action strings currently handled (reference only):

  - DataTable record actions: edit | detail | delete
  - ListView toolbar actions: add | toggleFilterPanel | edit | closeFilterPanel
  - Shell top/user actions: lightMode | darkMode | logout

TODO: If you introduce a new action string, it will likely log to console until
you add a generic capability (preferred) or wire app-specific behavior outside the engine.

*/
