//
// Generic capabilities contract for NeoFront access control.
//
// The engine never evaluates policy rules: it receives pre-resolved capabilities from the
// application layer (project loaders, backend APIs, etc.) and uses them solely as UI gating hints
// (show/hide, enable/disable).
//

// #region --------------------------------------------------------------------------------- Imports

import type { FieldsConfig } from "context";

// #endregion

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
  /** Whether the field is read-only. */
  readOnly?: boolean;
  /** Whether the field is visible. */
  visible?: boolean;
}

/** Capabilities for a single view. */
export interface ViewCapabilities {
  /** Operation capabilities for the view. */
  rules: ViewRules;
  /** Per-field UI overrides for the view. */
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

/** Payload passed to each ViewResolver function. */
export interface ViewResolverPayload {
  /** The authenticated user row. */
  user: Row;
  /** Numeric role value from the user record. */
  role: number;
  /** Full data payload (all tables). */
  data: DataPayload;
}

/** Result returned by a ViewResolver. */
export type ViewResolverResult = {
  /** Capabilities for the current view. The factory aggregates these per view. */
  viewCaps: ViewCapabilities;
  /** Data after app-layer filtering (row-level, option-level). */
  data: DataPayload;
};

/** Result returned by a ViewResolver, or `undefined` to fall back to roleOverrides. */
export type ViewResolverResultType = ViewResolverResult | undefined;

/**
 * Per-view resolver function signature.
 * Receives a payload with the authenticated user, role value, and full data.
 * Returns view capabilities and (optionally filtered) data, or `undefined`
 * to fall back to `roleOverrides` / default deny.
 */
export type ViewResolver = (
  payload: ViewResolverPayload,
) => ViewResolverResult | undefined;

/**
 * Configuration for the `createViewBasedAccessResolver` factory.
 */
export interface ViewBasedAccessResolverConfig {
  /** Table that contains user records (e.g. "usuarios"). */
  userTable: string;
  /** Field used to match localStorage username (default: "username"). */
  usernameAccessor?: string;
  /** Field on the user record that holds the role value (e.g. "tipo_permissao"). */
  roleAccessor: string;
  /** Map from view name → resolver function. Unlisted views get noRules(). */
  viewResolvers: Record<string, ViewResolver>;
  /**
   * Capabilities applied for specific roles across ALL views, before falling
   * back to noRules(). When a ViewResolver returns `undefined` for a given
   * role, the factory checks here. This avoids repeating the same role
   * (e.g. superusuario) in every view resolver.
   */
  roleOverrides?: Record<number, ViewCapabilities>;
  /** Builds the PrincipalContext from the authenticated user row. */
  buildPrincipal: (user: Row) => PrincipalContext;
}

// #endregion

// #region -------------------------------------------------------------------------- Helper exports

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

// #region ------------------------------------------------------------------------ Internal helpers

/** Shared user lookup + localStorage flag logic for both factory variants. */
function lookupUser(
  data: DataPayload,
  userTable: string,
  usernameAccessor: string,
): Row | undefined {
  const users = data[userTable];
  const storedName = localStorage.getItem('__nf_username');
  const user = storedName && Array.isArray(users)
    ? users.find(u => String(u[usernameAccessor] ?? '').toLowerCase() === storedName.toLowerCase())
    : undefined;

  if (!user) {
    try {
      localStorage.setItem('__nf_username_valid', '0');
    } catch {
      /* */
    }
  } else {
    try {
      localStorage.setItem('__nf_username', String(user[usernameAccessor] ?? user.id ?? ''));
      localStorage.setItem('__nf_username_valid', '1');
    } catch {
      /* */
    }
  }

  return user;
}

/** Returns a deny-all result for a given view name. */
function denyResult(viewName: string, data: DataPayload): AccessResolverResult {
  return {
    capabilities: { views: { [viewName]: { rules: noRules() } } },
    data: { ...data, [viewName]: [] as Row[] },
  };
}

// #endregion

// #region --------------------------------------------------------------------------------- Factory

/**
 * Creates a standard AccessResolver from a view-based configuration.
 *
 * Handles: user lookup via localStorage username, localStorage validation flags, principal
 * construction, and all-views capability resolution (for menu gating). The app provides one
 * resolver per **view** (each switches on the role internally).
 *
 * View names are derived from the keys of `viewResolvers`. Views not listed receive `noRules()`.
 */
export function createViewBasedAccessResolver(config: ViewBasedAccessResolverConfig): AccessResolver {
  const {
    userTable,
    usernameAccessor = 'username',
    roleAccessor,
    viewResolvers,
    roleOverrides,
    buildPrincipal,
  } = config;

  const allViewNames = Object.keys(viewResolvers);
  const defaultResult = (d: DataPayload): ViewResolverResult => ({ viewCaps: { rules: noRules() }, data: d });

  return (viewName, data, _fieldsCfg) => {
    const user = lookupUser(data, userTable, usernameAccessor);
    if (!user) {
      return denyResult(viewName, data);
    }

    const roleVal = user[roleAccessor] as number;
    const override = roleOverrides?.[roleVal];

    function resolveOne(vn: string): ViewResolverResult {
      const resolver = viewResolvers[vn];
      // 1) Try the view-specific resolver
      const result = resolver?.({ user: user!, role: roleVal, data });
      if (result) {
        return result;
      }
      // 2) Fall back to role override (e.g. superusuario gets allRules everywhere)
      if (override) {
        return { viewCaps: override, data };
      }
      // 3) Default: deny
      return defaultResult(data);
    }

    const resolved = resolveOne(viewName);

    const allViews: Record<string, ViewCapabilities> = {};
    for (const vn of allViewNames) {
      allViews[vn] = vn === viewName
        ? resolved.viewCaps
        : resolveOne(vn).viewCaps;
    }

    return {
      capabilities: { principal: buildPrincipal(user), views: allViews },
      data: resolved.data,
    };
  };
}

// #endregion
