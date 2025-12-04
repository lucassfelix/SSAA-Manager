
// Metadata and data loader

import fields from "./fields.json";
import listView from "./listview.json";
import form from "./form.json";
import pacientes from "./data.json";
import instituicoes from "../instituicoes/data.json";
import permissoes from "./data_permissoes.json";
import status from "./data_status.json";

export default {
  fields,
  listView,
  form,
  data: {
    pacientes,
    status,
    instituicoes,
    permissoes
  }
};
