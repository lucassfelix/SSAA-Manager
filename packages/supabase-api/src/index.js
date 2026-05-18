import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import pg from "pg";

import {
  SESSION_COOKIE,
  signSessionToken,
  verifySessionToken,
  verifyStoredPassword,
  verifySupabaseAccessToken,
} from "./auth.js";
import {
  applyInsertTenantFields,
  buildOwnershipWhere,
  buildSelectForTable,
} from "./access.js";

const { Pool } = pg;

const {
  DATABASE_URL,
  PGHOST,
  PGPORT,
  PGUSER,
  PGPASSWORD,
  PGDATABASE,
  PGSCHEMA = "public",
  PORT = 3101,
} = process.env;

const listenHost = (process.env.HOST && String(process.env.HOST).trim()) || "0.0.0.0";
const AUTH_DISABLED = process.env.AUTH_DISABLED === "true";
const SESSION_SECRET = String(process.env.SESSION_SECRET || "");
const SUPABASE_URL = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const SUPABASE_JWT_SECRET = String(process.env.SUPABASE_JWT_SECRET || "");
const COOKIE_SAMESITE = String(process.env.COOKIE_SAMESITE || "lax").toLowerCase() === "none" ? "none" : "lax";
const COOKIE_SECURE =
  process.env.COOKIE_SECURE === "true" ||
  process.env.COOKIE_SECURE === "1" ||
  COOKIE_SAMESITE === "none" ||
  process.env.NODE_ENV === "production";
const CORS_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const poolConfig = DATABASE_URL
  ? {
      connectionString: DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
    }
  : {
      host: PGHOST,
      port: PGPORT ? Number(PGPORT) : 5432,
      user: PGUSER,
      password: PGPASSWORD,
      database: PGDATABASE,
      ssl: { rejectUnauthorized: false },
    };

const pool = new Pool(poolConfig);

const app = express();

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) {
        return cb(null, true);
      }
      if (CORS_ORIGINS.includes(origin)) {
        return cb(null, true);
      }
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

const isSafeName = (value) => /^[a-zA-Z0-9_]+$/.test(value);

const quoteIdent = (name) => `"${String(name).replace(/"/g, '""')}"`;

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
  const cacheKey = `${PGSCHEMA}.${table}`;
  if (tableColumnsCache.has(cacheKey)) {
    return tableColumnsCache.get(cacheKey);
  }

  const { rows } = await pool.query(
    `SELECT column_name, data_type, udt_name
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2
     ORDER BY ordinal_position`,
    [PGSCHEMA, table]
  );

  const cols = new Map(
    (rows || []).map((r) => {
      const dt = String(r.data_type || "").toLowerCase();
      const udt = String(r.udt_name || "").toLowerCase();
      return [r.column_name, `${dt}|${udt}`];
    })
  );
  tableColumnsCache.set(cacheKey, cols);
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
    return val.map((v) => (typeof v === "string" && /^-?\d+$/.test(v) ? Number(v) : v));
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
      const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length > 1 && parts.every((p) => /^-?\d+$/.test(p))) {
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

const isJsonType = (typeStr) => typeStr.includes("json");

const isTextLikeType = (typeStr) =>
  typeStr.includes("text") ||
  typeStr.includes("char") ||
  typeStr.includes("bytea");

const coerceToColumnTypes = async (table, fields) => {
  const cols = await getTableColumns(table);
  const out = {};

  for (const [key, val] of Object.entries(fields)) {
    const typeStr = cols.get(key);
    if (!typeStr) {
      continue;
    }

    if (isJsonType(typeStr)) {
      const norm = normalizeJsonValue(val);
      out[key] = norm == null ? null : JSON.stringify(norm);
      continue;
    }

    if (isTextLikeType(typeStr)) {
      const looksJsonLike =
        Array.isArray(val) ||
        (val && typeof val === "object") ||
        (typeof val === "string" &&
          (val.trim().startsWith("[") || val.trim().startsWith("{") || val.includes(",")));

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
      if (!s || (!s.startsWith("[") && !s.startsWith("{"))) {
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

const dbErrorPayload = (error) => {
  const e = error || {};
  const out = {
    error: "db_error",
    code: e.code,
    message: e.message || "Database error",
    sqlMessage: e.message || "Database error",
  };
  if (e.detail) {
    out.detail = e.detail;
  }
  if (e.code === "28P01") {
    out.message =
      "Database rejected the password in DATABASE_URL. In Supabase: Project Settings → Database → reset the database password, then paste the new connection string (URI) into .env.";
  } else if (e.code === "42P01") {
    out.message =
      "A referenced table was not found. Create or migrate your schema (e.g. usuarios) into Postgres, or set PGSCHEMA if tables are not in public.";
  } else if (e.code === "ECONNREFUSED" || e.code === "ENOTFOUND") {
    out.message =
      "Could not reach the database host. Check DATABASE_URL host/port and your network/VPN.";
  }
  return out;
};

function requireSessionSecret() {
  if (AUTH_DISABLED) {
    return true;
  }
  if (SESSION_SECRET.length >= 16) {
    return true;
  }
  return false;
}

function requireAuth(req, res, next) {
  if (AUTH_DISABLED) {
    req.principal = null;
    return next();
  }
  if (!requireSessionSecret()) {
    return res.status(503).json({
      error: "server_misconfigured",
      message: "Set SESSION_SECRET (min 16 chars) or AUTH_DISABLED=true for local dev.",
    });
  }
  const token = req.cookies?.[SESSION_COOKIE];
  const payload = verifySessionToken(token, SESSION_SECRET);
  if (!payload) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Authentication required.",
    });
  }
  req.principal = payload;
  next();
}

app.get("/health", async (req, res) => {
  if (req.query.checkDb !== "1") {
    return res.json({ ok: true });
  }
  try {
    await pool.query("SELECT 1 AS ok");
    return res.json({ ok: true, db: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, db: false, ...dbErrorPayload(error) });
  }
});

function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

app.post("/auth/login", async (req, res) => {
  if (AUTH_DISABLED) {
    return res.status(503).json({
      error: "auth_disabled",
      message: "AUTH_DISABLED is set; login cookie is not issued.",
    });
  }
  if (!requireSessionSecret()) {
    return res.status(503).json({
      error: "server_misconfigured",
      message: "Set SESSION_SECRET (min 16 chars).",
    });
  }

  const supabaseAccessToken = String(req.body?.supabase_access_token ?? "").trim();
  if (supabaseAccessToken) {
    if (!SUPABASE_URL && !SUPABASE_JWT_SECRET) {
      return res.status(503).json({
        error: "server_misconfigured",
        message:
          "Set SUPABASE_URL (https://<ref>.supabase.co) for JWT signing keys (JWKS), or legacy SUPABASE_JWT_SECRET.",
      });
    }
    const claims = await verifySupabaseAccessToken(supabaseAccessToken, {
      supabaseUrl: SUPABASE_URL,
      legacyJwtSecret: SUPABASE_JWT_SECRET,
    });
    const authUid = claims && typeof claims.sub === "string" ? claims.sub : "";
    if (!authUid) {
      return res.status(401).json({
        error: "login_failed",
        message: "Token Supabase inválido ou expirado.",
      });
    }
    try {
      const { rows } = await pool.query(
        `SELECT * FROM ${quoteIdent(PGSCHEMA)}.${quoteIdent("usuarios")}
         WHERE auth_user_id = $1::uuid LIMIT 1`,
        [authUid]
      );
      if (!rows?.length) {
        return res.status(401).json({
          error: "login_failed",
          message: "Nenhum usuário do app vinculado a esta conta Supabase (auth_user_id).",
        });
      }
      const user = rows[0];
      const token = signSessionToken(user, SESSION_SECRET);
      setSessionCookie(res, token);
      return res.json({
        ok: true,
        username: String(user.username ?? ""),
        userId: user.id,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json(dbErrorPayload(error));
    }
  }

  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (!username || !password) {
    return res.status(400).json({
      error: "credentials_required",
      message: "Informe usuário e senha, ou supabase_access_token.",
    });
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM ${quoteIdent(PGSCHEMA)}.${quoteIdent("usuarios")}
       WHERE LOWER(username) = LOWER($1) LIMIT 1`,
      [username]
    );

    if (!rows?.length) {
      return res.status(401).json({
        error: "login_failed",
        message: "Usuário ou senha inválidos.",
      });
    }

    const user = rows[0];
    const cols = await getTableColumns("usuarios");

    if (cols.has("senha")) {
      const ok = await verifyStoredPassword(user.senha, password);
      if (!ok) {
        return res.status(401).json({
          error: "login_failed",
          message: "Usuário ou senha inválidos.",
        });
      }
    } else {
      return res.status(503).json({
        error: "login_not_configured",
        message:
          "Sem coluna senha: use login com Supabase (supabase_access_token) e defina SUPABASE_URL, ou adicione `senha text` em usuarios.",
      });
    }

    const token = signSessionToken(user, SESSION_SECRET);
    setSessionCookie(res, token);
    return res.json({
      ok: true,
      username: String(user.username ?? ""),
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json(dbErrorPayload(error));
  }
});

app.get("/auth/session", (req, res) => {
  if (AUTH_DISABLED) {
    return res.json({ ok: true, authDisabled: true });
  }
  if (!requireSessionSecret()) {
    return res.status(503).json({
      error: "server_misconfigured",
      message: "Set SESSION_SECRET (min 16 chars).",
    });
  }
  const token = req.cookies?.[SESSION_COOKIE];
  const payload = verifySessionToken(token, SESSION_SECRET);
  if (!payload) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Authentication required.",
    });
  }
  return res.json({
    ok: true,
    userId: payload.sub,
    username: payload.username ?? "",
    clinica_id: payload.clinica_id ?? null,
    status: payload.status ?? null,
  });
});

app.post("/auth/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE, {
    path: "/",
    sameSite: COOKIE_SAMESITE,
    secure: COOKIE_SECURE,
  });
  return res.json({ ok: true });
});

app.get("/data", requireAuth, async (req, res) => {
  const raw = (req.query.tables || "").toString();
  const tables = raw.split(",").map((t) => t.trim()).filter(Boolean);

  if (tables.length === 0) {
    return res.status(400).json({ error: "tables_required" });
  }

  const invalid = tables.find((t) => !isSafeName(t));
  if (invalid) {
    return res.status(400).json({ error: "invalid_table", table: invalid });
  }

  try {
    const result = {};
    const principal = req.principal;
    for (const table of tables) {
      const { text, values } = buildSelectForTable(PGSCHEMA, table, principal, quoteIdent);
      const { rows } = await pool.query(text, values);
      result[table] = await parseJsonColumns(table, rows);
    }
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json(dbErrorPayload(error));
  }
});

app.get("/data/:table", requireAuth, async (req, res) => {
  const { table } = req.params;

  if (!isSafeName(table)) {
    return res.status(400).json({ error: "invalid_table" });
  }

  try {
    const { text, values } = buildSelectForTable(PGSCHEMA, table, req.principal, quoteIdent);
    const { rows } = await pool.query(text, values);
    return res.json(await parseJsonColumns(table, rows));
  } catch (error) {
    console.error(error);
    return res.status(500).json(dbErrorPayload(error));
  }
});

app.post("/record/:table", requireAuth, async (req, res) => {
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

  const tenantFields = applyInsertTenantFields(table, fields, req.principal);
  if (tenantFields == null) {
    return res.status(403).json({
      error: "forbidden",
      message: "Sem permissão para criar neste cadastro.",
    });
  }
  fields = tenantFields;

  fields = await filterToColumns(table, fields);
  fields = await coerceToColumnTypes(table, fields);
  const cols = Object.keys(fields);
  if (cols.length === 0) {
    return res.status(400).json({ error: "empty_payload" });
  }

  try {
    const colSql = cols.map((c) => quoteIdent(c)).join(", ");
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const values = cols.map((c) => fields[c]);
    const sql = `INSERT INTO ${quoteIdent(PGSCHEMA)}.${quoteIdent(table)} (${colSql}) VALUES (${placeholders}) RETURNING ${quoteIdent(idAccessor)}`;
    const { rows } = await pool.query(sql, values);
    const insertId = rows?.[0]?.[idAccessor];
    return res.json({ ok: true, insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json(dbErrorPayload(error));
  }
});

app.put("/record/:table/:id", requireAuth, async (req, res) => {
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
    const w = buildOwnershipWhere(PGSCHEMA, table, idAccessor, id, req.principal, quoteIdent);
    if (w.text === "false") {
      return res.status(403).json({
        error: "forbidden",
        message: "Sem permissão para alterar este registro.",
      });
    }

    const setSql = cols.map((c, i) => `${quoteIdent(c)} = $${i + 1}`).join(", ");
    const whereSql = w.text.replace(/\$(\d+)/g, (_, n) => `$${cols.length + Number(n)}`);
    const allValues = [...cols.map((c) => fields[c]), ...w.values];
    const sql = `UPDATE ${quoteIdent(PGSCHEMA)}.${quoteIdent(table)} SET ${setSql} WHERE ${whereSql}`;
    const { rowCount } = await pool.query(sql, allValues);
    if (!rowCount) {
      return res.status(404).json({
        error: "not_found",
        message: "Registro não encontrado ou sem permissão.",
      });
    }
    return res.json({ ok: true, affectedRows: rowCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json(dbErrorPayload(error));
  }
});

app.delete("/record/:table/:id", requireAuth, async (req, res) => {
  const { table, id } = req.params;
  const idAccessor = (req.query.idAccessor || "id").toString();

  if (!isSafeName(table) || !isSafeName(idAccessor)) {
    return res.status(400).json({ error: "invalid_table" });
  }

  try {
    const finalWhere = buildOwnershipWhere(PGSCHEMA, table, idAccessor, id, req.principal, quoteIdent);
    if (finalWhere.text === "false") {
      return res.status(403).json({ error: "forbidden", message: "Sem permissão para excluir este registro." });
    }
    const sql = `DELETE FROM ${quoteIdent(PGSCHEMA)}.${quoteIdent(table)} WHERE ${finalWhere.text}`;
    const { rowCount } = await pool.query(sql, finalWhere.values);
    if (!rowCount) {
      return res.status(404).json({ error: "not_found", message: "Registro não encontrado ou sem permissão." });
    }
    return res.json({ ok: true, affectedRows: rowCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json(dbErrorPayload(error));
  }
});

const server = app.listen(Number(PORT), listenHost, () => {
  console.log(
    `Supabase (Postgres) API listening on http://${listenHost === "0.0.0.0" ? "127.0.0.1" : listenHost}:${PORT} (schema ${PGSCHEMA})`
  );
  if (AUTH_DISABLED) {
    console.warn("AUTH_DISABLED=true: /data and /record are not protected by session.");
  } else if (SESSION_SECRET.length < 16) {
    console.warn("SESSION_SECRET is missing or too short; protected routes will return 503 until fixed.");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the other process, or set PORT in .env to a free port (e.g. 3102).`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
