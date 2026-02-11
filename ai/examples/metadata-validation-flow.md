# Metadata Validation Flow

NeoFront uses a simple “verify loop” to keep metadata and schemas consistent.

## The one command

- Run: `npm run ai:check`

This runs three scripts in order:

1) `scripts/schema-validator.js`
   - Checks schema hygiene (descriptions, additionalProperties rules).
   - Writes `schema-validator.log`.

2) `scripts/json-validator.js`
   - Validates all project JSON files against schemas.
   - Writes `json-validator.log`.
   - Exit code `3` if validation failures exist.

3) `scripts/metadata-analyzer.js`
   - Cross-checks metadata consistency beyond JSON Schema.
   - Writes `metadata-analyzer.log`.
   - Exit code `3` if metadata errors exist.

## Useful variants

- Different project: `npm run ai:check -- --project ./packages/app-demo/project`
- No ANSI output: `npm run ai:check -- --no-color`
- Custom logs folder: `npm run ai:check -- --logDir ./tmp`

## What to do on failures

- Fix JSON/schema mismatches first (json-validator).
- Fix cross-file issues second (metadata-analyzer).
- Re-run `npm run ai:check` until clean.
