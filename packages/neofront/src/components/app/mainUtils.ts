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
  data: ViewResultProps["data"], permissions?: PermissionsConfig): Promise<ViewResultProps> | undefined {

  if (!activeViews.includes(viewName)) {
    return undefined;
  }

  return Promise.resolve({
    listView: metadata.listView[viewName],
    form: metadata.form[viewName],
    fieldConfig: metadata.fieldConfig,
    data: permissions ? enforcePermissions(permissions, data, viewName) : data,
  });
}

// #endregion
