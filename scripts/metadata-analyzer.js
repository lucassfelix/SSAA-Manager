#!/usr/bin/env node

// Analyze NeoFront project metadata for consistency issues (beyond schema validation).

// #region --------------------------------------------------------------------------------- Imports

import fs from 'fs';
import { EOL } from 'os';
import path from 'path';

// #endregion

// #region --------------------------------------------------------------------------------- Helpers

function stripJsonc(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/,\s*(?=[}\]])/g, '');
}

function stripAnsi(text) {
  return String(text).replace(/\u001b\[[0-9;]*m/g, '');
}

function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getLineNumberFromIndex(text, idx) {
  return text.slice(0, Math.max(0, idx)).split('\n').length;
}

function findKeyLine(text, key) {
  const idx = text.indexOf(`"${key}"`);
  return idx === -1 ? 1 : getLineNumberFromIndex(text, idx);
}

function findKeyLineFromPath(text, pathArr) {
  let idx = 0;
  for (const rawKey of pathArr) {
    if (/^\d+$/.test(String(rawKey))) {
      continue;
    }
    const key = String(rawKey);
    const re = new RegExp(`"${escapeRegExp(key)}"\\s*:`, 'g');
    re.lastIndex = idx;
    const m = re.exec(text);
    if (!m || typeof m.index !== 'number') {
      return findKeyLine(text, key);
    }
    idx = m.index + m[0].length;
  }
  return getLineNumberFromIndex(text, idx || 0);
}

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

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return { raw, json: JSON.parse(stripJsonc(raw)) };
}

function printUsage(colors) {
  console.log('');
  console.log(`${colors.bold('Usage:')} ${colors.cyan('node scripts/metadata-analyzer.js')} ${colors.yellow('--project <folder> [--log <file>]')} ${colors.yellow('[--no-color]')}`);
  console.log('');
  console.log('Options:');
  console.log(`  ${colors.yellow('--project <folder>')}  Project folder (required, e.g. ./packages/app-ssaa/project)`);
  console.log(`  ${colors.yellow('--log <file>')}        Save report to <file>`);
  console.log(`  ${colors.yellow('--no-color')}          Disable ANSI colors in output`);
  console.log(`  ${colors.yellow('--help, -h')}          Show this help`);
  console.log('');
}

function walk(node, pathArr, visit) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, [...pathArr, String(i)], visit));
    return;
  }
  if (!node || typeof node !== 'object') {
    return;
  }
  visit(node, pathArr);
  for (const k of Object.keys(node)) {
    walk(node[k], [...pathArr, k], visit);
  }
}

function findListViewKeyLine(raw, lvName, key) {
  const nameRe = new RegExp(`"name"\\s*:\\s*"${escapeRegExp(lvName)}"`);
  const keyRe = new RegExp(`"${escapeRegExp(key)}"\\s*:`);

  let idx = 0;
  while (idx >= 0) {
    idx = raw.indexOf('"listView"', idx);
    if (idx === -1) {
      break;
    }

    const start = raw.indexOf('{', idx);
    if (start === -1) {
      idx += 9;
      continue;
    }

    let depth = 0;
    let end = -1;
    for (let i = start; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }

    const segment = raw.slice(idx, end === -1 ? raw.length : end);
    if (nameRe.test(segment)) {
      const keyIdx = segment.search(keyRe);
      return getLineNumberFromIndex(raw, idx + (keyIdx === -1 ? 0 : keyIdx));
    }

    idx = start + 1;
  }
  return 1;
}

// #endregion

// #region ------------------------------------------------------------------------------------ Main

const argv = process.argv.slice(2);
let projectFolder = null;
let logFile = null;
let useColor = true;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--project' && argv[i + 1]) {
    projectFolder = path.resolve(argv[++i]);
  } else if (argv[i] === '--log' && argv[i + 1]) {
    logFile = path.resolve(argv[++i]);
  } else if (argv[i] === '--no-color') {
    useColor = false;
  }
}

const colors = {
  red: (s) => (useColor ? `\u001b[31m${s}\u001b[39m` : s),
  yellow: (s) => (useColor ? `\u001b[33m${s}\u001b[39m` : s),
  cyan: (s) => (useColor ? `\u001b[36m${s}\u001b[39m` : s),
  green: (s) => (useColor ? `\u001b[32m${s}\u001b[39m` : s),
  magenta: (s) => (useColor ? `\u001b[35m${s}\u001b[39m` : s),
  lightMagenta: (s) => (useColor ? `\u001b[95m${s}\u001b[39m` : s),
  lightRed: (s) => (useColor ? `\u001b[91m${s}\u001b[39m` : s),
  orange: (s) => (useColor ? `\u001b[38;5;214m${s}\u001b[39m` : s),
  white: (s) => (useColor ? `\u001b[37m${s}\u001b[39m` : s),
  bold: (s) => (useColor ? `\u001b[1m${s}\u001b[22m` : s),
};

if (argv.includes('--help') || argv.includes('-h')) {
  printUsage(colors);
  process.exit(0);
}

if (!projectFolder) {
  printUsage(colors);
  process.exit(1);
}

const viewsFolder = path.join(projectFolder, 'views');
const output = [];
let warnings = 0;
let errors = 0;
const separator = '-'.repeat(100);

function rel(p) {
  return path.relative(projectFolder, p).replace(/\\/g, '/');
}

function relView(p) {
  const r = rel(p);
  return r.startsWith('views/') ? r.slice(6) : r;
}

function warn(file, line, msg) {
  warnings++;
  output.push(colors.yellow(`Warning: ${rel(file)}:${line} ${msg}`));
}

function err(file, line, msg) {
  errors++;
  output.push(colors.red(`Error: ${rel(file)}:${line} ${msg}`));
}

function reportAccessorMismatch(formFile, formLine, lvName, key, embeddedVal, targetFile, targetLine, targetVal) {
  errors++;
  output.push(colors.yellow(separator));
  output.push(colors.red('Error: different accessors'));
  output.push(colors.white(`    • ${relView(formFile)}:${formLine}, embedded listView '${lvName}': ${key}="${embeddedVal}"`));
  output.push(colors.white(`    • ${relView(targetFile)}:${targetLine}: ${key}="${targetVal}"`));
}

function analyzeEmbeddedListViews(formFile) {
  let raw;
  let form;
  try {
    ({ raw, json: form } = readJsonFile(formFile));
  } catch (e) {
    err(formFile, 1, `Invalid JSON: ${e && e.message ? e.message : String(e)}`);
    return;
  }

  walk(form, [], (obj, p) => {
    const lv = obj?.listView;
    if (!lv || typeof lv !== 'object') {
      return;
    }

    const lvName = lv.name;
    if (!lvName || typeof lvName !== 'string') {
      const line = findKeyLineFromPath(raw, [...p, 'listView']);
      warn(formFile, line, `Embedded listView missing valid "name".`);
      return;
    }

    const targetListViewFile = path.join(viewsFolder, lvName, 'listview.json');
    if (!fs.existsSync(targetListViewFile)) {
      const line = findKeyLineFromPath(raw, [...p, 'listView', 'name']);
      err(formFile, line, `Embedded listView references "${lvName}", but ${rel(targetListViewFile)} is missing.`);
      return;
    }

    let targetRaw;
    let target;
    try {
      ({ raw: targetRaw, json: target } = readJsonFile(targetListViewFile));
    } catch (e) {
      err(targetListViewFile, 1, `Invalid JSON: ${e && e.message ? e.message : String(e)}`);
      return;
    }

    const embeddedCfg = lv.config || {};
    const targetCfg = target?.config || {};

    const checks = [
      ['idAccessor', embeddedCfg.idAccessor, targetCfg.idAccessor],
      ['nameAccessor', embeddedCfg.nameAccessor, targetCfg.nameAccessor],
      ['rowClassAccessor', embeddedCfg.rowClassAccessor, targetCfg.rowClassAccessor],
    ];

    for (const [key, embeddedVal, targetVal] of checks) {
      if (embeddedVal == null || targetVal == null) {
        continue;
      }
      if (String(embeddedVal) !== String(targetVal)) {
        const line = findListViewKeyLine(raw, lvName, key);
        const targetLine = findKeyLineFromPath(targetRaw, ['config', key]);
        reportAccessorMismatch(formFile, line, lvName, key, embeddedVal, targetListViewFile, targetLine, targetVal);
      }
    }

    // Extra: if embedded config sets a key the target doesn't have, flag softly.
    if (embeddedCfg && typeof embeddedCfg === 'object') {
      for (const k of ['idAccessor', 'nameAccessor', 'rowClassAccessor']) {
        if (embeddedCfg[k] != null && targetCfg[k] == null) {
          const line = findListViewKeyLine(raw, lvName, k);
          warn(formFile, line, `Embedded listView("${lvName}") sets config.${k}, but target listview.json has no config.${k}.`);
        }
      }
    }

    // Basic sanity: target listview name should match folder name.
    if (target?.name && String(target.name) !== String(lvName)) {
      const line = findKeyLine(targetRaw, 'name');
      warn(targetListViewFile, line, `listview.json name="${target.name}" does not match folder "${lvName}".`);
    }
  });
}

const formFiles = collectJsonFiles(viewsFolder).filter(f => /(^|[\\/])form\.json$/i.test(f));
if (formFiles.length === 0) {
  console.log('No form.json files found under', viewsFolder);
  process.exit(0);
}

for (const f of formFiles) {
  analyzeEmbeddedListViews(f);
}

if (output.length) {
  console.log(output.join(EOL));
}

if (logFile) {
  const logContent = output.length ? stripAnsi(output.join(EOL)) : 'No metadata problems found.';
  fs.writeFileSync(logFile, logContent + EOL, 'utf8');
  console.log(colors.cyan(`Log written to ${path.basename(logFile)}.`));
}

console.log(`Metadata analysis complete: ${colors.cyan(formFiles.length)} files, ` +
  `${warnings > 0 ? colors.yellow(warnings) : colors.green(warnings)} warnings, ` +
  `${errors > 0 ? colors.red(errors) : colors.green(errors)} errors.` + EOL);

process.exit(errors > 0 ? 3 : 0);

// #endregion
