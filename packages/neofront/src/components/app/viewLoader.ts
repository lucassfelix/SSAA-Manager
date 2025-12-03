//
// Factory to create view loader from glob imports.
//

// #region --------------------------------------------------------------------------------- Imports

import { ViewResultProps } from "context";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

type GlobImport = Record<string, () => Promise<unknown>>;

// #endregion

// #region ------------------------------------------------------------------------------- Functions

export function createViewLoader(activeViews: string[], loaderModules: GlobImport):
  (viewName: string) => Promise<ViewResultProps> | undefined {

  const registry: Record<string, () => Promise<ViewResultProps>> = {};

  activeViews.forEach(v => {
    const key = Object.keys(loaderModules).find(k => k.includes(`/${v}/loader`));
    if (key) {
      registry[v] = () => loaderModules[key]().then(m => (m as { default: ViewResultProps }).default);
    }
  });

  return (viewName: string) => registry[viewName]?.();
}

// #endregion
