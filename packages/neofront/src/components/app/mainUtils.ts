//
// Utilities to simplify code in main.tsx files for NeoFront applications.
//

// #region --------------------------------------------------------------------------------- Imports

import ReactDOM from "react-dom/client";

import { FieldsConfig, FormDataConfig, ListViewProps, UnifiedFieldProps, ViewResultProps } from "context";
import type { AccessResolver, FieldCapability } from "./accessCapabilities";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

interface ViewResultParams {
  listView: {
    [key: string]: ListViewProps;
  };
  form: {
    [key: string]: FormDataConfig;
  };
  fieldConfig: {
    [key: string]: FieldsConfig;
  };
}

// #endregion

// #region ------------------------------------------------------------------------------- Functions

/**
 * Applies field-level capabilities (readOnly, visible) from the access resolver
 * onto the field definitions used by form and table renderers.
 */
function applyFieldCapabilities(
  fields: Record<string, UnifiedFieldProps>,
  caps: Record<string, FieldCapability>,
) {
  // Handle "allFields" wildcard first
  const allRule = caps.allFields;
  if (allRule) {
    for (const fieldDef of Object.values(fields)) {
      if (typeof allRule.readOnly === 'boolean') {
        (fieldDef as any).readOnly = allRule.readOnly;
      }
      if (typeof allRule.visible === 'boolean') {
        (fieldDef as any).enabled = allRule.visible;
      }
    }
  }

  // Per-field overrides
  for (const [fieldName, cap] of Object.entries(caps)) {
    if (fieldName === 'allFields') {
      continue;
    }
    const fieldDef = fields[fieldName];
    if (!fieldDef) {
      continue;
    }
    if (typeof cap.readOnly === 'boolean') {
      (fieldDef as any).readOnly = cap.readOnly;
    }
    if (typeof cap.visible === 'boolean') {
      (fieldDef as any).enabled = cap.visible;
    }
  }
}

/**
 * Reuse existing root to prevent full remount during HMR.
 * @returns The React root for the application.
 */
export function getRoot() {
  const container = document.getElementById("root")!;
  return (window as any).__nf_root || ((window as any).__nf_root = ReactDOM.createRoot(container));
}

/**
 * Creates a view loader function that loads view configurations based on active views.
 * @param activeViews Array of active view names.
 * @param viewName The name of the view to load.
 * @param metadata Metadata containing view configurations.
 * @param data Data associated with the views.
 * @param accessResolver Optional callback that resolves capabilities and filters data per view.
 * @returns A promise resolving to the view result properties or undefined if the view is not active.
 */
export function createViewLoader(activeViews: string[], viewName: string, metadata: ViewResultParams,
  data: ViewResultProps["data"]
    | (() => Promise<ViewResultProps["data"]>)
    | ((viewName: string) => Promise<ViewResultProps["data"]>),
  accessResolver?: AccessResolver): Promise<ViewResultProps> | undefined {

  if (!activeViews.includes(viewName)) {
    return undefined;
  }

  const dataPromise =
    typeof data === "function"
      ? (data.length === 0 ? (data as () => Promise<ViewResultProps["data"]>)() :
        (data as (viewName: string) => Promise<ViewResultProps["data"]>)(viewName))
      : Promise.resolve(data);

  return dataPromise.then(resolvedData => {
    let finalData = resolvedData;
    let capabilities: ViewResultProps["capabilities"] = undefined;

    if (accessResolver) {
      const result = accessResolver(viewName, resolvedData, metadata.fieldConfig[viewName]);
      finalData = result.data;
      capabilities = result.capabilities;

      // Apply field-level capabilities (readOnly / visible) to field definitions
      const viewFieldCaps = capabilities?.views?.[viewName]?.fields;
      const viewFields = metadata.fieldConfig[viewName]?.fields;
      if (viewFieldCaps && viewFields) {
        applyFieldCapabilities(viewFields, viewFieldCaps);
      }
    }

    return {
      listView: metadata.listView[viewName],
      form: metadata.form[viewName],
      fieldConfig: metadata.fieldConfig,
      data: finalData,
      capabilities,
    };
  });
}

/**
 * Creates a data loader function that fetches data from a REST API.
 * @param apiBaseUrl The base URL of the API.
 * @param tableNames The list of table names to fetch.
 * @param dataEnhancer A function to enhance the fetched data.
 * @returns A function that loads and enhances data from the API.
 */
export function createDataLoader(
  apiBaseUrl: string,
  tableNames: string[],
  dataEnhancer?: (arg0: any) => any,
  apiFetchCredentials?: RequestCredentials,
): () => Promise<any> {
  const baseUrl = apiBaseUrl?.replace(/\/$/, "") || "";
  return async () => {
    const url = `${baseUrl}/data?tables=${encodeURIComponent(tableNames.join(','))}`;
    const response = await fetch(url, apiFetchCredentials ? { credentials: apiFetchCredentials } : undefined);
    if (!response.ok) {
      throw new Error('Failed to load data from API: ' + response.statusText);
    }
    const payload = await response.json();
    return dataEnhancer ? dataEnhancer(payload) : payload;
  };
}

/**
 * Returns true when the BFF session cookie is valid (`GET /auth/session`).
 * Syncs `__nf_username` from the server when present.
 */
export async function checkApiSession(
  apiBaseUrl: string,
  apiFetchCredentials?: RequestCredentials,
): Promise<boolean> {
  const baseUrl = apiBaseUrl?.replace(/\/$/, "") || "";
  if (!baseUrl) {
    return false;
  }
  const response = await fetch(
    `${baseUrl}/auth/session`,
    apiFetchCredentials ? { credentials: apiFetchCredentials } : undefined,
  );
  if (!response.ok) {
    return false;
  }
  const body = (await response.json().catch(() => ({}))) as { username?: string };
  const username = String(body.username ?? "").trim();
  if (username) {
    try {
      localStorage.setItem("__nf_username", username);
      localStorage.setItem("__nf_username_valid", "1");
    } catch {
      /* ignore */
    }
  }
  return true;
}

/**
 * Clears client-side login markers used by the access resolver.
 */
export function clearClientAuthMarkers() {
  try {
    localStorage.removeItem("__nf_username");
    localStorage.removeItem("__nf_username_valid");
    sessionStorage.removeItem("__nf_loaded_cache");
  } catch {
    /* ignore */
  }
}

/**
 * Merges optional API cookie credentials from app config into fetch init.
 */
export function withApiFetchCredentials(
  data: { apiFetchCredentials?: RequestCredentials } | undefined,
  init?: RequestInit,
): RequestInit {
  const c = data?.apiFetchCredentials;
  if (!c) {
    return { ...init };
  }
  return { ...(init || {}), credentials: c };
}

/**
 * Replaces variables in a text string with values from the provided context.
 * @param text The text containing variables to be replaced.
 * @param ctx An optional context object containing fields configuration, record data, and accessors for id and name. 
 * @returns The text with variables replaced by their corresponding values from the context.
 */
export function replaceVars(text: string, ctx?: {
  fieldsCfg?: FieldsConfig;
  record?: Record<string, any> | null;
  idAccessor?: string;
  nameAccessor?: string;
}): string {
  if (!text) {
    return text;
  }

  const fieldsCfg = ctx?.fieldsCfg;
  const record = ctx?.record;
  const name = ctx?.nameAccessor ? record?.[ctx.nameAccessor] : undefined;
  const id = ctx?.idAccessor ? record?.[ctx.idAccessor] : undefined;
  const userid = localStorage.getItem('__nf_username_valid') === '1'
    ? (localStorage.getItem('__nf_username') || '[unknown]')
    : '[unknown]';

  return text
    .replace('{name}', String(name ?? '[unknown]'))
    .replace('{id}', String(id ?? '[unknown]'))
    .replace('{theItem}', String(fieldsCfg?.strings?.theItem ?? '[unknown]'))
    .replace('{singular}', String(fieldsCfg?.strings?.singular ?? fieldsCfg?.name ?? '[unknown]'))
    .replace('{plural}', String(fieldsCfg?.strings?.plural ?? fieldsCfg?.name ?? '[unknown]'))
    .replace('{userid}', userid);
}

// #endregion
