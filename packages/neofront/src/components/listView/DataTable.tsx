//
// Advanced data table component.
//

// #region --------------------------------------------------------------------------------- Imports

import "mantine-datatable/styles.css";

import { JSX, ReactNode } from "react";
import { Link } from "react-router-dom";
import dayjs from 'dayjs';
import { Anchor, Badge, Box, NumberFormatter, Stack, Text } from "@mantine/core";
import type { CSSProperties, MantineTheme } from "@mantine/core";
import { DataTable, DataTableColumn } from "mantine-datatable";

import { AppProps, DataColumnOptions, FormLayoutProps, UnifiedFieldProps } from "context";
import { FieldOptionsRef } from "context";
import { ListViewProps, useAppUI } from "context";
import NfIcon from '@/icon/NfIcon';
import { getValueByPath, replaceMacros, getStyles } from "./datatableUtils";
import { applyMask, MaskSpec } from "@/form/fields/createMask";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface FormatOptions {
  padStart?: number;
}

export interface FilterPanelConfig {
  title?: string;
  toolbar?: string[];
  layout: FormLayoutProps;
}

// #endregion

// #region ------------------------------------------------------------------------------- Functions

function getColumns(appCfg: AppProps, tblCfg: ListViewProps, isDark: boolean,
  records: Record<string, unknown>[], currentView: string,
  data: Record<string, unknown[]>, fields: Record<string, UnifiedFieldProps>): DataTableColumn[] {

  if (!Array.isArray(tblCfg.columns)) {
    console.warn(`NfDataTable: No columns defined for table "${currentView}".`);
    return [];
  }

  const tblAppCfg = appCfg.listViews.table ?? {};
  const tableProps = tblCfg.config as ListViewProps["config"];

  // Resolve options from table reference
  function resolveOptions(optionsRef?: FieldOptionsRef): DataColumnOptions[] | undefined {
    if (!optionsRef) {
      return undefined;
    }

    const tableData = data[optionsRef.table];
    if (!tableData || !Array.isArray(tableData)) {
      console.warn(`Options table "${optionsRef.table}" not found in data.`);
      return undefined;
    }

    return tableData.map((item) => ({
      value: getValueByPath(item as Record<string, unknown>,
        optionsRef.valueAccessor || 'value') as number,
      label: getValueByPath(item as Record<string, unknown>,
        optionsRef.labelAccessor || 'label') as string,
      lightColor: getValueByPath(item as Record<string, unknown>,
        'lightColor') as string | undefined,
      darkColor: getValueByPath(item as Record<string, unknown>,
        'darkColor') as string | undefined,
      className: getValueByPath(item as Record<string, unknown>,
        'className') as string | undefined,
    }));
  }

  // Map column names to field definitions
  return tblCfg.columns.map((colName: string) => {

    const fieldDef = fields[colName];
    if (!fieldDef) {
      console.warn(`Field "${colName}" not found in fields definition for table "${currentView}".`);
      return null;
    }

    const accessor = fieldDef.accessor ?? colName;
    const mask = fieldDef.mask;
    const render = fieldDef.render;
    const styles = Array.isArray(fieldDef.colStyles) ? fieldDef.colStyles :
      (fieldDef.colStyles ? [fieldDef.colStyles] : undefined);
    const options = resolveOptions(fieldDef.options);

    // #region Helpers and renderers

    function getEmphasis(enable?: boolean): ((theme: MantineTheme) => CSSProperties) | undefined {
      return enable ? (theme) => (((theme: MantineTheme) => {
        if (!theme.colors) {
          return {};
        }
        const emphasisCfg = tblAppCfg?.emphasis;
        return {
          color: isDark ? emphasisCfg?.textDark || 'var(--mantine-color-green-3)' :
            emphasisCfg?.textLight || 'var(--mantine-color-green-9)',
          background: isDark ? emphasisCfg?.backgroundDark || undefined :
            emphasisCfg?.backgroundLight || undefined
        };
      })(theme)) : undefined;
    }

    function renderFooter(): ReactNode | undefined {
      if (!tableProps?.footer) {
        return undefined;
      }
      if (fieldDef.footerIcon) {
        return ((name: string): ReactNode => {
          return (
            <Box mb={-4}>
              <NfIcon icon={name} stroke={2} size={22} />
            </Box>
          );
        })(fieldDef.footerIcon);
      }
      if (fieldDef.footer) {
        return replaceMacros(fieldDef.footer, accessor, records);
      }
    }

    function renderSingleCell(value: string | number | ReactNode, cellStyles?: string[],
      cellMask?: MaskSpec, keyPrefix?: string): ReactNode {
      let output = value;
      if (typeof value === 'string' || typeof value === 'number') {
        if (cellMask) {
          output = applyMask(output, cellMask);
        }
        return (
          <Text
            key={(keyPrefix ?? "") + accessor}
            truncate
            {...getStyles(cellStyles)}
          >
            {output}
          </Text>
        );
      } else {
        return output;
      }
    }

    function renderStackedCell(record: Record<string, any>): ReactNode {
      if (!render?.values) {
        return null;
      }
      return (
        <Stack gap={0}>{render.values.map((v) => {
          const valStyles = Array.isArray(v.styles) ? v.styles : (v.styles ? [v.styles] : undefined);
          return renderSingleCell(
            getValueByPath(record, v.accessor) ?? '', valStyles, v.mask, v.accessor
          );
        })}</Stack>
      );
    }

    function renderColorWrapper(value: number): ReactNode {
      const opt = options?.find((opt: DataColumnOptions) => opt.value == value);

      if (!opt) {
        console.warn(`No option found for value "${value}" in column "${colName}".`);
        return `[${value}]`;
      }
      return (
        <Badge
          size={tblAppCfg?.wrappers?.size}
          color={isDark ? opt.darkColor || 'black' : opt.lightColor || 'gray'}
          w={tblAppCfg?.wrappers?.statusWidth}
          className={`nf-${opt.className}`}
        >
          {opt.label}
        </Badge>
      );
    }

    function renderBooleanWrapper(value?: boolean): ReactNode {
      return (
        <Badge
          color={value ? (isDark ? 'green' : 'teal') : (isDark ? 'red' : 'gray')}
          size={tblAppCfg?.wrappers?.size}
          w={tblAppCfg?.wrappers?.booleanWidth}
        >
          {String(value ? appCfg.strings.yes : appCfg.strings.no)}
        </Badge>
      );
    }

    function renderBooleanIcon(value?: boolean): ReactNode {
      const iconCfg = tblAppCfg?.booleanIcons;
      return (
        <Box mb={-4}>
          <NfIcon
            icon={value ? iconCfg?.trueIcon ?? 'check' : iconCfg?.falseIcon ?? 'x'}
            size={iconCfg?.size} stroke={iconCfg?.stroke}
            color={value ? (isDark ? iconCfg?.trueColorDark ?? 'var(--mantine-color-green-4)' :
              iconCfg?.trueColorLight ?? 'var(--mantine-color-teal-6)') :
              (isDark ? iconCfg?.falseColorDark ?? 'var(--mantine-color-red-4)' :
                iconCfg?.falseColorLight ?? 'var(--mantine-color-red-6)')} />
        </Box>
      );
    }

    function renderBooleanValue(value?: boolean): ReactNode {
      return String(value ? appCfg.strings.yes : appCfg.strings.no);
    }

    function renderLinkCell(value: any, record: Record<string, any>): ReactNode {

      if (!tableProps.idAccessor) {
        console.warn("NfDataTable: Identifier field not defined for table " +
          `"${currentView}" (column "${colName}").`);
        return renderSingleCell(value, styles, mask);
      }
      let output = value;
      const idAccessor = tblCfg.config.idAccessor ?? tableProps.idAccessor ?? 'id';
      const idVal = String(getValueByPath(record, idAccessor) ?? '');
      const name = getValueByPath(record, tblCfg.config.nameAccessor);
      if (mask) {
        output = applyMask(output, mask);
      }
      return (
        <Anchor
          key={accessor}
          component={Link}
          to={
            render?.op == 'email' ? `mailto:%22${name}%22%3c${value}%3e` :
              `?v=${currentView}&op=${render?.op}&${idAccessor}=${idVal}`
          }
          {...getStyles(styles)}
        >
          {output}
        </Anchor>
      );
    }

    function renderDateCell(value: string | number): ReactNode {
      if (render?.format === 'relative') {
        return renderSingleCell((dayjs(value)).fromNow(), styles, undefined);
      }
      return renderSingleCell((dayjs(value)).format(String(render?.format ??
        appCfg.strings.defaultDateFormat ?? 'YYYY-MM-DD')), styles, undefined);
    }

    function renderDecimalCell(value: string | number): ReactNode {
      return <NumberFormatter
        value={Number(value)}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        fixedDecimalScale={true}
      />;
    }

    function renderCell(): ((r: Record<string, unknown>) => ReactNode) | undefined {

      return (record: Record<string, any>) => {

        let value = getValueByPath(record, accessor);

        if (render) {
          switch (render.layout) {
            case 'booleanIcon':
              return renderBooleanIcon(value);
            case 'booleanWrapper':
              return renderBooleanWrapper(value);
            case 'booleanValue':
              return renderBooleanValue(value);
            case 'colorWrapper':
              return renderColorWrapper(value);
            case 'stacked':
              return renderStackedCell(record);
            case 'link':
              return renderLinkCell(value, record);
            case 'date':
              return renderDateCell(value);
            case 'decimal':
              return renderDecimalCell(value);
            default:
              console.warn(`Unknown render layout "${render.layout}" in column "${colName}".`);
              break;
          }
        } else if (options && options.length > 0) {
          const opt = options.find((opt: DataColumnOptions) => opt.value == value);
          value = opt?.label ?? `[${value}]`;
        }

        return renderSingleCell(value, styles, mask);
      };
    }

    // #endregion

    return {
      accessor,
      title: fieldDef.colTitle ?? colName,
      width: fieldDef.colWidth ?? undefined,
      textAlign: fieldDef.colTextAlign ?? 'left',
      ellipsis: true,
      titleStyle: getEmphasis(fieldDef.emphasizeColumn),
      cellsStyle: () => getEmphasis(fieldDef.emphasizeColumn),
      footerStyle: getEmphasis(fieldDef.emphasizeColumn),
      render: renderCell(),
      footer: renderFooter(),
    } as DataTableColumn;
  }).filter((col) => col !== null);
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfDataTable(): JSX.Element {

  // #region Hooks and context

  const { userSettings, appCfg, viewResult, currentView } = useAppUI();

  const tblAppCfg = appCfg.listViews.table ?? {};
  const isDark = userSettings.dark;
  const table = (viewResult.listView as ListViewProps) ?? ({} as ListViewProps);
  const tableCfg = (table.config as ListViewProps["config"]) ?? {};
  const fields = viewResult.fields?.fields ?? {};

  // #endregion

  return (
    <DataTable

      // Invariant properties
      highlightOnHover={true}
      verticalAlign="center"
      height="100%"

      // Global dynamic properties
      striped={tblAppCfg.striped!}
      withTableBorder={tblAppCfg.bordered!}
      withRowBorders={tblAppCfg.rowBorders!}
      withColumnBorders={tblAppCfg.colBorders!}
      borderRadius={tblAppCfg.borderRadius ?? 'sm'}
      horizontalSpacing={tblAppCfg.horizontalSpacing ?? 'xs'}
      verticalSpacing={tblAppCfg.verticalSpacing ?? 'xs'}
      shadow={tblAppCfg.shadow ?? "none"}

      // Row class names based on rules

      rowClassName={row => {
        if (!tableCfg.rowClassAccessor) {
          return '';
        }
        const rc = getValueByPath(row, tableCfg.rowClassAccessor) ?? '';
        return `${currentView}-${rc}`;
      }}

      // Dynamic properties per table

      noHeader={!tableCfg.header}
      columns={getColumns(appCfg, table, isDark, viewResult.data[currentView] ?? [],
        currentView, viewResult.data, fields)}
      records={(viewResult?.data[currentView] ?? [])}
    />
  );

}

// #endregion
