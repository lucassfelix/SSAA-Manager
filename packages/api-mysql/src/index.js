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

const isSafeName = (value) => /^[a-zA-Z0-9_]+$/.test(value);

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
      result[table] = rows;
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
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "db_error" });
  }
});

app.listen(PORT, () => {
  console.log(`SSAA API listening on ${PORT}`);
});
