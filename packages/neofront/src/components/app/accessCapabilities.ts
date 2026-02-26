//
// Generic capabilities contract for NeoFront access control.
//
// The engine never evaluates policy rules. It receives pre-resolved capabilities
// from the application layer (project loaders, backend APIs, etc.) and uses them
// solely as UI gating hints (show/hide, enable/disable).
//

import type { FieldsConfig } from "context";

// #region ----------------------------------------------------------------------------------- Types

/** Generic data row used by resolvers. */
export type Row = Record<string, any>;

/** Data payload keyed by table name. */
export type DataPayload = Record<string, Row[]>;

/** Per-view operation capabilities (all boolean — already resolved by the app layer). */
export interface ViewRules {
  browse?: boolean;
  detail?: boolean;
  edit?: boolean;
  add?: boolean;
  delete?: boolean;
}

/** Per-field UI overrides resolved for the current principal. */
export interface FieldCapability {
  readOnly?: boolean;
  visible?: boolean;
}

/** Capabilities for a single view. */
export interface ViewCapabilities {
  rules: ViewRules;
  fields?: Record<string, FieldCapability>;
}

/** Opaque principal context — the engine only reads values, never interprets policy. */
export interface PrincipalContext {
  id: string | number;
  username?: string;
  role?: string | number;
  /** Arbitrary attributes the app layer wants to expose for dynamic value resolution. */
  attrs?: Record<string, unknown>;
}

/** The full capabilities snapshot consumed by the engine. */
export interface AccessCapabilities {
  /** Info about the current user (for dynamic value substitution, not policy). */
  principal?: PrincipalContext;
  /** Per-view capabilities keyed by view name. */
  views: Record<string, ViewCapabilities>;
}

/**
 * Callback the app layer provides. Called once per view load.
 *
 * @param viewName  The view being loaded.
 * @param data      The raw data payload (so the app can filter rows / options).
 * @param fieldsCfg The field definitions for the view (so the app can mutate readOnly/visible).
 * @returns         Resolved capabilities + optionally filtered data.
 */
export type AccessResolver = (
  viewName: string,
  data: DataPayload,
  fieldsCfg?: FieldsConfig,
) => AccessResolverResult;

export interface AccessResolverResult {
  /** Capabilities snapshot for this view load. */
  capabilities: AccessCapabilities;
  /** Data after app-layer filtering (row-level, option-level). */
  data: DataPayload;
}

/**
 * Per-role resolver function signature.
 * Receives the authenticated user, the view being loaded, and the full data payload.
 * Returns view capabilities and (optionally filtered) data.
 */
export type RoleResolver = (
  user: Row,
  viewName: string,
  data: DataPayload,
) => { viewCaps: ViewCapabilities; data: DataPayload };

/**
 * Configuration for the `createAccessResolver` factory.
 */
export interface AccessResolverConfig {
  /** Table that contains user records (e.g. "usuarios"). */
  userTable: string;
  /** Field used to match localStorage username (default: "username"). */
  usernameAccessor?: string;
  /** All view names in the project (needed to resolve menu-level caps). */
  allViewNames: string[];
  /** Field on the user record that holds the role value (e.g. "tipo_permissao"). */
  roleAccessor: string;
  /** Map from numeric role value → resolver function. */
  roleResolvers: Record<number, RoleResolver>;
  /** Builds the PrincipalContext from the authenticated user row. */
  buildPrincipal: (user: Row) => PrincipalContext;
}

// #endregion

// #region --------------------------------------------------------------------------- Helper exports

/** Returns a ViewRules object with all operations allowed. */
export function allRules(): ViewRules {
  return { browse: true, detail: true, edit: true, add: true, delete: true };
}

/** Returns a ViewRules object with all operations denied. */
export function noRules(): ViewRules {
  return { browse: false, detail: false, edit: false, add: false, delete: false };
}

/** Filters an array of rows, returning [] if the input is undefined/not-array. */
export function filterRows(rows: Row[] | undefined, predicate: (r: Row) => boolean): Row[] {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.filter(predicate);
}

// #endregion

// #region ----------------------------------------------------------------------- Factory: createAccessResolver

/**
 * Creates a standard AccessResolver from a role-based configuration.
 *
 * Handles: user lookup via localStorage username, localStorage validation flags,
 * role dispatch, principal construction, and all-views capability resolution
 * (for menu gating). Projects only need to supply per-role resolver functions
 * and a principal builder.
 */
export function createAccessResolver(config: AccessResolverConfig): AccessResolver {
  const {
    userTable,
    usernameAccessor = 'username',
    allViewNames,
    roleAccessor,
    roleResolvers,
    buildPrincipal,
  } = config;

  return (viewName, data, _fieldsCfg) => {
    // Locate authenticated user
    const users = data[userTable];
    const storedName = localStorage.getItem('__nf_username');
    const user = storedName && Array.isArray(users)
      ? users.find(u => String(u[usernameAccessor] ?? '').toLowerCase() === storedName.toLowerCase())
      : undefined;

    // No authenticated user → empty view, no caps
    if (!user) {
      try {
        localStorage.setItem('__nf_username_valid', '0');
      } catch {
        /* */
      }
      return {
        capabilities: { views: { [viewName]: { rules: noRules() } } },
        data: { ...data, [viewName]: [] as Row[] },
      };
    }

    // Persist validated user info for other engine utilities
    try {
      localStorage.setItem('__nf_username', String(user[usernameAccessor] ?? user.id ?? ''));
      localStorage.setItem('__nf_username_valid', '1');
    } catch {
      /* */
    }

    const roleVal = user[roleAccessor] as number;
    const resolver = roleResolvers[roleVal];

    // Unknown role → deny
    if (!resolver) {
      return {
        capabilities: { views: { [viewName]: { rules: noRules() } } },
        data: { ...data, [viewName]: [] as Row[] },
      };
    }

    // Resolve the requested view (full: caps + filtered data)
    const resolved = resolver(user, viewName, data);

    // Resolve all other views for menu gating (only caps needed, data discarded)
    const allViews: Record<string, ViewCapabilities> = {};
    for (const vn of allViewNames) {
      if (vn === viewName) {
        allViews[vn] = resolved.viewCaps;
      } else {
        allViews[vn] = resolver(user, vn, data).viewCaps;
      }
    }

    return {
      capabilities: { principal: buildPrincipal(user), views: allViews },
      data: resolved.data,
    };
  };
}

// #endregion
