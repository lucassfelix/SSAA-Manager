# Supabase API (BFF)

Minimal REST API that exposes Postgres (Supabase) tables to NeoFront apps using the same contract as `@neofront/mysql-api`: `GET /data`, `POST|PUT|DELETE /record/...`, plus secured session auth.

## Setup

1. Copy `.env.example` to `.env` and set **`DATABASE_URL`**, **`SESSION_SECRET`** (min 16 characters), **`CORS_ORIGIN`**, and **`SUPABASE_URL`** (same as the SPA, e.g. `https://<ref>.supabase.co`) when using Supabase Auth in the SPA. Token verification uses **JWT signing keys** via **`/auth/v1/.well-known/jwks.json`**.
2. From the repo root: `npm install`
3. Run: `npm run supabase-api` (or `npm run dev -w @neofront/supabase-api`)

For **GitHub Pages** + BFF on another HTTPS host, set **`COOKIE_SAMESITE=none`** and **`COOKIE_SECURE=true`** so the browser sends **`nf_session`** on cross-site requests.

### Docker

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) or Docker Engine on Linux.

1. Copy `packages/supabase-api/.env.example` → `packages/supabase-api/.env` and fill values (file is gitignored if you add `**/.env` to `.gitignore`).
2. From the **repository root**:

```bash
# Option A — Compose (recommended for local)
docker compose up --build

# Option B — plain Docker
docker build -f packages/supabase-api/Dockerfile -t neofront-supabase-api .
docker run --rm -p 3101:3101 --env-file packages/supabase-api/.env neofront-supabase-api
```

3. Verify: `curl http://localhost:3101/health` and `curl "http://localhost:3101/health?checkDb=1"`.

**Production (Render + Docker):** push the repo to GitHub, then **New → Blueprint** and select `render.yaml`, or **New → Web Service → Docker** with:

| Setting | Value |
|---------|--------|
| Dockerfile path | `packages/supabase-api/Dockerfile` |
| Docker context | repository root (`.`) |
| Health check path | `/health` |

Set `DATABASE_URL`, `SESSION_SECRET`, `SUPABASE_URL`, and `CORS_ORIGIN` only in the Render dashboard (never in git). For GitHub Pages, use `COOKIE_SAMESITE=none` and `COOKIE_SECURE=true` (already in `render.yaml`).

Default port is **3101** so it can run beside `mysql-api` on 3100. If startup fails with **`EADDRINUSE`**, stop the other process or change **`PORT`** in `.env` and point the SPA at the same URL.

### Local dev without sessions

Set **`AUTH_DISABLED=true`** in `.env` to skip JWT cookie checks on `/data` and `/record` (open API). Do not use in production. **`POST /auth/login`** returns **503** while `AUTH_DISABLED` is set (cookie auth is off).

## Point app-ssaa here

In `project/app.json` set `data.apiBaseUrl` and **`data.apiFetchCredentials": "include"`** so the browser sends the HttpOnly session cookie on cross-origin requests to this API.

## Security overview

- **Database URL** stays on the server only.
- **Session**: after successful **`POST /auth/login`**, the API sets HttpOnly cookie **`nf_session`** (signed JWT, 7-day TTL). Protected routes require it unless **`AUTH_DISABLED=true`**. The SPA calls **`GET /auth/session`** on load to gate pages and sync **`__nf_username`**.
- **`POST /auth/logout`** clears the cookie; the SPA calls it on logout from the shell when using the API data source.
- **CORS** uses **`credentials: true`** and an **allowlist** from **`CORS_ORIGIN`** (never `*` with cookies).

### Login (`POST /auth/login`)

**Option 1 — Supabase Auth (recommended for `usuarios.auth_user_id`):**

JSON body: `{ "supabase_access_token": "<access_token from supabase-js signInWithPassword>" }`.

1. Verifies the token with **JWKS** from **`SUPABASE_URL`** (asymmetric **JWT signing keys** in the dashboard). Optional fallback: legacy **`SUPABASE_JWT_SECRET`** (HS256) if your project still issues HS256 tokens.
2. Loads `usuarios` where **`auth_user_id`** equals the JWT **`sub`** (auth user UUID).
3. Issues **`nf_session`** cookie (same as password flow).

**Option 2 — Username + password in `usuarios`:**

JSON body: `{ "username", "password" }`.

1. Looks up `usuarios` by case-insensitive `username`.
2. If **`senha`** exists: password must match. Values starting with **`$2a$` / `$2b$` / `$2y$`** are verified with **bcrypt**; otherwise comparison is plain string (dev migration path).
3. If **`senha` is missing** and you did not send **`supabase_access_token`**, returns **503** asking for Supabase login or a **`senha`** column.

```sql
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS senha text;
-- only if you use Option 2; prefer bcrypt hashes in production
```

### Server-side data rules (SSAA)

Aligned with app policy: users with **`clinica_id` null or `1`** are treated as **global admins** (full `SELECT` / inserts where allowed). Other users only see rows for their **`clinica_id`** on `clinicas`, `usuarios`, `pacientes`, `projetos`; **`status_usuario`** is read by all; inserts into **`clinicas`** / **`status_usuario`** are denied for non-admins; inserts into tenant tables force **`clinica_id`** to the caller’s clinic. **UPDATE/DELETE** require the row to belong to the tenant (or admin).

### Postgres RLS vs BFF-only scoping

- **BFF-only (current):** The pool uses a powerful DB role; tenant rules live in this service’s SQL. Simple to deploy; defense is only as strong as this code.
- **RLS:** Policies on `public.*` using `auth.uid()` add database-enforced isolation when clients use a limited role. You can combine both: keep the BFF for NeoFront’s contract, use a non-superuser role + RLS, and still issue a session after verifying the user.

## Verify locally

1. `.env` with **`DATABASE_URL`**, **`SESSION_SECRET`**, **`CORS_ORIGIN=http://localhost:5173`** (match your Vite origin).
2. `npm run supabase-api`
3. `curl http://localhost:3101/health` → `{"ok":true}`
4. `curl "http://localhost:3101/health?checkDb=1"` → `{"ok":true,"db":true}` on success.
5. Without a cookie, `curl "http://localhost:3101/data?tables=clinicas"` → **401** (unless `AUTH_DISABLED=true`).
6. After logging in via the SPA (or by obtaining a cookie from `POST /auth/login` with `-c` cookie jar), `/data` returns JSON.
7. **Other devices:** deploy the SPA and BFF over **HTTPS**, set **`CORS_ORIGIN`** to the SPA origin, and use **`COOKIE_SAMESITE=none`** + **`COOKIE_SECURE=true`** on the BFF if the SPA and API are on different sites (e.g. GitHub Pages + Render).

### If `/data` returns 500

Inspect **Network → Response** for `message` / Postgres `code`. Check the API terminal log.

## Troubleshooting: "connection refused"

See earlier notes: API must be running, ports aligned, Vite restarted after env changes, WSL vs Windows host alignment.

`curl http://127.0.0.1:3101/health` → `{"ok":true}`.

## Follow-on milestones (not implemented)

- **Supabase Storage** for patient images: signed upload/download URLs, separate routes or client SDK.
- **Rate limiting** on `/auth/login`, structured logging, reverse-proxy TLS in production.
- **Refresh tokens** / shorter access JWT if you need stricter session semantics.
