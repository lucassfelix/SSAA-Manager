
// Carrega metadados e mock data

import list_instituicoes from "./instituicoes/listview.json";
import list_usuarios from "./usuarios/listview.json";
import list_pacientes from "./pacientes/listview.json";
import list_projetos from "./projetos/listview.json";

import form_instituicoes from "./instituicoes/form.json";
import form_usuarios from "./usuarios/form.json";
import form_pacientes from "./pacientes/form.json";
import form_projetos from "./projetos/form.json";

import fields_insituicoes from "./instituicoes/fields.json";
import fields_usuarios from "./usuarios/fields.json";
import fields_pacientes from "./pacientes/fields.json";
import fields_projetos from "./projetos/fields.json";

export default {
  listView: {
    instituicoes: list_instituicoes,
    usuarios: list_usuarios,
    pacientes: list_pacientes,
    projetos: list_projetos
  },
  form: {
    instituicoes: form_instituicoes,
    usuarios: form_usuarios,
    pacientes: form_pacientes,
    projetos: form_projetos
  },
  fieldConfig: {
    instituicoes: fields_insituicoes,
    usuarios: fields_usuarios,
    pacientes: fields_pacientes,
    projetos: fields_projetos,
  }
};
