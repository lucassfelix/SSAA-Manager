//
// Entry point for the demo application.
//

import { StrictMode } from "react";
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

// Vite glob import must be at module level
const loaderModules = import.meta.glob("../project/views/*/loader.js");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App
        appCfg={appCfg as AppProps}
        menuCfg={menuCfg as MenuConfig}
        iconsCfg={iconsCfg as IconsConfig}
        loadView={createViewLoader(viewsCfg.active, loaderModules)}
      />
    </BrowserRouter>
  </StrictMode>
);
