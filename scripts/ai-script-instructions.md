# AI Script Instructions for NeoFront

Keep scripts small, single-purpose, and consistent with existing `scripts/*.js`.

## Conventions

- Node CLI script with shebang: `#!/usr/bin/env node`.
- ESM only (repo has `"type": "module"`). Use `import ... from`.
- No new dependencies unless absolutely necessary (prefer built-in `fs`, `path`, `os`).
- Basic arg parsing: `--flag value` and `--no-color`, `--help/-h`.
- Default output is console; optionally support `--log <file>` with ANSI stripped.
- Skip folders/files starting with `__` when scanning project metadata.
- Use simple ANSI color helpers like existing scripts; allow `--no-color`.
- Exit codes:
  - `0` when no problems.
  - `3` when problems found (matches `validate-jsons.js`).

## Output format

- Print a short summary line at the end: `X files, Y warnings, Z errors`.
- Each finding should include:
  - file path (prefer basename + relative path when helpful)
  - a best-effort line number
  - a clear message with expected vs found values

## Metadata analysis (when applicable)

- Treat schema validation as separate; metadata analysis scripts should:
  - read JSON/JSONC (`stripJsonc` like `validate-jsons.js`)
  - load relevant view files under `<project>/views/**/{listview,form}.json`
  - cross-check references (e.g. embedded listView configs in `form.json` vs the target view’s `listview.json`).

## Do not

- Don’t refactor unrelated code.
- Don’t add “nice-to-have” features, interactive prompts, or watchers.
- Don’t hardcode project paths; take `--project <folder>`.
