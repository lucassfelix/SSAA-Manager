//
// Advanced data table component.
//

// #region --------------------------------------------------------------------------------- Imports

import "mantine-datatable/styles.css";

import { JSX, ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import { Anchor, Badge, Box, Image, NumberFormatter, Stack, Text } from "@mantine/core";
import { DataTable, DataTableColumn } from "mantine-datatable";

import { AppProps, DataColumnOptions, FormLayoutSchema, UnifiedFieldProps } from "context";
import { FieldOptionsRef } from "context";
import { ListViewProps, useAppUI } from "context";
import NfIcon from '@/icon/NfIcon';
import { getValueByPath, replaceMacros, getStyles } from "./datatableUtils";
import { applyMask, MaskSpec } from "@/form/fields/createMask";
import NfToolbar from "@/toolbar/Toolbar";
import MessageBox from "@/messageBox/MessageBox";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface FormatOptions {
  padStart?: number;
}

export interface FilterPanelConfig {
  title?: string;
  toolbar?: string[];
  layout: FormLayoutSchema;
}

interface NfDataTableProps {
  viewSchema: ListViewProps;
  records: Record<string, any>[];
}

// #endregion

// #region ------------------------------------------------------------------------------- Functions

function getColumns(
  appCfg: AppProps,
  tblCfg: ListViewProps,
  isDark: boolean,
  records: Record<string, unknown>[],
  currentView: string,
  data: Record<string, unknown[]>,
  fields: Record<string, UnifiedFieldProps>,
  onRequestDelete: (record: Record<string, any>) => void,
): DataTableColumn[] {

  if (!Array.isArray(tblCfg.columns)) {
    console.warn(`DataTable: No columns defined for table "${currentView}".`);
    return [];
  }

  const tblAppCfg = appCfg.listViews.table ?? {};
  const tableProps = tblCfg.config as ListViewProps["config"];
  const navigate = useNavigate();
  // Resolve options from table reference
  function resolveOptions(optionsRef?: FieldOptionsRef): DataColumnOptions[] | undefined {
    if (!optionsRef) {
      return undefined;
    }

    const tableData = data[optionsRef.table];
    if (!tableData || !Array.isArray(tableData)) {
      console.warn(`DataTable: Options table "${optionsRef.table}" not found in data.`);
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

    const fieldDef = fields?.[colName];
    if (!fieldDef) {
      console.warn(`DataTable: Field "${colName}" not found in fields definition for table "${currentView}".`);
      return null;
    }

    const accessor = fieldDef.accessor ?? colName;
    const mask = fieldDef.mask;
    const render = fieldDef.render;
    const styles = Array.isArray(fieldDef.colStyles) ? fieldDef.colStyles :
      (fieldDef.colStyles ? [fieldDef.colStyles] : undefined);
    const options = resolveOptions(fieldDef.options);

    // #region Renderers

    function renderFooter(): ReactNode | undefined {
      if (!tableProps?.footer) {
        return undefined;
      }
      if (fieldDef.footerIcon) {
        return ((name: string): ReactNode => {
          return (
            <Box mb={-4}>
              <NfIcon icon={name}
                size={tblAppCfg.footerIconsSize}
                stroke={tblAppCfg.footerIconsStroke}
              />
            </Box>
          );
        })(fieldDef.footerIcon);
      }
      if (fieldDef.footer !== null && fieldDef.footer !== undefined) {
        return replaceMacros(fieldDef.footer, accessor, records);
      }
      return '';
    }

    function renderHeader(): ReactNode | undefined {
      if (tableProps.header === false) {
        return undefined;
      }
      if (fieldDef.headerIcon) {
        return ((name: string): ReactNode => {
          return (
            <Box mb={-4}>
              <NfIcon icon={name}
                size={tblAppCfg.headerIconsSize}
                stroke={tblAppCfg.headerIconsStroke}
              />
            </Box>
          );
        })(fieldDef.headerIcon);
      }
      if (fieldDef.header !== null && fieldDef.header !== undefined) {
        return replaceMacros(fieldDef.header, accessor, records);
      }
      return '';
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
        return String(output);
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
        return `[${value}]`;
      }
      return (
        <Badge
          size={tblAppCfg?.wrapperSize}
          color={isDark ? opt.darkColor || 'black' : opt.lightColor || 'gray'}
          w={fieldDef.wrapperWidth}
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
          size={tblAppCfg?.wrapperSize}
          w={tblAppCfg?.wrapperBooleanWidth}
        >
          {String(value ? appCfg.strings.yes : appCfg.strings.no)}
        </Badge>
      );
    }

    function renderBooleanIcon(value?: boolean): ReactNode {
      return (
        <Box mt={-2} mb={-7} className={`nf-boolean-icon nf-boolean-${value ? 'true' : 'false'}`}>
          <NfIcon
            icon={value ? tblAppCfg.trueIcon ?? 'check' : tblAppCfg.falseIcon ?? 'x'}
            size={tblAppCfg.booleanIconsSize}
            stroke={tblAppCfg.booleanIconsStroke}
          />
        </Box>
      );
    }

    function renderImage(value: string): ReactNode {
      return (
        <Image
          radius={tblAppCfg.imageRadius || 'sm'}
          src={value}
        />
      );
    }

    function renderBooleanValue(value?: boolean): ReactNode {
      return String(value ? appCfg.strings.yes : appCfg.strings.no);
    }

    function renderLinkCell(value: any, record: Record<string, any>): ReactNode {

      if (!tableProps.idAccessor) {
        console.warn("DataTable: Identifier field not defined for table " +
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
      return (
        <NumberFormatter
          value={Number(value)}
          thousandSeparator={appCfg.strings.thousandSeparator || ","}
          decimalSeparator={appCfg.strings.decimalSeparator || "."}
          decimalScale={2}
          fixedDecimalScale={true}
        />
      );
    }

    function renderActionsCell(record: Record<string, any>): ReactNode {

      const idAccessor = tblCfg.config.idAccessor ?? tableProps.idAccessor ?? 'id';
      const idVal = String(getValueByPath(record, idAccessor) ?? '');

      function handleAction(action: string): void | JSX.Element {
        switch (action) {
          case 'edit':
            navigate(`?v=${currentView}&op=edit&${idAccessor}=${idVal}`);
            break;
          case 'detail':
            navigate(`?v=${currentView}&op=detail&${idAccessor}=${idVal}`);
            break;
          case 'delete':
            onRequestDelete(record);
            break;
          default:
            console.log(`DataTable: Action "${action}" clicked for record ID ${idVal}.`);
            break;
        }
      }

      return <NfToolbar
        className="nf-actions-toolbar"
        items={tblCfg.actions}
        cfg={{ ...appCfg.toolbars, ...appCfg.listViews.actionToolbar }}
        onAction={handleAction}
      />;
    }

    function renderCell(): ((r: Record<string, unknown>) => ReactNode) | undefined {

      return (record: Record<string, any>) => {

        let value = getValueByPath(record, accessor);

        if (render) {
          switch (render.layout) {
            case 'actions':
              return renderActionsCell(record);
            case 'booleanIcon':
              return renderBooleanIcon(value);
            case "image":
              return renderImage(value);
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
              console.warn(`DataTable: Unknown render layout "${render.layout}" in column "${colName}".`);
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
      width: fieldDef.colWidth ?? undefined,
      textAlign: fieldDef.colTextAlign ?? 'left',
      ellipsis: true,
      titleClassName: fieldDef.emphasizeColumn ? 'nf-emphasis' : '',
      footerClassName: fieldDef.emphasizeColumn ? 'nf-emphasis' : '',
      cellsClassName: fieldDef.emphasizeColumn ? 'nf-emphasis' : '',
      render: renderCell(),
      title: renderHeader(),
      footer: renderFooter(),
    } as DataTableColumn;
  }).filter((col) => col !== null);
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfDataTable(props: NfDataTableProps): JSX.Element {

  // #region Hooks and context

  const { viewSchema, records } = props;
  if (!viewSchema || viewSchema.config == null) {
    return <></>;
  }

  const { userSettings, appCfg, viewResult, currentView } = useAppUI();
  const [deleteRequest, setDeleteRequest] = useState<Record<string, any> | null>(null);

  const tblAppCfg = appCfg.listViews.table;
  const isDark = userSettings.dark;
  const tableCfg = viewSchema.config;
  const fields = viewResult.fieldConfig?.[viewSchema.name]?.fields;
  if(!fields) {
    console.warn(`DataTable: No field definitions found for table "${currentView}". Is loader.js configured correctly?`);
  }

  function replaceVars(str: string, record: Record<string, any>): string {
    return str
      .replace("{name}", record[tableCfg.nameAccessor!])
      .replace("{id}", record[tableCfg.idAccessor!])
      .replace("{therecord}", viewSchema.strings.therecord)
      .replace("{singular}", viewSchema.strings.singular)
      ;
  }

  // #endregion

  return (
    <>
      <DataTable

        // Invariant properties
        highlightOnHover={true}
        verticalAlign="center"
        minHeight={records?.length ? undefined : 150} // For "No records" text

        // Global dynamic properties
        striped={tblAppCfg.striped!}
        withTableBorder={tblAppCfg.bordered!}
        withRowBorders={tblAppCfg.rowBorders!}
        withColumnBorders={tblAppCfg.colBorders!}
        borderRadius={tblAppCfg.borderRadius ?? 'sm'}
        horizontalSpacing={tblAppCfg.horizontalSpacing ?? 'xs'}
        verticalSpacing={tblAppCfg.verticalSpacing ?? 'xs'}
        shadow={tblAppCfg.shadow ?? "none"}
        noRecordsText={appCfg.errorStrings.noRecordsText}

        // Row class names based on rules

        rowClassName={row => {
          if (!tableCfg.rowClassAccessor) {
            return '';
          }
          const rc = getValueByPath(row, tableCfg.rowClassAccessor) ?? '';
          return `${currentView}-${rc}`;
        }}

        // Dynamic properties per table

        noHeader={tableCfg.header === false}
        columns={getColumns(appCfg, viewSchema, isDark, records,
          viewSchema.name, viewResult.data, fields, (rec) => setDeleteRequest(rec))}
        records={records}
      />

      {/* Delete action */}
      {deleteRequest ? (
        <MessageBox
          title={appCfg.strings.deleteItemTitle}
          message={replaceVars(appCfg.strings.deleteItemConfirm ?? "", deleteRequest)}
          items={appCfg.listViews.messageBox.deleteControls}
          icon={"help"}
          iconClass="warning"
          onClose={() => setDeleteRequest(null)}
          onDelete={() => { console.log("delete", deleteRequest); }}
        />
      ) : null}
    </>
  );

}

// #endregion
