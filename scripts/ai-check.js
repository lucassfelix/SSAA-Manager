#!/usr/bin/env node
/* eslint-disable @stylistic/curly-newline */

// Run the standard NeoFront verification loop (schemas + project JSON + metadata consistency).

// #region --------------------------------------------------------------------------------- Imports

import path from 'path';
import { spawnSync } from 'child_process';

import { ensureDirExists } from './lib/master.lib.js';

// #endregion

//#region ---------------------------------------------------------------------------------- Helpers

function printUsage() {
  console.log('');
  console.log('Usage: node scripts/ai-check.js [--project <folder>] [--schemas <folder>] [--logDir <folder>] [--no-color]');
  console.log('');
  console.log('Options:');
  console.log('  --project <folder>   Project folder (default: ./packages/app-ssaa/project)');
  console.log('  --schemas <folder>   Schemas folder (default: ./schemas)');
  console.log('  --logDir <folder>    Write logs into this folder (default: ./scripts/logs)');
  console.log('  --no-color           Disable ANSI colors in child scripts');
  console.log('  --help, -h           Show this help');
  console.log('');
}

function runNodeScript(scriptPath, args) {
  const res = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env,
  });
  if (res.error) {
    return { code: 2, error: res.error };
  }
  const code = typeof res.status === 'number' ? res.status : 2;
  return { code };
}

// #endregion

// #region ------------------------------------------------------------------------------------ Main

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  printUsage();
  process.exit(0);
}

let projectFolder = path.resolve('./packages/app-ssaa/project');
let schemasFolder = path.resolve('./schemas');
let logDir = path.resolve('./scripts/logs');
let noColor = false;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--project' && argv[i + 1]) {
    projectFolder = path.resolve(argv[++i]);
  } else if (a === '--schemas' && argv[i + 1]) {
    schemasFolder = path.resolve(argv[++i]);
  } else if (a === '--logDir' && argv[i + 1]) {
    logDir = path.resolve(argv[++i]);
  } else if (a === '--no-color') {
    noColor = true;
  }
}

ensureDirExists(logDir);

const root = process.cwd();
const schemaValidator = path.join(root, 'scripts', 'schema-validator.js');
const jsonValidator = path.join(root, 'scripts', 'json-validator.js');
const metadataAnalyzer = path.join(root, 'scripts', 'metadata-analyzer.js');

const schemaOut = path.join(logDir, 'schema-validator.log');
const jsonOut = path.join(logDir, 'json-validator.log');
const metadataOut = path.join(logDir, 'metadata-analyzer.log');

const commonFlags = noColor ? ['--no-color'] : [];

let finalExit = 0;

console.log('');
console.log('== NeoFront AI Check ==');
console.log(`schemas: ${path.relative(root, schemasFolder).replace(/\\/g, '/')}`);
console.log(`project: ${path.relative(root, projectFolder).replace(/\\/g, '/')}`);
console.log('');

// 1) Schema hygiene checks (descriptions + additionalProperties)
{
  const res = runNodeScript(schemaValidator, ['--out', schemaOut, ...commonFlags, schemasFolder]);
  if (res.code !== 0) {
    finalExit = 2;
  }
}

// 2) Validate project JSON against schemas
{
  const res = runNodeScript(jsonValidator, ['--schemas', schemasFolder, '--project', projectFolder, '--log', jsonOut, ...commonFlags]);
  if (res.code === 3) {
    finalExit = 3;
  } else if (res.code !== 0) {
    finalExit = Math.max(finalExit, 2);
  }
}

// 3) Cross-file metadata consistency checks
{
  const res = runNodeScript(metadataAnalyzer, ['--project', projectFolder, '--log', metadataOut, ...commonFlags]);
  if (res.code === 3) {
    finalExit = 3;
  } else if (res.code !== 0) {
    finalExit = Math.max(finalExit, 2);
  }
}

console.log(`AI check complete. Logs: ${path.basename(schemaOut)}, ${path.basename(jsonOut)}, ${path.basename(metadataOut)}`);
process.exit(finalExit);

// #endregion
