
// #region --------------------------------------------------------------------------------- Imports

import fs from 'fs';
import path from 'path';

// #endregion

// #region --------------------------------------------------------------------------------- Exports

/** Strip JSONC comments (/* ... * / and // ...) from text. */
export function stripJsonc(text) {
  return String(text)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/,\s*(?=[}\]])/g, '');
}

/** Strip ANSI escape codes from text. */
export function stripAnsi(text) {
  return String(text).replace(/\u001b\[[0-9;]*m/g, '');
}

/** Escape a string for safe use inside a RegExp. */
export function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Convert a string index into a 1-based line number. */
export function getLineNumberFromIndex(text, idx) {
  return String(text).slice(0, Math.max(0, idx)).split('\n').length;
}

/** Find the 1-based line number where a key first appears in JSON text. */
export function findKeyLine(text, key) {
  const idx = String(text).indexOf(`"${key}"`);
  return idx === -1 ? 1 : getLineNumberFromIndex(text, idx);
}

/** Find the 1-based line number for a nested key path in JSON text (best-effort). */
export function findKeyLineFromPath(text, pathArr) {
  let idx = 0;
  for (const rawKey of pathArr) {
    if (/^\d+$/.test(String(rawKey))) {
      continue;
    }
    const key = String(rawKey);
    const re = new RegExp(`"${escapeRegExp(key)}"\\s*:`, 'g');
    re.lastIndex = idx;
    const m = re.exec(String(text));
    if (!m || typeof m.index !== 'number') {
      return findKeyLine(text, key);
    }
    idx = m.index + m[0].length;
  }
  return getLineNumberFromIndex(text, idx || 0);
}

/** Collect JSON files recursively. */
export function collectJsonFiles(dir, opts = {}) {
  const { skipDoubleUnderscore = true } = opts;

  const res = [];
  if (!fs.existsSync(dir)) {
    return res;
  }
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDoubleUnderscore && e.name.startsWith('__')) {
      continue;
    }
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      res.push(...collectJsonFiles(full, opts));
    } else if (e.isFile() && e.name.endsWith('.json')) {
      res.push(full);
    }
  }
  return res;
}

/** Ensure a directory exists (mkdir -p). */
export function ensureDirExists(dirPath) {
  if (!dirPath) {
    return;
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/** Read a JSON/JSONC file and return both raw text and parsed JSON. */
export function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return { raw, json: JSON.parse(stripJsonc(raw)) };
}

/** Find the 1-based line number of a quoted raw string value in JSON text. */
export function findRawValueLine(raw, value) {
  const idx = String(raw).indexOf(`"${value}"`);
  return idx === -1 ? 1 : getLineNumberFromIndex(raw, idx);
}

/** Resolve log file path. */
export function resolveLogFilePath(fileArg, defaultFolder = ['scripts', 'logs']) {
  if (!fileArg) {
    return null;
  }
  if (path.isAbsolute(fileArg)) {
    return fileArg;
  }
  // If caller already provided a path (e.g. ./out/log.txt or logs/out.txt), honor it.
  if (/[\\/]/.test(fileArg)) {
    return path.resolve(fileArg);
  }
  // Bare filename -> default logs folder
  return path.resolve(...defaultFolder, fileArg);
}

/** Create a set of color functions for console output. */
export function createColors(useColor) {
  return {
    red: (s) => (useColor ? `\u001b[31m${s}\u001b[39m` : s),
    yellow: (s) => (useColor ? `\u001b[33m${s}\u001b[39m` : s),
    cyan: (s) => (useColor ? `\u001b[36m${s}\u001b[39m` : s),
    green: (s) => (useColor ? `\u001b[32m${s}\u001b[39m` : s),
    magenta: (s) => (useColor ? `\u001b[35m${s}\u001b[39m` : s),
    lightMagenta: (s) => (useColor ? `\u001b[95m${s}\u001b[39m` : s),
    lightRed: (s) => (useColor ? `\u001b[91m${s}\u001b[39m` : s),
    orange: (s) => (useColor ? `\u001b[38;5;214m${s}\u001b[39m` : s),
    white: (s) => (useColor ? `\u001b[37m${s}\u001b[39m` : s),
    darkgray: (s) => (useColor ? `\u001b[90m${s}\u001b[39m` : s),
    bold: (s) => (useColor ? `\u001b[1m${s}\u001b[22m` : s),
  };
}

// #endregion
