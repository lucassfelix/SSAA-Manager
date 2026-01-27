//
// Ponto de entrada da aplicação SSAA.
//

// #region --------------------------------------------------------------------------------- Imports

import { BrowserRouter } from "react-router-dom";
import { App, AppProps, MenuConfig, FormDataConfig, getRoot } from "@neofront/core";

// App configuration imports

import appCfg from "project/app.json";
import menuCfg from "project/menu.json";
import loginCfg from "project/login.json";
import viewsCfg from "project/views/views.json";
import permissionsCfg from "project/permissions.json";

import metadata from "project/views/metadataloader.js";
import data from "project/views/dataloader.js";

import "./styles/theme.css";
import "./styles/app.css";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

type Id = string | number;

type TableRow = Record<string, unknown> & {
  id?: Id;
  paciente_id?: Id;
  usuario_id?: Id;
  clinica_id?: Id;
  projetos?: TableRow[];
  usuarios?: TableRow[];
  pacientes?: TableRow[];
};

type DataPayload = {
  clinicas: TableRow[];
  status_clinicas: TableRow[];
  usuarios: TableRow[];
  status_usuario: TableRow[];
  permissoes_usuario: TableRow[];
  pacientes: TableRow[];
  status_paciente: TableRow[];
  projetos: TableRow[];
  status_projeto: TableRow[];
} & Record<string, TableRow[]>;

// #endregion

// #region ------------------------------------------------------------------------------- Functions

/**
 * Acrescenta dinamicamente registros-filhos e campos adicionais às tabelas.
 * Este método poderá ser substituído por queries de backend na implementação.
 * @param data Os dados brutos carregados.
 * @returns Os dados enriquecidos com campos auxiliares.
 */
function enhanceData(data: DataPayload): DataPayload {
  const clinicas = data.clinicas;
  const status_clinicas = data.status_clinicas;

  const usuarios = data.usuarios;
  const status_usuario = data.status_usuario;
  const permissoes_usuario = data.permissoes_usuario;

  const pacientes = data.pacientes;
  const status_paciente = data.status_paciente;

  const projetos = data.projetos;
  const status_projeto = data.status_projeto;

  projetos.forEach(pr => {
    pr.usuario_id = pacientes.find(p => p.id === pr.paciente_id)?.usuario_id;
    pr.clinica_id = usuarios.find(u => u.id === pr.usuario_id)?.clinica_id;
  });

  pacientes.forEach(p => {
    p.projetos = projetos.filter(pr => pr.paciente_id === p.id);
    p.clinica_id = usuarios.find(u => u.id === p.usuario_id)?.clinica_id;
  });

  usuarios.forEach(u => {
    u.pacientes = pacientes.filter(p => p.usuario_id === u.id);
    u.projetos = projetos.filter(i => i.usuario_id === u.id);
  });

  clinicas.forEach(i => {
    i.usuarios = usuarios.filter(u => u.clinica_id === i.id);
    i.pacientes = [];
    i.usuarios.forEach(u => {
      i.pacientes = (i.pacientes || []).concat(pacientes.filter(p => p.usuario_id === u.id));
    });
  });

  return {
    clinicas,
    status_clinicas,

    usuarios,
    status_usuario,
    permissoes_usuario,

    pacientes,
    status_paciente,

    projetos,
    status_projeto,
  };
}

// #endregion

// #region ----------------------------------------------------------------------------- Entry point

/** Tabelas a serem carregadas */
const tableNames = [
  'clinicas',
  'status_clinicas',
  'usuarios',
  'status_usuario',
  'permissoes_usuario',
  'pacientes',
  'status_paciente',
  'projetos',
  'status_projeto'
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
      dataEnhancer={enhanceData}
      permissionsCfg={permissionsCfg}
    />
  </BrowserRouter>
);

// #endregion
