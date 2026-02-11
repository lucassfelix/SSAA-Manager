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

## Examples

See `ai/examples/` for copyable, repo-aligned patterns.
