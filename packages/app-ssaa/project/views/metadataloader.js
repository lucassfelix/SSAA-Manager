
// Carrega os metadados

import list_clinicas from "./clinicas/listview.json";
import list_usuarios from "./usuarios/listview.json";
import list_pacientes from "./pacientes/listview.json";
import list_projetos from "./projetos/listview.json";

import form_clinicas from "./clinicas/form.json";
import form_usuarios from "./usuarios/form.json";
import form_pacientes from "./pacientes/form.json";
import form_projetos from "./projetos/form.json";

import fields_clinicas from "./clinicas/fields.json";
import fields_usuarios from "./usuarios/fields.json";
import fields_pacientes from "./pacientes/fields.json";
import fields_projetos from "./projetos/fields.json";

export default {
  listView: {
    clinicas: list_clinicas,
    usuarios: list_usuarios,
    pacientes: list_pacientes,
    projetos: list_projetos
  },
  form: {
    clinicas: form_clinicas,
    usuarios: form_usuarios,
    pacientes: form_pacientes,
    projetos: form_projetos
  },
  fieldConfig: {
    clinicas: fields_clinicas,
    usuarios: fields_usuarios,
    pacientes: fields_pacientes,
    projetos: fields_projetos,
  }
};
