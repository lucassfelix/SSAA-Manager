
// Metadata and data loader

import listView from "./listview.json";
import form from "./form.json";

import pacientes from "./data.json";
import pacientesFields from "./fields.json";
import instituicoes from "../instituicoes/data.json";
import permissoes from "./data_permissoes.json";
import status from "./data_status.json";

export default {
  listView,
  form,
  fieldConfig: {
    pacientes: pacientesFields
  },
  data: {
    pacientes,
    status,
    instituicoes,
    permissoes
  },
};
