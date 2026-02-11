# NeoFront change (metadata-first, minimal diff)

You are working in the NeoFront monorepo.

Before writing or editing any code:

1) Read and follow `.github/copilot-instructions.md` (Architecture Contract + Invalid Patterns + Change Strategy).
2) Consult the most relevant templates in `ai/examples/`:
   - `create-form-from-schema.ts`
   - `create-table-view.ts`
   - `add-view-action.ts`
   - `project-loader-pattern.ts`
   - `metadata-validation-flow.md`

Now, handle the user request with this workflow:

1) Restate the goal in 1–3 bullets.
2) List the non-negotiable constraints that apply.
3) Propose a minimal plan (metadata/project changes first).
4) Implement as a minimal diff (avoid refactors unless required).
5) Verify with `npm run ai:check`.

Output requirements:

- Prefer project metadata/schema changes over engine changes.
- If an engine change is necessary, keep it generic and metadata-driven.
- Ask up to 3 clarifying questions only if truly blocked; otherwise pick a sensible default.

User request:
{{prompt}}
