
// Barrel file to simplify imports for common contexts.

// #region --------------------------------------------------------------------------------- Exports

export { default as AppUIContext, useAppUI, type UserSettings } from "./AppUIContext";
export { defaultStrings, errorStrings } from "./standardStrings";
export type { AppProps, MenuConfig } from "./AppProps";
export type { FormDataConfig, RecordConfig, ViewResultProps, FormLayoutProps } from "./FormProps";
export type { DataColumnProps, DataColumnRenderProps, DataColumnOptions } from "./ListViewProps";  
export type { ListViewProps, DataColumnOptionsRef } from "./ListViewProps";
export type { UnifiedFieldProps, FieldsConfig, FieldOptionsRef, FormFieldProps, SelectFieldOption } from "./FieldProps";

// #endregion
