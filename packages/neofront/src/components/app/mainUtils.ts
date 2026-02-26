//
// Utilities to simplify code in main.tsx files for NeoFront applications.
//

// #region --------------------------------------------------------------------------------- Imports

import ReactDOM from "react-dom/client";

import { FieldsConfig, FormDataConfig, ListViewProps, ViewResultProps } from "context";
import { enforcePermissions, PermissionsConfig } from "./enforcePermissions";

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
 * @param permissions Optional permissions configuration for filtering data.
 * @returns A promise resolving to the view result properties or undefined if the view is not active.
 */
export function createViewLoader(activeViews: string[], viewName: string, metadata: ViewResultParams,
  data: ViewResultProps["data"]
    | (() => Promise<ViewResultProps["data"]>)
    | ((viewName: string) => Promise<ViewResultProps["data"]>),
  permissions?: PermissionsConfig): Promise<ViewResultProps> | undefined {

  if (!activeViews.includes(viewName)) {
    return undefined;
  }

  const dataPromise =
    typeof data === "function"
      ? (data.length === 0 ? (data as () => Promise<ViewResultProps["data"]>)() :
        (data as (viewName: string) => Promise<ViewResultProps["data"]>)(viewName))
      : Promise.resolve(data);

  return dataPromise.then(resolvedData => ({
    listView: metadata.listView[viewName],
    form: metadata.form[viewName],
    fieldConfig: metadata.fieldConfig,
    data: enforcePermissions(resolvedData, viewName, permissions, metadata.fieldConfig[viewName]),
  }));
}

/**
 * Creates a data loader function that fetches data from a REST API.
 * @param apiBaseUrl The base URL of the API.
 * @param tableNames The list of table names to fetch.
 * @param dataEnhancer A function to enhance the fetched data.
 * @returns A function that loads and enhances data from the API.
 */
export function createDataLoader(apiBaseUrl: string, tableNames: string[],
  dataEnhancer?: (arg0: any) => any): () => Promise<any> {
  const baseUrl = apiBaseUrl?.replace(/\/$/, "") || "";
  return async () => {
    const url = `${baseUrl}/data?tables=${encodeURIComponent(tableNames.join(','))}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to load data from API: ' + response.statusText);
    }
    const payload = await response.json();
    return dataEnhancer ? dataEnhancer(payload) : payload;
  };
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
