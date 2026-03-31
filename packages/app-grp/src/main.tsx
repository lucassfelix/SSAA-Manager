//
// Ponto de entrada da aplicação GRP.
//

// #region --------------------------------------------------------------------------------- Imports

import { BrowserRouter } from "react-router-dom";
import { App, getRoot } from "@neofront/core";

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

const tableNames = [
  "contratos",
  "situacoes_contrato",
  "diarias",
  "imoveis",
  "assinaturas",
  "processos",
  "contratados",
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
