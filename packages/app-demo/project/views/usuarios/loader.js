
// Carrega metadados e mock data

import listView from "./listview.json";
import form from "./form.json";

import usuarios from "./data.json";
import usuariosFields from "./fields.json";

import empresas from "../empresas/data.json";
import permissoes from "./data_permissoes.json";

export default {
  listView,
  form,
  fieldConfig: {
    usuarios: usuariosFields,
  },
  data: {
    usuarios,
    empresas,
    permissoes
  }
};
