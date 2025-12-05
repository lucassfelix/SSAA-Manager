//
// Entry point for this application.
//

// #region --------------------------------------------------------------------------------- Imports

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App, createViewLoader, AppProps, MenuConfig, IconsConfig } from "@neofront/core";

// App configuration imports
import appCfg from "project/app.json";
import menuCfg from "project/menu.json";
import iconsCfg from "project/icons.json";
import viewsCfg from "project/views/views.json";
import "./styles/theme.css";
import "./styles/app.css";

// #endregion

// #region ----------------------------------------------------------------------------- Entry point

// Vite glob import must be at module level
const loaderModules = import.meta.glob("../project/views/*/loader.js");

// Reuse existing root to prevent full remount during HMR
const container = document.getElementById("root")!;
const root = (window as any).__nf_root || ((window as any).__nf_root = ReactDOM.createRoot(container));

root.render(
  <BrowserRouter>
    <App
      appCfg={appCfg as AppProps}
      menuCfg={menuCfg as MenuConfig}
      iconsCfg={iconsCfg as IconsConfig}
      loadView={createViewLoader(viewsCfg.active, loaderModules)}
    />
  </BrowserRouter>
);

// #endregion
