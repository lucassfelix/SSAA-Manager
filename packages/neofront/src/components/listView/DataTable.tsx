//
// Advanced data table component.
//

// #region --------------------------------------------------------------------------------- Imports

import "mantine-datatable/styles.css";

import { JSX, ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import { Anchor, Badge, Box, Image, Indicator, NumberFormatter, Stack, Text, Tooltip } from "@mantine/core";
import { DataTable, DataTableColumn } from "mantine-datatable";

import { AppProps, DataColumnOptions, FieldsConfig, FormLayoutSchema } from "context";
import { FieldOptionsRef, ListViewProps, useAppUI, UnifiedFieldProps } from "context";
import NfIcon from '@/icon/NfIcon';
import { getValueByPath, replaceMacros, getStyles } from "./datatableUtils";
import { applyMask, MaskSpec } from "@/form/fields/createMask";
import NfToolbar from "@/toolbar/Toolbar";
import DeleteBox from "@/messageBox/DeleteBox";

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

function getRelativeTime(date: any, language: string): string {

  const targetDate = dayjs(date);

  if (Math.abs((dayjs()).diff(targetDate, 'year')) >= 500) {
    switch (language) {
      case 'pt-br':
      case 'es-419':
        return 'nunca';
      default:
        return 'never';
    }
  }

  return targetDate.fromNow();
}

function getColumns(
  appCfg: AppProps,
  tblCfg: ListViewProps,
  isDark: boolean,
  records: Record<string, unknown>[],
  currentView: string,
  data: Record<string, unknown[]>,
  fieldConfig: Record<string, FieldsConfig>,
  fields: Record<string, UnifiedFieldProps>,
  rules: Record<string, unknown> | undefined,
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
      console.warn(`DataTable: Options table "${optionsRef.table}" not found in data. Did you configure loader.js correctly?`);
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
        return <span title={undefined}>{replaceMacros(fieldDef.header, accessor, records)}</span>;
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

    function renderIconWithBadge(values: (Record<string, unknown>)[], record: Record<string, any>): ReactNode {

      if (!values || !values.length) {
        return "";
      }

      const op = render?.op as string | undefined;
      const tabName = render?.tab as string | undefined;
      const idAccessor = tblCfg.config.idAccessor ?? tableProps.idAccessor ?? 'id';
      const idVal = String(getValueByPath(record, idAccessor) ?? '');

      const indicator = (
        <Tooltip
          label={`${values.length} ${fieldConfig[colName]?.strings?.[values.length > 1 ?
            'plural' : 'singular'] || '[item(s)]'}`}
          transitionProps={{ enterDelay: 500 }}
        >
          <Indicator
            inline
            label={values.length}
            size={16}
            className="nf-icon-with-badge-wrapper"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', lineHeight: 0 }}
          >
            <NfIcon
              icon={fieldDef.icon || 'circle'}
              color={fieldDef.iconColor}
              size={20}
              style={{ display: 'block' }}
            />
          </Indicator>
        </Tooltip>
      );

      if (!op || !tableProps.idAccessor || !idVal) {
        return indicator;
      }
      if (rules?.detail === false) {
        return indicator;
      }

      // Prepare link to record with specified operation

      const params = new URLSearchParams();
      params.set('v', currentView);
      params.set('op', op);
      params.set(idAccessor, idVal);

      if (tabName) {
        params.set('tab', tabName);
      }

      return (
        <Anchor
          key={accessor}
          component={Link}
          to={`?${params.toString()}`}
          {...getStyles(styles)}
        >
          {indicator}
        </Anchor>
      );
    }

    function renderBooleanWrapper(value?: boolean): ReactNode {
      if (value === undefined || value === null) {
        return '';
      }
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
      if (value === undefined || value === null) {
        return '';
      }
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

    function renderBooleanValue(value?: boolean): ReactNode {
      if (value === undefined || value === null) {
        return '';
      }
      return String(value ? appCfg.strings.yes : appCfg.strings.no);
    }

    function renderImage(value: string): ReactNode {
      return (
        <Image
          radius={tblAppCfg.imageRadius || 'sm'}
          src={value}
        />
      );
    }

    function renderLinkCell(value: any, record: Record<string, any>): ReactNode {

      if (!tableProps.idAccessor) {
        console.warn("DataTable: Identifier field not defined for table " +
          `"${currentView}" (column "${colName}").`);
        return renderSingleCell(value, styles, mask);
      }

      if (rules?.detail === false) {
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
        const abs = dayjs(value).isValid() ? dayjs(value).format(String(appCfg.strings.defaultDateFormat ?? 'YYYY-MM-DD')) : String(value);
        const tip = [fieldDef.label, abs].filter(Boolean).join(' ');
        return (
          <Tooltip label={tip} transitionProps={{ enterDelay: 500 }}>
            {renderSingleCell(getRelativeTime(value, appCfg.language), styles, undefined)}
          </Tooltip>
        );
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

      return (
        <NfToolbar
          className="nf-actions-toolbar"
          // items={(tblCfg.actions)}
          items={(tblCfg.actions ?? []).filter((ctrl: string) =>
            rules?.[appCfg.controls[ctrl].action ?? ''] !== false)}
          cfg={{ ...appCfg.toolbars, ...appCfg.listViews.actionToolbar }}
          onAction={handleAction}
        />
      );
    }

    // #endregion

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
            case 'iconWithBadge':
              return renderIconWithBadge(value, record);
            case 'blank':
              return "";
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

    // Disable ellipsis for non-text render layouts
    let ellipsis = true;
    const noEllipsisRenderers = [
      'booleanWrapper', 'booleanIcon', 'colorWrapper', 'iconWithBadge', 'image', 'actions', 
      'stacked', 'date', 'decimal'
    ];
    if (render && noEllipsisRenderers.includes(render.layout)) {
      ellipsis = false;
    }

    return {
      accessor,
      width: fieldDef.colWidth ?? undefined,
      textAlign: fieldDef.colTextAlign ?? 'left',
      ellipsis,
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

  const { userSettings, appCfg, viewResult, currentView, extras } = useAppUI();
  const [deleteRequest, setDeleteRequest] = useState<Record<string, any> | null>(null);

  const tblAppCfg = appCfg.listViews.table;
  const isDark = userSettings.dark;
  const tableCfg = viewSchema.config;
  const fieldConfig = viewResult.fieldConfig;
  const fields = fieldConfig?.[viewSchema.name]?.fields;

  if (!fields) {
    console.warn(`DataTable: No field definitions found for table "${currentView}". Is loader.js configured correctly?`);
  }

  const idAccessor = tableCfg.idAccessor ?? 'id';
  const nameAccessor = tableCfg.nameAccessor ?? 'name';

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
          viewSchema.name, viewResult.data, fieldConfig, fields,
          (extras as { capabilities?: { views?: Record<string, { rules?: Record<string, unknown> }> } } | undefined)?.capabilities?.views?.[currentView]?.rules,
          (rec) => setDeleteRequest(rec))}
        records={records}
      />

      {/* Delete action */}
      <DeleteBox
        record={deleteRequest}
        viewName={currentView}
        idAccessor={idAccessor}
        nameAccessor={nameAccessor}
        onClose={() => setDeleteRequest(null)}
        onDeleted={() => window.location.reload()}
      />
    </>
  );

}

// #endregion
