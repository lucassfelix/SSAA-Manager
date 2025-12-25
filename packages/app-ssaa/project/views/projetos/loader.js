
// Carrega metadados e mock data

import listView from "./listview.json";
import form from "./form.json";

import projetos from "./data.json";
import status from "./data_status.json";
import instituicoes from "../instituicoes/data.json";
import usuarios from "../usuarios/data.json";
import pacientes from "../pacientes/data.json";

import projetosFields from "./fields.json";

// Acrescenta campos adicionais à tabela principal dinamicamente
projetos.forEach(pr => {
  pr.usuario_id = pacientes.find(p => p.id === pr.paciente_id).usuario_id;
  pr.instituicao_id = usuarios.find(u => u.id === pr.usuario_id).instituicao_id;
});

export default {
  listView,
  form,
  fieldConfig: {
    projetos: projetosFields
  },
  data: {
    projetos,
    instituicoes,
    status,
    usuarios,
    pacientes
  },
};
