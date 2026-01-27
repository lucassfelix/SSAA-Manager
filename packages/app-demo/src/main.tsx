//
// Entry point for this application.
//

// #region --------------------------------------------------------------------------------- Imports

import { BrowserRouter } from "react-router-dom";
import { App, AppProps, MenuConfig, FormDataConfig, getRoot } from "@neofront/core";

// App configuration imports

import appCfg from "project/app.json";
import menuCfg from "project/menu.json";
import loginCfg from "project/login.json";
import viewsCfg from "project/views/views.json";

import metadata from "project/views/metadataloader.js";
import data from "project/views/dataloader.js";

import "./styles/theme.css";
import "./styles/app.css";

// #endregion

// #region ----------------------------------------------------------------------------- Entry point

/** Tabelas a serem carregadas */
const tableNames = [
  'usuarios',
  'permissoes_usuario',
  'empresas',
  'status_empresa',
  'ufs',
  'produtos'
];

(getRoot()).render(
  <BrowserRouter>
    <App
      appCfg={appCfg as AppProps}
      menuCfg={menuCfg as MenuConfig}
      loginCfg={loginCfg as FormDataConfig}
      activeViews={viewsCfg.active}
      metadata={metadata}
      mockData={data}
      apiTableNames={tableNames}
    />
  </BrowserRouter>
);

// #endregion
