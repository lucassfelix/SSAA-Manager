
// Carrega metadados e mock data

import listView from "./listview.json";
import form from "./form.json";

import pacientes from "./data.json";
import pacientesFields from "./fields.json";

import instituicoes from "../instituicoes/data.json";
import permissoes from "./data_permissoes.json";
import status from "./data_status.json";
import usuarios from "../usuarios/data.json";
import projetos from "../projetos/data.json";
import projetosFields from "../projetos/fields.json";

// Acrescenta os registros-filhos à tabela principal dinamicamente
pacientes.forEach(p => {
  p.projetos = projetos.filter(pr => pr.paciente_id === p.id);
  p.instituicao_id = usuarios.find(u => u.id === p.usuario_id).instituicao_id;
});
projetos.forEach(pr => {
  pr.usuario_id = pacientes.find(p => p.id === pr.paciente_id).usuario_id;
  pr.instituicao_id = usuarios.find(u => u.id === pr.usuario_id).instituicao_id;
});

export default {
  listView,
  form,
  fieldConfig: {
    pacientes: pacientesFields,
    projetos: projetosFields,
  },
  data: {
    pacientes,
    status,
    usuarios,
    instituicoes,
    permissoes
  },
};
