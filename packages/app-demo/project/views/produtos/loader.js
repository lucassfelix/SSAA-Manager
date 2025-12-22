
// Carrega metadados e mock data

import listView from "./listview.json";
import form from "./form.json";

import produtos from "./data.json";
import produtosFields from "./fields.json";

export default {
  listView,
  form,
  fieldConfig: {
    produtos: produtosFields
  },
  data: {
    produtos
  }
};
