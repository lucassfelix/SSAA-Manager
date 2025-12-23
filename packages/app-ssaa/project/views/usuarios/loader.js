
// Carrega metadados e mock data

import listView from "./listview.json";
import form from "./form.json";

import usuarios from "./data.json";
import usuariosFields from "./fields.json";

import status from "./data_status.json";
import instituicoes from "../instituicoes/data.json";
import permissoes from "./data_permissoes.json";
import pacientes from "../pacientes/data.json";
import pacientesFields from "../pacientes/fields.json";
import projetos from "../projetos/data.json";
import projetosFields from "../projetos/fields.json";

// Acrescenta os registros-filhos à tabela principal
usuarios.forEach(u => {
  u.pacientes = pacientes.filter(p => p.usuario_id === u.id);
  u.projetos = projetos.filter(i => i.usuario_id === u.id);
});

export default {
  listView,
  form,
  fieldConfig: {
    usuarios: usuariosFields,
    pacientes: pacientesFields,
    projetos: projetosFields,
  },
  data: {
    usuarios,
    instituicoes,
    permissoes,
    status
  },
};
