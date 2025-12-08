//
// Unified field properties for both listview columns and form fields.
//

import { MantineSize } from "@mantine/core";
import { MaskSpec } from "@/form/fields/createMask";

// #region ----------------------------------------------------------------------------------- Types

type FieldDataType = "string" | "integer" | "decimal" | "boolean" | "select" | "image" | "date";

type HorizAlignmentType = "left" | "center" | "right";

type RenderLayout = 'colorWrapper' | 'booleanValue' | 'booleanWrapper' | 'booleanIcon'
  | 'stacked' | 'link' | 'date' | 'decimal';

type colStyles = 'light' | 'normal' | 'semibold' | 'bold' | 'italic' | 'xs' | 'sm' | 'md' | 'lg' |
  'xl' | 'smallest' | 'largest' | 'smaller' | 'small' | 'large' | 'larger';

  interface FieldRenderValue {
  accessor?: string;
  styles?: string | string[];
  mask?: MaskSpec;
}

interface FieldRender {
  layout: RenderLayout;
  format?: string;
  op?: string;
  values?: FieldRenderValue[];
}

export interface SelectFieldOption {
  value: any;
  label?: string;
};

export interface FieldOptionsRef {
  table: string;
  valueAccessor?: string;
  labelAccessor?: string;
}

/**
 * Unified config field definition from fields.json, used in both listviews and forms.
 */
export interface UnifiedFieldProps {

  // Common properties

  dataType: FieldDataType;
  accessor?: string;
  options?: FieldOptionsRef;
  mask?: MaskSpec;

  // Column-specific

  colStyles?: colStyles | colStyles[];
  colTextAlign?: HorizAlignmentType;
  colTitle?: string;
  colWidth?: number | string;
  emphasizeColumn?: boolean;
  footer?: string;
  footerIcon?: string;
  render?: FieldRender;
  wrapperWidth?: number;

  // Form-specific

  defaultValue?: any;
  enabled?: boolean;
  fieldWidth?: number | string;
  filterWidth?: number | string;
  filterPlaceholder?: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
}

/**
 * Runtime props passed to form field components (resolved from UnifiedFieldProps).
 */
export interface FormFieldProps {
  name: string;
  dataType: FieldDataType;
  enabled?: boolean;
  initialValue?: any;
  label?: string;
  mask?: MaskSpec;
  options?: SelectFieldOption[];
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  size?: MantineSize;
  width?: string | number;
}

/**
 * Fields configuration file structure.
 */
export interface FieldsConfig {
  name: string;
  language?: string;
  fields: Record<string, UnifiedFieldProps>;
}

// #endregion