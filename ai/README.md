# NeoFront AI Context

This folder is **static context** for LLM-assisted engineering in this repo.

## Workflow (use this every time)

1. Restate the requirement in 1–3 bullets.
2. List constraints from `.github/copilot-instructions.md`.
3. Propose a minimal change plan (metadata-first).
4. Implement as a minimal diff.
5. Verify with `npm run ai:check`.

## Repo mental model

- `packages/neofront/` is the engine (generic, metadata-driven, project-agnostic).
- `packages/app-*/project/` is the source of truth for app metadata + mock data.
- `schemas/` is the source of truth for JSON schemas.
- `scripts/` contains validators and metadata tooling.

## Context file

`ai/CONTEXT.md` is a dense single-file reference covering all JSON schemas,
patterns, and wiring. Attach it as file context in any new chat session or
paste it as a system prompt for maximum accuracy without reading 8 files.

## Examples

| File | Covers |
|------|--------|
| `create-project-bootstrap.ts` | Full new project from scratch |
| `create-form-from-schema.ts` | New view (form + fields) |
| `create-table-view.ts` | New list/table view |
| `tabbed-form-with-embedded-list.ts` | Tabs + child lists + iconWithBadge |
| `add-view-action.ts` | Custom toolbar action |
| `project-loader-pattern.ts` | main.tsx wiring |
| `metadata-validation-flow.md` | Validation loop |

## Documentation

Full human-readable docs in `docs/`. Start with `docs/INDEX.md`.

## Copilot Chat

- Prefer starting a new thread with the `/neofront-change` prompt.