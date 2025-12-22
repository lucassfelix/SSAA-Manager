
// Carrega metadados e mock data

import listView from "./listview.json";
import form from "./form.json";

import instituicoes from "./data.json";
import instituicoesFields from "./fields.json";

import status from "../usuarios/data_status.json";
import usuarios from "../usuarios/data.json";
import usuariosFields from "../usuarios/fields.json";
import pacientes from "../pacientes/data.json";
import pacientesFields from "../pacientes/fields.json";
import projetos from "../projetos/data.json";
import projetosFields from "../projetos/fields.json";

// Acrescenta os registros-filhos à tabela principal
instituicoes.forEach(i => {
  i.usuarios = usuarios.filter(u => u.instituicao_id === i.id);
  i.pacientes = pacientes.filter(p => p.instituicao_id === i.id);
  i.projetos = projetos.filter(pr => pr.instituicao_id === i.id);
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
