
// Carrega metadados e mock data

import listView from "./listview.json";
import form from "./form.json";

import instituicoes from "./data.json";
import status from "./data_status.json";
import usuarios from "../usuarios/data.json";
import pacientes from "../pacientes/data.json";

import instituicoesFields from "./fields.json";
import usuariosFields from "../usuarios/fields.json";
import pacientesFields from "../pacientes/fields.json";
import projetosFields from "../projetos/fields.json";

// Acrescenta os registros-filhos à tabela principal dinamicamente
instituicoes.forEach(i => {
  i.usuarios = usuarios.filter(u => u.instituicao_id === i.id);
  i.usuarios.forEach(u => {
    i.pacientes = (i.pacientes || []).concat(pacientes.filter(p => p.usuario_id === u.id));
  });
});

export default {
  listView,
  form,
  fieldConfig: {
    instituicoes: instituicoesFields,
    usuarios: usuariosFields,
    pacientes: pacientesFields,
    projetos: projetosFields,
  },
  data: {
    instituicoes,
    status
  },
};
