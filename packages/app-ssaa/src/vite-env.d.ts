/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Overrides `project/app.json` `data.apiBaseUrl` (NeoFront data BFF base URL). */
  readonly VITE_API_BASE_URL?: string;
  /** Supabase project URL (Authentication). Required with VITE_SUPABASE_ANON_KEY for login. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon (public) key. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Vite app base path for GitHub Pages (e.g. `/nf-core/`). Set in CI via `VITE_BASE_PATH`. */
  readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
