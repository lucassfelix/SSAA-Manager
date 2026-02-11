/**
 * Example: Add a new action button to a view toolbar.
 *
 * In NeoFront today:
 * - Views reference CONTROL NAMES (strings) in listview.json / form.json toolbars.
 * - Control definitions live in `packages/app-<projname>/project/app.json` under `controls`.
 * - Controls provide an `action` string; the engine decides what to do with it.
 */

export {};

/*

1) Define a new control in packages/app-demo/project/app.json

  {
    "controls": {
      "revalidar": {
        "type": "textButton",
        "label": "Revalidar",
        "tip": "Clique para revalidar as informações.",

        // The action string is what toolbars dispatch.
        "action": "revalidate"
      }
    }
  }

2) Reference it in a view toolbar

  packages/app-demo/project/views/<viewName>/listview.json

  {
    "toolbar": [
      "add",
      "separator",
      "revalidar",
      "listViewMore"
    ]
  }

3) Important limitation (current behavior)

If the engine does not handle the action string, it will typically fall back to
logging it (no business logic will run).

TODO: Decide which approach you want for “new actions”:

  A) Prefer reusing existing engine actions (add/edit/detail/delete, etc.).
     This is zero-engine-change.

  B) If you truly need a new capability, implement it as a GENERIC feature in
     `packages/neofront` driven by metadata (not domain-specific branching).
     Example direction: a generic “navigate” action with a metadata-defined URL.

  C) If it must be app-specific, keep it in the app package (not in the engine).
     (This may require new extension points in the engine first.)

*/
