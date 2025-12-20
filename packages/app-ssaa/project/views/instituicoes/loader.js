
// Metadata and data loader

import listView from "./listview.json";
import form from "./form.json";

import instituicoes from "./data.json";
import instituicoesFields from "./fields.json";
import usuarios from "../usuarios/data.json";
import usuariosFields from "../usuarios/fields.json";
import status from "../usuarios/data_status.json";

// Acrescenta os usuários que pertencem a cada instituição
instituicoes.forEach(i => {
  i.usuarios = usuarios.filter(u => u.instituicao_id === i.id);
});

export default {
  listView,
  form,
  fieldConfig: {
    instituicoes: instituicoesFields,
    usuarios: usuariosFields
  },
  data: {
    instituicoes,
    status
  },
};
