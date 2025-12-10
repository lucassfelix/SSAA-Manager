//
// Form configuration types.
//

// #region --------------------------------------------------------------------------------- Imports

import { ListViewProps } from "context";
import { SectionSchema } from "@/form/Section";
import { FieldsConfig } from "./FieldProps";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface RecordConfig {
  title: string;
  toolbar?: string[];
};

export interface FormLayoutProps {
  header?: string[];
  sections: SectionSchema[];
}

/**
 * Form configuration as defined in the JSON files.
 */
export interface FormDataConfig {
  name: string;
  layout: FormLayoutProps;
  edit: RecordConfig;
  add: RecordConfig;
  detail: RecordConfig;
}

/**
 * View result passed to the form via binders, including list view config and data.
 */
export interface ViewResultProps {
  fields: FieldsConfig;
  listView: ListViewProps;
  form: FormDataConfig;
  data: {
    [key: string]: Record<string, any>[];
  };
}

// #endregion
