//
// Auxiliary functions for getting values and replacing macros in data tables
//

// #region --------------------------------------------------------------------------------- Imports

import { uniqBy } from "mantine-datatable";
import { FormatOptions } from "./DataTable";

// #endregion

// #region ------------------------------------------------------------------------------- Functions

/**
 * Formats a value according to the specified format options.
 */
export function formatValue(value: number | string, fmt?: FormatOptions, defValue = "[err]"): any {
  if (fmt?.padStart) {
    return String(value).padStart(fmt?.padStart, '0') || defValue;
  }
  return value;
}

/**
 * Gets the styles for a given set of style names.
 */
export function getStyles(styles?: string | string[]): object {

  if (!styles) {
    return {};
  }

  // Styles mapping for data table cells.
  // Values can be either objects { key: value } or simple strings when key === value.
  const presetStyles = [
    {
      prop: 'fw',
      values: [
        { light: 300 },
        { normal: 400 },
        { semibold: 500 },
        { bold: 700 },
      ]
    },
    {
      prop: 'fs',
      values: ['italic']
    },
    {
      prop: 'fz',
      values: ['xs', 'sm', 'md', 'lg', 'xl',
        { smallest: 'xs' }, { largest: 'xl' },
        'smaller', 'small', 'large', 'larger'
      ]
    },
    {
      prop: 'style',
      values: [
        { tabular: { fontVariantNumeric: 'tabular-nums' } }
      ]
    }
  ] as const;

  const s = Array.isArray(styles) ? styles : [styles];
  return presetStyles.reduce((acc, { prop, values }) => {
    const match = values.find(v => {
      if (typeof v === 'string') {
        return s.includes(v);
      }
      const key = Object.keys(v)[0];
      return s.includes(key);
    });
    if (match) {
      if (typeof match === 'string') {
        (acc as Record<string, any>)[prop] = match;
      } else {
        (acc as Record<string, any>)[prop] = Object.values(match)[0];
      }
    }
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Gets a field value from a record using accessor which may be a simple name or a dot-path.
 * @param record  The record object from which to retrieve the value.
 * @param accessor The accessor string, which can be a simple field name or a dot-separated path.
 * @param processUndefined Create unique string for undefined values and emit a warning.
 * @returns The value retrieved from the record at the specified accessor path.
 */
export function getValueByPath(record: any, accessor?: string, processUndefined?: boolean): any {
  if (!record || !accessor) {
    return undefined;
  }
  return ((obj: any, path?: string): any => {
    const nestedValue = path?.split('.').reduce((acc, key) => acc?.[key], obj);
    if (processUndefined && (nestedValue === undefined)) {
      const randomString = Math.random().toString(36).substring(2, 15);
      console.warn(`getValueByPath: nested value is undefined for accessor "${accessor}".`);
      return randomString;
    }
    return nestedValue;
  })(record, accessor);
}

/**
 * Formats strings by replacing macros in the input with values from the records.
 */
export function replaceMacros(input: string, accessor: string, records: Record<string, unknown>[]): string {

  const nonEmptyRecords = (records ?? []).filter(record => {
    const value = getValueByPath(record, accessor);
    return value !== null && value !== undefined && value !== '';
  });

  // #region Auxiliary functions

  function formatLocalizedValue(value: number) {
    const htmlLang = document.documentElement.lang || 'en-US';
    return Intl.NumberFormat(htmlLang,
      { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .format(value);
  }

  function getSum(record: Record<string, unknown>, acc: number) {
    const value = getValueByPath(record, accessor);
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    return acc + (isNaN(numValue) ? 0 : numValue);
  }

  // #endregion

  return input
    .replace("{count}", String(nonEmptyRecords.length))
    .replace("{unique}", String(uniqBy(nonEmptyRecords, record =>
      getValueByPath(record, accessor)).length))
    .replace("{sum}", formatLocalizedValue(nonEmptyRecords.reduce((acc, record) =>
      getSum(record, acc), 0)))
    .replace("{avg}", formatLocalizedValue(nonEmptyRecords.length > 0 ?
      nonEmptyRecords.reduce((acc, record) => getSum(record, acc), 0) /
      nonEmptyRecords.length : 0))
    ;
}

// #endregion
