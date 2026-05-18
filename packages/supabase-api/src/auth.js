import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createRemoteJWKSet, jwtVerify } from "jose";

export const SESSION_COOKIE = "nf_session";

/** @param {unknown} stored */
export async function verifyStoredPassword(stored, plain) {
  const s = stored == null ? "" : String(stored);
  if (s.startsWith("$2a$") || s.startsWith("$2b$") || s.startsWith("$2y$")) {
    return bcrypt.compare(String(plain), s);
  }
  return s === String(plain);
}

/**
 * @param {object} user - row from usuarios
 * @param {string} secret
 */
export function signSessionToken(user, secret) {
  const payload = {
    sub: String(user.id),
    username: String(user.username ?? ""),
    clinica_id: user.clinica_id == null ? null : Number(user.clinica_id),
    status: user.status == null ? null : Number(user.status),
  };
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

/**
 * @param {string | undefined} token
 * @param {string} secret
 */
export function verifySessionToken(token, secret) {
  if (!token || !secret) {
    return null;
  }
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

/**
 * @param {string} url
 */
export function normalizeSupabaseUrl(url) {
  const s = String(url || "").trim();
  if (!s) {
    return "";
  }
  return s.replace(/\/+$/, "");
}

/** @type {Map<string, ReturnType<typeof createRemoteJWKSet>>} */
const jwksByBaseUrl = new Map();

/**
 * @param {string} supabaseUrl e.g. https://<ref>.supabase.co
 */
function getSupabaseJwks(supabaseUrl) {
  const base = normalizeSupabaseUrl(supabaseUrl);
  if (!jwksByBaseUrl.has(base)) {
    jwksByBaseUrl.set(
      base,
      createRemoteJWKSet(new URL(`${base}/auth/v1/.well-known/jwks.json`))
    );
  }
  return jwksByBaseUrl.get(base);
}

/**
 * Verifies a Supabase Auth access token.
 * Primary: asymmetric JWT signing keys via JWKS (Project Settings → API → JWT signing keys).
 * Fallback: legacy HS256 with SUPABASE_JWT_SECRET when still enabled on the project.
 *
 * @param {string | undefined} token
 * @param {{ supabaseUrl?: string, legacyJwtSecret?: string }} options
 * @returns {Promise<import("jose").JWTPayload | null>}
 */
export async function verifySupabaseAccessToken(token, options = {}) {
  const raw = String(token || "").trim();
  if (!raw) {
    return null;
  }

  const supabaseUrl = normalizeSupabaseUrl(options.supabaseUrl);
  const legacyJwtSecret = String(options.legacyJwtSecret || "");

  if (supabaseUrl) {
    try {
      const issuer = `${supabaseUrl}/auth/v1`;
      const { payload } = await jwtVerify(raw, getSupabaseJwks(supabaseUrl), {
        issuer,
      });
      return payload;
    } catch (err) {
      if (!legacyJwtSecret) {
        console.warn("Supabase JWKS verify failed:", err?.message || err);
      }
    }
  }

  if (legacyJwtSecret) {
    try {
      return /** @type {import("jose").JWTPayload} */ (
        jwt.verify(raw, legacyJwtSecret, { algorithms: ["HS256"] })
      );
    } catch {
      return null;
    }
  }

  return null;
}
