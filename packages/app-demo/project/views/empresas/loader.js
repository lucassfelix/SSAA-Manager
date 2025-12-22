
// Carrega metadados e mock data

import form from "./form.json";
import listView from "./listview.json";

import empresas from "./data.json";
import empresasFields from "./fields.json";

import status_empresa from "./data_status.json";
import ufs from "../_common/data_br_ufs.json";

export default {
  listView,
  form,
  fieldConfig: {
    empresas: empresasFields
  },
  data: {
    empresas,
    status_empresa,
    ufs
  }
};
