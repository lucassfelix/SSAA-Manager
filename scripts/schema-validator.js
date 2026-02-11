#!/usr/bin/env node

// Simple CLI to check that all object schemas have a description, and that additionalProperties
// is not allowed unless explicitly set to false/true or an object schema.

// #region --------------------------------------------------------------------------------- Imports

import fs from 'fs';
import { EOL } from 'os';
import path from 'path';

// #endregion

// #region --------------------------------------------------------------------------------- Helpers

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getLineNumberFromIndex(text, idx) {
  const slice = text.slice(0, idx);
  return slice.split('\n').length;
}

function findKeyLine(text, key) {
  try {
    const re = new RegExp(`"${escapeRegExp(key)}"\\s*:\\s*\\{`, 'g');
    const m = re.exec(text);
    if (m && typeof m.index === 'number') {
      return getLineNumberFromIndex(text, m.index);
    }
  } catch (_e) {
    // ignore regex errors
  }
  // fallback: find first occurrence of the key
  const idx = text.indexOf(`"${key}"`);
  if (idx !== -1) {
    return getLineNumberFromIndex(text, idx);
  }
  return 1;
}

function findKeyLineFromPath(text, pathArr) {
  // Try to locate the property by following the key sequence in the file text.
  // This walks the file searching for each key in order, starting from the previous match.
  let idx = 0;
  for (const rawKey of pathArr) {
    // skip numeric array indexes
    if (/^\d+$/.test(rawKey)) {
      continue;
    }
    const key = String(rawKey);
    const re = new RegExp(`"${escapeRegExp(key)}"\\s*:`, 'g');
    re.lastIndex = idx;
    const m = re.exec(text);
    if (m && typeof m.index === 'number') {
      idx = m.index + (m[0] ? m[0].length : 0);
      continue;
    }
    // If any step fails, fallback to the simple key-based search
    return findKeyLine(text, key);
  }
  // If we found a match for the full path, return its line number
  return getLineNumberFromIndex(text, idx || 0);
}

function stripJsonc(text) {
  // Remove /* ... */ block comments
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove // line comments
  text = text.replace(/(^|[^:]|^)\/\/.*$/gm, '');
  // Remove trailing commas before } or ]
  text = text.replace(/,\s*(?=[}\]])/g, '');
  return text;
}

function isObjectSchemaCandidate(obj, pathArr) {
  // Treat as schema object if any of these apply:
  // - has explicit "type": "object"
  // - declares a "properties" object
  // - is an entry under a "definitions" map (path contains 'definitions')
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  // Consider explicit object or array types as schema candidates
  if (obj.type === 'object' || obj.type === 'array') {
    return true;
  }
  // Also consider nodes that declare 'properties' or 'items' as schema candidates
  if (Object.prototype.hasOwnProperty.call(obj, 'properties') || Object.prototype.hasOwnProperty.call(obj, 'items')) {
    return true;
  }
  if (pathArr.includes('definitions')) {
    return true;
  }
  return false;
}

function walk(obj, pathArr, fileText, filePath, out) {
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => walk(v, [...pathArr, String(i)], fileText, filePath, out));
    return;
  }
  if (obj && typeof obj === 'object') {
    // Handle conditional subschemas explicitly: recurse into their children but
    // do not treat the conditional node itself as a schema candidate.
    if (pathArr.includes('if') || pathArr.includes('then')) {
      for (const k of Object.keys(obj)) {
        walk(obj[k], [...pathArr, k], fileText, filePath, out);
      }
    } else {
      // If this node is a candidate schema object, check for description
      if (isObjectSchemaCandidate(obj, pathArr)) {
        // If the object declares "properties" or explicitly has type: 'object',
        // ensure additionalProperties is explicitly false (avoid open object schemas).
        if (obj.type === 'object' || Object.prototype.hasOwnProperty.call(obj, 'properties')) {
          // additionalProperties must be explicitly present and be either false or
          // an object schema; previously we also flagged `true`, but caller wants
          // `true` to be allowed, so only flag when the property is missing or
          // when it's an invalid non-boolean/non-object value.
          const hasAp = Object.prototype.hasOwnProperty.call(obj, 'additionalProperties');
          const ap = obj.additionalProperties;
          const apIsObject = ap && typeof ap === 'object';
          const apIsValid = ap === false || ap === true || apIsObject;
          if (!hasAp || !apIsValid) {
            const objName = pathArr.length ? pathArr[pathArr.length - 1] : '(root)';
            // Skip $ref-only wrappers
            if (!Object.prototype.hasOwnProperty.call(obj, '$ref') && !pathArr.includes('oneOf')) {
              const line = findKeyLineFromPath(fileText, pathArr) || findKeyLine(fileText, String(objName));
              out.push({ file: filePath, name: objName, line, path: pathArr.join('.'), issue: 'additionalProperties' });
            }
          }
        }

        if (!Object.prototype.hasOwnProperty.call(obj, 'description')) {
          // object name: use last key in path if available
          const objName = pathArr.length ? pathArr[pathArr.length - 1] : '(root)';

          // Skip only the ROOT entries directly under `definitions` (e.g.
          // `definitions.control`) — those top-level definition objects
          // may be short descriptors, but their children should still be
          // validated for descriptions.
          const defIdx = pathArr.indexOf('definitions');
          if (defIdx !== -1 && defIdx === pathArr.length - 2) {
            // this node is the root definition entry (skip)
          } else if (objName === 'definitions') {
            // skip
          } else if (pathArr.includes('oneOf')) {
            // skip
          } else {
            if (Object.prototype.hasOwnProperty.call(obj, '$ref')) {
              // skip
            } else if (objName === 'properties') {
              // skip
            } else {
              const line = findKeyLineFromPath(fileText, pathArr) || findKeyLine(fileText, String(objName));
              out.push({ file: filePath, name: objName, line, path: pathArr.join('.'), issue: 'description' });
            }
          }
        }
      }

      // Recurse into children
      for (const k of Object.keys(obj)) {
        walk(obj[k], [...pathArr, k], fileText, filePath, out);
      }
    }
  }
}

function collectJsonFiles(dir) {
  const res = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      res.push(...collectJsonFiles(full));
    } else if (e.isFile() && e.name.endsWith('.json')) {
      res.push(full);
    }
  }
  return res;
}

function printUsage(colors) {
  console.log('');
  console.log(`${colors.bold('Usage:')} ${colors.cyan('node scripts/schema-validator.js')} ${colors.yellow('[--out <file>] [--no-color]')} ${colors.cyan('<schemas-folder>')}`);
  console.log('');
  console.log('Options:');
  console.log(`  ${colors.yellow('--out <file>')}    Save plain TXT report to <file>`);
  console.log(`  ${colors.yellow('--no-color')}      Disable ANSI colors in output`);
  console.log(`  ${colors.yellow('--help, -h')}      Show this help`);
  console.log('');
}

function printError(useColor, color, label, ...details) {
  if (useColor) {
    console.error(color(label), ...details);
  } else {
    console.error(label, ...details);
  }
};

function resolveOutFilePath(fileArg) {
  if (!fileArg) {
    return null;
  }
  if (path.isAbsolute(fileArg)) {
    return fileArg;
  }
  // If caller already provided a path (e.g. ./out/report.txt or logs/report.txt), honor it.
  if (/[\\/]/.test(fileArg)) {
    return path.resolve(fileArg);
  }
  // Bare filename -> default logs folder
  return path.resolve('scripts', 'logs', fileArg);
}

// #endregion

// #region ------------------------------------------------------------------------------------ Main

async function main() {

  // Basic arg parsing: allow --out <file> and --no-color
  const argv = process.argv.slice(2);
  let folder = null;
  let outFile = null;
  let useColor = true;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out' && argv[i + 1]) {
      outFile = resolveOutFilePath(argv[i + 1]);
      i++;
      continue;
    }
    if (a === '--no-color') {
      useColor = false;
      continue;
    }
    // first non-flag arg is the folder
    if (!folder) {
      folder = a;
    }
  }
  const folderArg = folder;
  folder = folderArg;

  // Color helpers (ANSI). Keep plain text if useColor === false
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
    printUsage(colors);
    process.exit(0);
  }
  if (!folder) {
    printUsage(colors);
    process.exit(1);
  }
  const arg = folder;

  // Support: directory, single file, or simple glob (single-level '*' or '?')
  const abs = path.resolve(arg);
  let files = [];
  if (fs.existsSync(abs)) {
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      console.log(`Checking JSON schema files in ${abs}...` + EOL);
      files = collectJsonFiles(abs);
    } else if (stat.isFile()) {
      console.log(`Checking JSON schema file ${abs}...` + EOL);
      files = [abs];
    }
  } else if (/[*?]/.test(arg)) {
    // simple glob: only expand one directory level
    const dir = path.resolve(path.dirname(arg));
    const pattern = path.basename(arg);
    const reStr = '^' + pattern.split('*').map(s => s.split('?').map(escapeRegExp).join('.')).join('.*') + '$';
    const re = new RegExp(reStr);
    if (!fs.existsSync(dir)) {
      printError(useColor, colors.lightMagenta, 'Folder not found for glob:', dir);
      process.exit(2);
    }
    console.log(`Checking JSON schema files matching ${arg}...` + EOL);
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith('.json') && re.test(e.name)) {
        files.push(path.join(dir, e.name));
      }
    }
  } else {
    printError(useColor, colors.lightMagenta, 'Folder not found:', abs);
    process.exit(2);
  }

  if (files.length === 0) {
    console.log('No JSON schema files found to check.');
    process.exit(0);
  }
  let missing = [];
  for (const f of files) {
    let text;
    try {
      text = fs.readFileSync(f, 'utf8');
    } catch (e) {
      printError(useColor, colors.lightMagenta, 'Failed to read:', f, e.message);
      continue;
    }
    let json;
    try {
      const cleaned = stripJsonc(text);
      json = JSON.parse(cleaned);
    } catch (e) {
      printError(useColor, colors.lightMagenta, `Skipping ${f}:`, `invalid JSON (${e.message})`);
      continue;
    }
    walk(json, [], text, f, missing);
  }

  // If no missing descriptions found, exit successfully
  if (missing.length === 0) {
    console.log(colors.cyan('All schemas have descriptions and no illegal additionalProperties.') + EOL);
    if (outFile) {
      try {
        const summary = `No schema issues found.\n\nTotal ${files.length} files checked, 0 files with issues\n`;
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, summary, 'utf8');
        console.log(`Saved report to ${outFile}.\n`);
      } catch (e) {
        printError(useColor, colors.lightMagenta, 'Failed to write report file:', e.message);
      }
    }
    process.exit(0);
  }

  // Group by file and sort by line
  const byFile = new Map();
  for (const m of missing) {
    const rel = path.relative(process.cwd(), m.file);
    if (!byFile.has(rel)) {
      byFile.set(rel, []);
    }
    byFile.get(rel).push(m);
  }

  // Prepare output lines
  const linesOut = [];
  for (const [rel, arr] of byFile) {
    arr.sort((a, b) => (a.line || 0) - (b.line || 0));
    linesOut.push(colors.bold(`${rel} ${colors.lightRed(`(${arr.length} issues)`)} `));
    for (const m of arr) {
      const lineStr = `${m.line || 1}`;
      let msg;
      if (m.issue === 'additionalProperties') {
        msg = `  ${colors.cyan(lineStr)}: ${colors.bold(colors.yellow('allowing illegal properties'))}: ${m.path}`;
      } else {
        msg = `  ${colors.cyan(lineStr)}: ${colors.bold(colors.yellow('missing description'))}: ${m.path}`;
      }
      linesOut.push(msg);
    }
    linesOut.push('');
  }

  // Print to console
  console.log(colors.orange('There are warnings:\n'));
  for (const line of linesOut) {
    console.warn(line);
  }

  // Optionally save plain text log file
  if (outFile) {
    try {
      const esc = String.fromCharCode(27); // ESC
      const escRe = new RegExp(esc + '\\[[0-9;]*m', 'g');
      const plain = linesOut.map((l) => l.replace(escRe, '')).join('\n');
      const totalFiles = files.length;
      const filesWithMissing = byFile.size;
      const validFiles = totalFiles - filesWithMissing;
      const summary = `Total ${totalFiles} files checked, ${validFiles} valid files, ${filesWithMissing} with issues`;
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, `Schema issues found:\n\n${plain}\n${summary}\n`, 'utf8');
      console.log(`Saved report to ${outFile}.\n`);
    } catch (e) {
      printError(useColor, colors.lightMagenta, 'Failed to write report file:', e.message);
    }
  }

  // Print summary to console and exit
  const totalFiles = files.length;
  const filesWithMissing = byFile.size;
  const validFiles = totalFiles - filesWithMissing;
  console.log(colors.orange(`Total ${totalFiles} files checked, ${validFiles} valid files, ${filesWithMissing} with issues\n`));
  process.exit(0);

}

main().catch((e) => {
  // Use raw ESC here because colors helper is inside main
  const esc = String.fromCharCode(27);
  console.error(esc + '[31mUnexpected error:' + esc + '[39m', e);
  process.exit(2);
});

// #endregion
