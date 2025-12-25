
// Carrega metadados e mock data

import list_usuarios from "./usuarios/listview.json";
import list_empresas from "./empresas/listview.json";
import list_produtos from "./produtos/listview.json";

import form_usuarios from "./usuarios/form.json";
import form_empresas from "./empresas/form.json";
import form_produtos from "./produtos/form.json";

import fields_usuarios from "./usuarios/fields.json";
import fields_empresas from "./empresas/fields.json";
import fields_produtos from "./produtos/fields.json";

export default {
  listView: {
    usuarios: list_usuarios,
    empresas: list_empresas,
    produtos: list_produtos
  },
  form: {
    usuarios: form_usuarios,
    empresas: form_empresas,
    produtos: form_produtos
  },
  fieldConfig: {
    usuarios: fields_usuarios,
    empresas: fields_empresas,
    produtos: fields_produtos,
  }
};