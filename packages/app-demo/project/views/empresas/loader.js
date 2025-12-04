
// Metadata and data loader

import fields from "./fields.json";
import listView from "./listview.json";
import form from "./form.json";
import empresas from "./data.json";
import status_empresa from "./data_status.json";
import ufs from "../common/data_br_ufs.json";

export default {
  fields,
  listView,
  form,
  data: {
    empresas,
    status_empresa,
    ufs
  }
};
