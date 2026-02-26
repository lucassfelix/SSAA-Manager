import "dotenv/config";
import cors from "cors";
import express from "express";
import mysql from "mysql2/promise";

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_SSL,
  PORT = 3100,
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT ? Number(DB_PORT) : undefined,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  waitForConnections: true,
  ssl: DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const isSafeName = (value) => /^[a-zA-Z0-9_]+$/.test(value);

const toDbFields = (value) => {
  if (!value || typeof value !== "object") {
    return {};
  }

  const fields = {};
  for (const [key, val] of Object.entries(value)) {
    if (!isSafeName(key) || key.startsWith("__")) {
      continue;
    }
    if (val === undefined) {
      continue;
    }
    fields[key] = val;
  }
  return fields;
};

const tableColumnsCache = new Map();

const getTableColumns = async (table) => {
  if (tableColumnsCache.has(table)) {
    return tableColumnsCache.get(table);
  }

  const [rows] = await pool.query(`SHOW COLUMNS FROM \`${table}\``);
  const cols = new Map((rows || []).map(r => [r.Field, String(r.Type || "").toLowerCase()]));
  tableColumnsCache.set(table, cols);
  return cols;
};

const filterToColumns = async (table, fields) => {
  const cols = await getTableColumns(table);
  const filtered = {};
  for (const [key, val] of Object.entries(fields)) {
    if (cols.has(key)) {
      filtered[key] = val;
    }
  }
  return filtered;
};

const normalizeJsonValue = (val) => {
  if (Array.isArray(val)) {
    return val.map(v => (typeof v === "string" && /^-?\d+$/.test(v) ? Number(v) : v));
  }
  if (val && typeof val === "object") {
    return val;
  }
  if (Buffer.isBuffer(val)) {
    return normalizeJsonValue(val.toString("utf8"));
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed && trimmed.includes(",") && !trimmed.startsWith("[") && !trimmed.startsWith("{")) {
      const parts = trimmed.split(",").map(p => p.trim()).filter(Boolean);
      if (parts.length > 1 && parts.every(p => /^-?\d+$/.test(p))) {
        return parts.map(Number);
      }
    }
    try {
      return JSON.parse(trimmed);
    } catch {
      return val;
    }
  }
  return val;
};

const coerceToColumnTypes = async (table, fields) => {
  const cols = await getTableColumns(table);
  const out = {};

  for (const [key, val] of Object.entries(fields)) {
    const type = cols.get(key);
    if (!type) {
      continue;
    }

    if (type.startsWith("json")) {
      const norm = normalizeJsonValue(val);
      out[key] = norm == null ? null : JSON.stringify(norm);
      continue;
    }

    const isJsonLikeCol = type.includes("text") || type.includes("blob");
    if (isJsonLikeCol) {
      const looksJsonLike =
        Array.isArray(val) ||
        (val && typeof val === "object") ||
        (typeof val === "string" && (val.trim().startsWith('[') || val.trim().startsWith('{') || val.includes(',')));

      if (looksJsonLike) {
        const norm = normalizeJsonValue(val);
        if (Array.isArray(norm) || (norm && typeof norm === "object")) {
          out[key] = JSON.stringify(norm);
          continue;
        }
      }
    }

    if (val === null || typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
      out[key] = val;
    }
  }

  return out;
};

const parseJsonColumns = async (table, rows) => {
  return (rows || []).map((row) => {
    if (!row || typeof row !== "object") {
      return row;
    }

    for (const [key, v] of Object.entries(row)) {
      const raw = Buffer.isBuffer(v) ? v.toString("utf8") : v;
      if (typeof raw !== "string") {
        continue;
      }
      const s = raw.trim();
      if (!s || (!s.startsWith('[') && !s.startsWith('{'))) {
        continue;
      }
      try {
        row[key] = JSON.parse(s);
      } catch {
        /* ignore */
      }
    }
    return row;
  });
};

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/data", async (req, res) => {
  const raw = (req.query.tables || "").toString();
  const tables = raw.split(",").map(t => t.trim()).filter(Boolean);

  if (tables.length === 0) {
    return res.status(400).json({ error: "tables_required" });
  }

  const invalid = tables.find(t => !isSafeName(t));
  if (invalid) {
    return res.status(400).json({ error: "invalid_table", table: invalid });
  }

  try {
    const result = {};
    for (const table of tables) {
      const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
      result[table] = await parseJsonColumns(table, rows);
    }
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "db_error" });
  }
});

app.get("/data/:table", async (req, res) => {
  const { table } = req.params;

  if (!isSafeName(table)) {
    return res.status(400).json({ error: "invalid_table" });
  }

  try {
    const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
    return res.json(await parseJsonColumns(table, rows));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "db_error" });
  }
});

app.post("/record/:table", async (req, res) => {
  const { table } = req.params;
  if (!isSafeName(table)) {
    return res.status(400).json({ error: "invalid_table" });
  }

  const idAccessor = (req.query.idAccessor || "id").toString();
  if (!isSafeName(idAccessor)) {
    return res.status(400).json({ error: "invalid_idAccessor" });
  }

  let fields = toDbFields(req.body);
  delete fields[idAccessor];
  fields = await filterToColumns(table, fields);
  fields = await coerceToColumnTypes(table, fields);
  const cols = Object.keys(fields);
  if (cols.length === 0) {
    return res.status(400).json({ error: "empty_payload" });
  }

  try {
    const placeholders = cols.map(() => "?").join(",");
    const colSql = cols.map(c => `\`${c}\``).join(",");
    const values = cols.map(c => fields[c]);
    const [result] = await pool.query(
      `INSERT INTO \`${table}\` (${colSql}) VALUES (${placeholders})`,
      values
    );
    return res.json({ ok: true, insertId: result?.insertId });
  } catch (error) {
    console.error(error);
    const e = error || {};
    return res.status(500).json({
      error: "db_error",
      code: e.code,
      sqlState: e.sqlState,
      sqlMessage: e.sqlMessage,
      message: e.sqlMessage || "Database error",
    });
  }
});

app.put("/record/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  const idAccessor = (req.query.idAccessor || "id").toString();

  if (!isSafeName(table) || !isSafeName(idAccessor)) {
    return res.status(400).json({ error: "invalid_table" });
  }

  let fields = toDbFields(req.body);
  delete fields[idAccessor];
  fields = await filterToColumns(table, fields);
  fields = await coerceToColumnTypes(table, fields);
  const cols = Object.keys(fields);
  if (cols.length === 0) {
    return res.status(400).json({ error: "empty_payload" });
  }

  try {
    const setSql = cols.map(c => `\`${c}\` = ?`).join(", ");
    const values = cols.map(c => fields[c]);
    values.push(id);
    const [result] = await pool.query(
      `UPDATE \`${table}\` SET ${setSql} WHERE \`${idAccessor}\` = ?`,
      values
    );
    return res.json({ ok: true, affectedRows: result?.affectedRows });
  } catch (error) {
    console.error(error);
    const e = error || {};
    return res.status(500).json({
      error: "db_error",
      code: e.code,
      sqlState: e.sqlState,
      sqlMessage: e.sqlMessage,
      message: e.sqlMessage || "Database error",
    });
  }
});

app.delete("/record/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  const idAccessor = (req.query.idAccessor || "id").toString();

  if (!isSafeName(table) || !isSafeName(idAccessor)) {
    return res.status(400).json({ error: "invalid_table" });
  }

  try {
    const [result] = await pool.query(
      `DELETE FROM \`${table}\` WHERE \`${idAccessor}\` = ?`,
      [id]
    );
    return res.json({ ok: true, affectedRows: result?.affectedRows });
  } catch (error) {
    console.error(error);
    const e = error || {};
    return res.status(500).json({
      error: "db_error",
      code: e.code,
      sqlState: e.sqlState,
      sqlMessage: e.sqlMessage,
      message: e.sqlMessage || "Database error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`SSAA API listening on ${PORT}`);
});
