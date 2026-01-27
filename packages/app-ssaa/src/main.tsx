//
// Entry point for this application.
//

// #region --------------------------------------------------------------------------------- Imports

import { BrowserRouter } from "react-router-dom";
import { App, AppProps, createViewLoader, MenuConfig, FormDataConfig, getRoot } from "@neofront/core";

// App configuration imports

import appCfg from "project/app.json";
import menuCfg from "project/menu.json";
import loginCfg from "project/login.json";
import viewsCfg from "project/views/views.json";
import permissionsCfg from "project/permissions.json";

import metadata from "project/views/metadataloader.js";
import data from "project/views/dataloader.js";
import createApiDataLoader from "./data/apiDataLoader";

import "./styles/theme.css";
import "./styles/app.css";

// #endregion

// #region ----------------------------------------------------------------------------- Entry point

(getRoot()).render(
  <BrowserRouter>
    <App
      appCfg={appCfg as AppProps}
      menuCfg={menuCfg as MenuConfig}
      loginCfg={loginCfg as FormDataConfig}
      loadView={(viewName: string) =>
        createViewLoader(
          viewsCfg.active,
          viewName,
          metadata,
          appCfg.data?.source === "api" ? createApiDataLoader(appCfg.data.apiBaseUrl) : data,
          permissionsCfg
        )}
    />
  </BrowserRouter>
);

// #endregion
