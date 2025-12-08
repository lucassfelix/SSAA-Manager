//
// Localized default and error strings for the application.
//

// #region --------------------------------------------------------------------------------- Exports

export const defaultStrings = {
  "en-us": {
    no: "No",
    yes: "Yes",
    defaultDateFormat: "MM/DD/YYYY",
    decimalSeparator: ".",
    thousandSeparator: ","
  },
  "pt-br": {
    no: "Não",
    yes: "Sim",
    defaultDateFormat: "DD/MM/YYYY",
    decimalSeparator: ",",
    thousandSeparator: "."
  },
  "es-419": {
    no: "No",
    yes: "Sí",
    defaultDateFormat: "DD/MM/YYYY",
    decimalSeparator: ",",
    thousandSeparator: "."
  }
};

export const errorStrings = {
  "en-us": {
    noRecordsText: "No items to display",
    noViewType: "View type <b>{type}</b> is not supported.",
    viewMissing: "View <b>{view}</b> was not found.",
    formMissing: "Form <b>{type}</b> is not declared for view <b>{view}</b>.",
    formConfigMissing: "No configuration was found for this form.",
    formLayoutMissing: "Form layout is not defined for operation <b>${op}</b>."
  },
  "pt-br": {
    noRecordsText: "Sem itens a exibir",
    noViewType: "O tipo de visualização <b>{type}</b> não é suportado.",
    viewMissing: "A visualização <b>{view}</b> não foi encontrada.",
    formMissing: "O form <b>{type}</b> não foi declarado para a view <b>{view}</b>.",
    formConfigMissing: "Não foi encontrada uma configuração para este form.",
    formLayoutMissing: "O layout do form não foi definido para a operação <b>${op}</b>."
  },
  "es-419": {
    noRecordsText: "Sin elementos para mostrar",
    noViewType: "El tipo de vista <b>{type}</b> no es compatible.",
    viewMissing: "La vista <b>{view}</b> no fue encontrada.",
    formMissing: "El formulario <b>{type}</b> no está declarado para la vista <b>{view}</b>.",
    formConfigMissing: "No se encontró configuración para este formulario.",
    formLayoutMissing: "El diseño del formulario no está definido para la operación <b>${op}</b>."
  }
};

// #endregion
