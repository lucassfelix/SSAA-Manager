/**
 * Example: Tabbed form with an embedded child list view.
 *
 * Pattern: a parent entity (e.g. clinica) has related child entities (users,
 * patients) displayed as lists in form tabs. Clicking an iconWithBadge icon
 * in the parent list opens the parent form directly on the correct tab.
 *
 * Files involved:
 * - Parent fields.json    → iconWithBadge fields for each child type
 * - Parent listview.json  → include iconWithBadge fields in columns
 * - Parent form.json      → tabs: one data tab + one list tab per child
 * - Child fields.json     → unchanged (reused by the embedded list)
 * - Child form.json       → unchanged (used when opening a child record)
 */

export {};

/*

=======================================================================
PARENT: packages/app-ssaa/project/views/clinicas/fields.json (excerpt)
=======================================================================

{
  "fields": {

    // 1) Each badge column needs its own field definition.
    //    "tab" must match the tab "name" in form.json.

    "usuarios": {
      "icon": "users",
      "iconColor": "var(--nf-secondary-color)",
      "colWidth": 40,
      "colTextAlign": "center",
      "render": { "layout": "iconWithBadge", "op": "detail", "tab": "usuarios" }
    },

    "pacientes": {
      "icon": "dental",
      "iconColor": "var(--nf-secondary-color)",
      "colWidth": 40,
      "colTextAlign": "center",
      "render": { "layout": "iconWithBadge", "op": "detail", "tab": "pacientes" }
    },

    // 2) A spacer helps visually separate the badge group from action buttons.
    "spacer": {
      "colWidth": 40,
      "render": { "layout": "blank" }
    }
  }
}


=======================================================================
PARENT: packages/app-ssaa/project/views/clinicas/listview.json (excerpt)
=======================================================================

{
  "columns": ["nome", "usuarios", "pacientes", "spacer", "actions"],
  "actions": ["record_edit", "record_delete"],
  "toolbar": [
    { "type": "title", "text": "Clínicas" },
    "add"
  ]
}


=======================================================================
PARENT: packages/app-ssaa/project/views/clinicas/form.json
=======================================================================

{
  "name": "clinicas",
  "layout": {
    "tabs": [

      // Tab 1: regular data fields (sections layout)
      {
        "label": "Cadastro",
        "name": "cadastro",
        "sections": [
          {
            "initialState": "noheader",
            "columns": [
              ["nome"]
            ]
          }
        ]
      },

      // Tab 2: embedded child list
      // The "name" MUST match the child view folder name.
      // The "tab.name" MUST match what render.tab uses in the parent's fields.json.
      {
        "label": "Usuários",
        "name": "usuarios",           ← matches render.tab in iconWithBadge field
        "icon": "users",
        "iconColor": "var(--nf-secondary-color)",
        "listView": {
          "name": "usuarios",         ← child view name (metadata loaded from there)
          "config": {
            "idAccessor": "id",
            "nameAccessor": "nome",
            "rowClassAccessor": "none"
          },
          "columns": ["nome", "actions"],
          "actions": ["record_edit", "record_delete"],
          "toolbar": ["add_text"]
        }
      },

      // Tab 3: another child list
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
    ]
  },
  "edit":   { "title": "Clínica {name}", "toolbar": ["send", "delete", "cancel"] },
  "add":    { "title": "Nova clínica",   "toolbar": ["send", "cancel"] },
  "detail": { "title": "Clínica {name}", "toolbar": ["edit", "close"] }
}


=================
CHECKLIST
=================

□ Parent fields.json:
    - iconWithBadge fields for each child, render.tab matches tab "name"
    - spacer field for visual gap

□ Parent listview.json:
    - Include iconWithBadge field names in columns array

□ Parent form.json:
    - Use "tabs" layout (not "sections")
    - Tab 1: "sections" for data fields
    - Tab N: "listView" with child view "name" for each embedded list
    - Tab "name" values must match render.tab in parent fields.json

□ Child metadata (fields.json, form.json) is unchanged — it is reused
  by the embedded list for rendering + by child forms when opening a record.

□ Run npm run ai:check

*/
