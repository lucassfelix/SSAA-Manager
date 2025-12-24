//
// Form configuration types.
//

// #region --------------------------------------------------------------------------------- Imports

import { ListViewProps } from "context";
import { SectionSchema } from "@/form/Section";
import { FieldsConfig } from "./FieldProps";
import { TabSchema } from "@/form/TabbedLayout";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface RecordConfig {
  title: string;
  toolbar?: string[];
};

export interface FormLayoutSchema {
  header?: string[];
  sections: SectionSchema[];
  tabs?: TabSchema[];
}

/**
 * Form configuration as defined in the JSON files.
 */
export interface FormDataConfig {
  name: string;
  options?: {
    fullHeight?: boolean;
    width?: string | number;
  };
  layout: FormLayoutSchema;
  edit?: RecordConfig;
  add?: RecordConfig;
  detail?: RecordConfig;
}

/**
 * View result passed to the form via binders, including list view config and data.
 */
export interface ViewResultProps {
  listView: ListViewProps;
  form: FormDataConfig;
  fieldConfig: {
    [key: string]: FieldsConfig;
  };
  data: {
    [key: string]: Record<string, any>[];
  };
}

// #endregion
