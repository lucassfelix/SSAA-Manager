
// Metadata and data loader

import listView from "./listview.json";
import form from "./form.json";

import projetos from "./data.json";
import projetosFields from "./fields.json";
import instituicoes from "../instituicoes/data.json";
import status from "./data_status.json";

export default {
    listView,
    form,
    fieldConfig: {
        projetos: projetosFields
    },
    data: {
        projetos,
        instituicoes,
        status
    },
};
