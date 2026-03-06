//
// Ponto de entrada da aplicação SSAA.
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
import { accessResolver } from "./policy";

import "./styles/theme.css";
import "./styles/app.css";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

type Id = string | number;

type TableRow = Record<string, unknown> & {
  id?: Id;
  paciente_id?: Id;
  clinica_id?: Id;
  projetos?: TableRow[];
  usuarios?: TableRow[];
  pacientes?: TableRow[];
};

type DataPayload = {
  clinicas: TableRow[];
  usuarios: TableRow[];
  status_usuario: TableRow[];
  pacientes: TableRow[];
  projetos: TableRow[];
} & Record<string, TableRow[]>;

// #endregion

// #region ------------------------------------------------------------------------------- Functions

/**
 * Acrescenta dinamicamente registros-filhos e campos adicionais às tabelas.
 * Este método deverá ser substituído por queries de backend na implementação.
 * @param data Os dados brutos carregados.
 * @returns Os dados enriquecidos com campos auxiliares.
 */
function enhanceData(data: DataPayload): DataPayload {
  const clinicas = data.clinicas;
  const usuarios = data.usuarios;
  const status_usuario = data.status_usuario;
  const pacientes = data.pacientes;
  const projetos = data.projetos;

  pacientes.forEach(p => {
    p.projetos = projetos.filter(pr => pr.paciente_id === p.id);
  });

  usuarios.forEach(u => {
    u.pacientes = pacientes.filter(p => p.clinica_id != null && p.clinica_id === u.clinica_id);
    u.projetos = projetos.filter(pr => pr.clinica_id != null && pr.clinica_id === u.clinica_id);
  });

  clinicas.forEach(i => {
    i.usuarios = usuarios.filter(u => u.clinica_id === i.id);
    i.pacientes = pacientes.filter(p => p.clinica_id === i.id);
  });

  return {
    clinicas,
    usuarios,
    status_usuario,
    pacientes,
    projetos,
  };
}

// #endregion

// #region ----------------------------------------------------------------------------- Entry point

/** Tabelas a serem carregadas */
const tableNames = [
  'clinicas',
  'usuarios',
  'status_usuario',
  'pacientes',
  'projetos',
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
      dataEnhancer={enhanceData}
      accessResolver={accessResolver}
    />
  </BrowserRouter>
);

// #endregion
