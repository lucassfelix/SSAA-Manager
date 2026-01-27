//
// Ponto de entrada desta aplicação.
//

// #region --------------------------------------------------------------------------------- Imports

import { BrowserRouter } from "react-router-dom";
import { App, getRoot } from "@neofront/core";

// Configurações da aplicação

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

getRoot().render(
  <BrowserRouter>
    <App
      appCfg={appCfg}
      menuCfg={menuCfg}
      loginCfg={loginCfg}
      activeViews={viewsCfg.active}
      metadata={metadata}
      mockData={data}
      apiTableNames={tableNames}
    />
  </BrowserRouter>
);

// #endregion
