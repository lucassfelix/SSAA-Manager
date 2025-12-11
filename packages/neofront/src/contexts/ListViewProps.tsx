//
// Renders a form with a header and columns.
//

// #region --------------------------------------------------------------------------------- Imports

import { FilterPanelConfig, FormatOptions } from "@/listView/DataTable";
import { MaskSpec } from "@/form/fields/createMask";
import { ToolbarItem } from "@/toolbar/Toolbar";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

type RenderTypes = 'colorWrapper' | 'booleanValue' | 'booleanWrapper' | 'booleanIcon'
  | 'stacked' | 'link' | 'date' | 'decimal';

export interface DataColumnRenderProps {
  accessor?: string;
  truncateText?: boolean;
  styles?: string | string[];
  mask?: MaskSpec;
}

export interface DataColumnOptions {
  value: number;
  label: string;
  lightColor?: string;
  darkColor?: string;
  className?: string;
}

export interface DataColumnOptionsRef {
  table: string;
  valueAccessor: string;
  labelAccessor: string;
}

export interface DataColumnProps extends DataColumnRenderProps {
  title?: string;
  visible?: boolean;
  width?: number;
  textAlign?: 'left' | 'center' | 'right';
  emphasizeColumn?: boolean;
  footer?: string;
  footerIcon?: string;
  format?: FormatOptions;
  mask?: MaskSpec;
  render?: {
    layout?: RenderTypes;
    format?: string;
    values?: DataColumnRenderProps[];
    op?: string;
  };
  options?: DataColumnOptions[] | DataColumnOptionsRef;
};

/**
 * Data table configuration as defined in the JSON files.
 */
export interface ListViewProps {
  type: "listView";
  name: string;
  config: {
    header?: boolean;
    footer?: boolean;
    idAccessor?: string;
    nameAccessor?: string;
    rowClassAccessor?: string;
  };
  strings: {
    [key: string]: string;
  };
  columns: string[];
  actions: string[];
  toolbar?: ToolbarItem[];
  filterPanel?: FilterPanelConfig;
}

// #endregion
