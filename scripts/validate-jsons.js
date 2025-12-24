#!/usr/bin/env node

// Validate JSON files under a project folder against schemas.

// #region --------------------------------------------------------------------------------- Imports

import fs from 'fs';
import { EOL } from 'os';
import path from 'path';
import Ajv from 'ajv';

// #endregion

// #region --------------------------------------------------------------------------------- Helpers

// Strip JSONC comments (/* ... */ and // ...)
function stripJsonc(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/,\s*(?=[}\]])/g, '');
}

// Collect JSON files recursively
function collectJsonFiles(dir) {
  const res = [];
  if (!fs.existsSync(dir)) {
    return res;
  }
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('__')) {
      continue;
    }
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      res.push(...collectJsonFiles(full));
    } else if (e.isFile() && e.name.endsWith('.json')) {
      res.push(full);
    }
  }
  return res;
}

// Load schemas from folder
function loadSchemas(folder) {
  const schemas = {};
  if (!fs.existsSync(folder)) {
    return schemas;
  }
  for (const f of fs.readdirSync(folder)) {
    if (!f.endsWith('.json')) {
      continue;
    }
    try {
      const raw = fs.readFileSync(path.join(folder, f), 'utf8');
      const json = JSON.parse(stripJsonc(raw));
      // Strip .schema suffix if present (e.g. listview.schema.json -> listview)
      let key = path.basename(f, '.json');
      if (key.endsWith('.schema')) {
        key = key.slice(0, -7);
      }
      schemas[key] = json;
    } catch (_e) {
      console.error(`Failed to read schema ${f}: ${_e.message}`);
    }
  }
  return schemas;
}

// Determine schema key for a JSON file
function getSchemaKey(json, file) {
  if (Array.isArray(json)) {
    return 'records';
  }
  if (json.$schema) {
    const base = path.basename(json.$schema, '.json');
    return base.endsWith('.schema') ? base.slice(0, -7) : base;
  }
  // Fallback: path heuristics
  const rel = path.relative(projectFolder, file).replace(/\\/g, '/');
  const m = rel.match(/^views\/(.+?)\/(listview|form|records)\.json$/);
  return m ? m[2] : path.basename(file, '.json');
}

// Print script usage info
function printUsage() {
  console.log('');
  console.log(`${colors.bold('Usage:')} ${colors.cyan('node scripts/validate-jsons.js')} ${colors.yellow('--schemas <folder> --project <folder> [--log <file>]')} ${colors.yellow('[--no-color]')}`);
  console.log('');
  console.log('Options:');
  console.log(`  ${colors.yellow('--schemas <folder>')}  Folder with JSON schemas (required)`);
  console.log(`  ${colors.yellow('--project <folder>')}  Folder with JSON files to validate (required)`);
  console.log(`  ${colors.yellow('--log <file>')}        Save report to <file>`);
  console.log(`  ${colors.yellow('--no-color')}          Disable ANSI colors in output`);
  console.log(`  ${colors.yellow('--help, -h')}          Show this help`);
  console.log('');
}

// #endregion

// #region ------------------------------------------------------------------------------------ Main

// Parse args
const argv = process.argv.slice(2);
let schemasFolder = null;
let projectFolder = null;
let logFile = null;
let useColor = true;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--schemas' && argv[i + 1]) {
    schemasFolder = path.resolve(argv[++i]);
  } else if (argv[i] === '--project' && argv[i + 1]) {
    projectFolder = path.resolve(argv[++i]);
  } else if (argv[i] === '--log' && argv[i + 1]) {
    logFile = path.resolve(argv[++i]);
  } else if (argv[i] === '--no-color') {
    useColor = false;
  }
}

// Color helpers (ANSI)
const colors = {
  red: (s) => (useColor ? `\u001b[31m${s}\u001b[39m` : s),
  yellow: (s) => (useColor ? `\u001b[33m${s}\u001b[39m` : s),
  cyan: (s) => (useColor ? `\u001b[36m${s}\u001b[39m` : s),
  green: (s) => (useColor ? `\u001b[32m${s}\u001b[39m` : s),
  magenta: (s) => (useColor ? `\u001b[35m${s}\u001b[39m` : s),
  lightMagenta: (s) => (useColor ? `\u001b[95m${s}\u001b[39m` : s),
  lightRed: (s) => (useColor ? `\u001b[91m${s}\u001b[39m` : s),
  orange: (s) => (useColor ? `\u001b[38;5;214m${s}\u001b[39m` : s),
  bold: (s) => (useColor ? `\u001b[1m${s}\u001b[22m` : s),
};

if (argv.includes('--help') || argv.includes('-h')) {
  printUsage();
  process.exit(0);
}

if (!schemasFolder || !projectFolder) {
  printUsage();
  process.exit(1);
}

// Initialize JSON Schema validator and load schemas
const output = [];
const ajv = new Ajv({
  allErrors: true,
  strict: false,
  logger: {
    log: (msg) => output.push(msg),
    warn: (msg) => output.push(`Warning: ${msg}`),
    error: (msg) => output.push(`Error: ${msg}`)
  }
});
const schemas = loadSchemas(schemasFolder);
for (const [k, s] of Object.entries(schemas)) {
  try {
    ajv.addSchema(s, s.$id || `schema:${k}`);
  } catch (_e) {
    output.push(`Failed to register schema ${k}: ${_e.message}`);
  }
}

const files = collectJsonFiles(projectFolder);
if (files.length === 0) {
  console.log('No JSON files found under', projectFolder);
  process.exit(0);
}

// Loop through files and validate
let failures = 0;
for (const f of files) {
  let json;
  try {
    json = JSON.parse(stripJsonc(fs.readFileSync(f, 'utf8')));
  } catch (_e) {
    output.push(`Invalid JSON: ${f}: ${_e.message}`);
    failures++;
    continue;
  }

  // Determine schema key and validate
  const schemaKey = getSchemaKey(json, f);
  const schema = schemas[schemaKey] || null;

  if (!schema) {
    output.push(`No schema for ${path.basename(f)} (tried '${schemaKey}'), skipping.`);
    continue;
  }

  let validate;
  try {
    validate = ajv.getSchema(schema.$id || `schema:${schemaKey}`) || ajv.compile(schema);
  } catch (e) {
    failures++;
    output.push(`Failed to compile schema '${schemaKey}' for ${path.basename(f)}: ${e && e.message ? e.message : String(e)}`);
    continue;
  }

  if (!validate(json)) {
    failures++;
    output.push(colors.red(`Errors in ${path.basename(f)} (schema '${schemaKey}'):`));
    for (const err of validate.errors || []) {
      output.push(colors.yellow(`  ${err.instancePath || '/'} ${err.message}`));
    }
  }
}

// Print validation results
if (output.length) {
  console.log(output.join(EOL));
}
if (logFile) {
  const logContent = output.length ? output.join(EOL) : 'No schema validation problems found.';
  fs.writeFileSync(logFile, logContent + EOL, 'utf8');
  console.log(colors.cyan(`Log written to ${path.basename(logFile)}.`));
}
console.log(`Validation complete: ${colors.cyan(files.length)} files, ` +
  (failures > 0 ? colors.red(failures) : colors.green(failures)) + ` failed.` + EOL);

// Exit with code 3 if there were validation failures
process.exit(failures > 0 ? 3 : 0);

// #endregion
