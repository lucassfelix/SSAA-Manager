
// Metadata and data loader

import fields from "./fields.json";
import listView from "./listview.json";
import form from "./form.json";
import projetos from "./data.json";
import instituicoes from "../instituicoes/data.json";
import status from "./data_status.json";

export default {
    fields,
    listView,
    form,
    data: {
        projetos,
        instituicoes,
        status
    }
};
