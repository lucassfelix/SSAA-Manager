
// Metadata and data loader

import fields from "./fields.json";
import listView from "./listview.json";
import form from "./form.json";
import usuarios from "./data.json";
import empresas from "../empresas/data.json";
import permissoes from "./data_permissoes.json";

export default {
  fields,
  listView,
  form,
  data: {
    usuarios,
    empresas,
    permissoes
  }
};
