
// Carrega metadados e mock data

import listView from "./listview.json";
import form from "./form.json";

import usuarios from "./data.json";
import usuariosFields from "./fields.json";

import instituicoes from "../instituicoes/data.json";
import permissoes from "./data_permissoes.json";
import status from "./data_status.json";

export default {
  listView,
  form,
  fieldConfig: {
    usuarios: usuariosFields
  },
  data: {
    usuarios,
    instituicoes,
    permissoes,
    status
  },
};
