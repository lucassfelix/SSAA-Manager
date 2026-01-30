//
// Renders a form with a header and sections with columns.
//

// #region --------------------------------------------------------------------------------- Imports

import { CSSProperties, JSX, useRef } from "react";
import { Group, Stack, SimpleGrid } from "@mantine/core";

import { RecordConfig, UnifiedFieldProps, useAppUI, FormFieldProps, SelectFieldOption } from "context";
import { FormOperationType } from "./Form";
import Section, { SectionSchema } from "@/form/Section";
import ErrorPage from "@/errorpage/ErrorPage";
import { getValueByPath } from "@/listView/datatableUtils";

import { FormLayoutSchema } from "context";
import NfTextField from "./fields/TextField";
import NfBooleanField from "./fields/BooleanField";
import NfSelectField from "./fields/SelectField";
import NfDateField from "./fields/DateField";
import NfNumberField from "./fields/NumberField";
import NfImageField from "./fields/ImageField";
import NfPasswordInputField from "./fields/PasswordInputField";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

interface FormLayoutProps {
  op: FormOperationType;
  recordCfg: RecordConfig;
  record?: Record<string, any>;
  formLayout: FormLayoutSchema;
  fields?: Record<string, UnifiedFieldProps>;
  style?: CSSProperties;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function FormLayout(props: FormLayoutProps): JSX.Element {

  // #region Hooks and variables

  const { op, recordCfg, record, formLayout, fields, style } = props;
  const { appCfg, currentView, viewResult } = useAppUI();

  if (!recordCfg) {
    return (
      <ErrorPage
        message={appCfg.errorStrings.formConfigMissing}
        image={appCfg.errorImages?.formConfigMissing || "octopus"}
      />
    );
  }

  const isFilter = op === 'filter';
  const isDetail = op === 'detail';
  const layout = isFilter ? viewResult.listView.filterPanel?.layout : formLayout;

  if (!layout) {
    if ((op && !isFilter)) {
      console.warn(`FormLayout: Form layout is missing. Did you check the ${currentView}.ts binder?`);
    }
    return (
      <ErrorPage
        message={appCfg.errorStrings.formLayoutMissing.replace("{op}", op)}
        image={appCfg.errorImages?.formLayoutMissing || "shipwreck_survivor"}
      />
    );
  }

  const headerFields = layout.header || [];
  const sections = layout.sections || [];
  const resolvedFields = fields ?? viewResult.fieldConfig[currentView]?.fields ?? {};
  const warnedMissingField = useRef(new Set<string>());

  function hasPath(obj: unknown, path: string): boolean {
    if (!obj || typeof obj !== 'object') {
      return false;
    }
    const parts = path.split('.').filter(Boolean);
    let cur: any = obj;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object' || !(part in cur)) {
        return false;
      }
      cur = cur[part];
    }
    return true;
  }

  function normalizeMultiSelectValue(value: unknown): unknown {
    if (!value) {
      return value;
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value !== 'string') {
      return value;
    }

    const s = value.trim();
    if (!s) {
      return value;
    }

    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed) ? parsed : value;
      } catch {
        return value;
      }
    }

    if (s.includes(',')) {
      const parts = s.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 1 && parts.every(p => /^-?\d+$/.test(p))) {
        return parts.map(Number);
      }
    }

    return value;
  }

  // Render a single field based on the fields section
  const renderField = (fieldName: string) => {

    const fieldDef: UnifiedFieldProps = resolvedFields[fieldName];
    if (!fieldDef) {
      console.warn(`FormLayout: Definition for field '${fieldName}' not found.`);
      return null;
    }

    // Load options from viewResult if applicable
    let loadedData: SelectFieldOption[] | undefined;
    if (fieldDef.dataType === 'select' && fieldDef.options && viewResult) {
      let table = viewResult.data?.[fieldDef.options.table];
      if (table && Array.isArray(table)) {
        const filterKey = fieldDef.options.filter;
        if (filterKey && record) {
          const filterValue = getValueByPath(record, filterKey);
          if (filterValue != null && filterValue !== '') {
            table = table.filter((item: any) => String(getValueByPath(item, filterKey, true) ?? '') === String(filterValue));
          }
        }
        loadedData = table.map((item: any) => ({
          value: getValueByPath(item, fieldDef.options!.valueAccessor || 'value', true),
          label: getValueByPath(item, fieldDef.options!.labelAccessor || 'label', true)
        }));
      }
    }

    // Prefill initialValue from record if available
    const accessor = fieldDef.accessor ?? fieldName;

    if (record && !isFilter && !hasPath(record, accessor)) {
      const key = `${currentView}:${fieldName}:${accessor}`;
      if (!warnedMissingField.current.has(key)) {
        warnedMissingField.current.add(key);
        console.warn(
          `FormLayout: Field '${fieldName}' (accessor '${accessor}') is not present on the current record for view '${currentView}'. ` +
          `This usually means the backend schema/data loader doesn't provide it, so edits may not be persisted.`
        );
      }
    }

    const recordValue = record ? getValueByPath(record, accessor) : undefined;
    const baseValue = isDetail ? recordValue : recordValue ?? fieldDef.defaultValue;
    const initialValue = fieldDef.dataType === 'select' && fieldDef.multiple ?
      normalizeMultiSelectValue(baseValue) : baseValue;

    const props: FormFieldProps = {
      name: fieldName,
      dataType: fieldDef.dataType || 'string',
      label: isFilter && appCfg.listViews.filterPanel?.labelPosition === "none" ? undefined : fieldDef.label,
      initialValue,
      width: isFilter ? fieldDef.filterWidth || fieldDef.fieldWidth : fieldDef.fieldWidth,
      size: appCfg.forms.fieldSize,
      required: isFilter || isDetail ? undefined : fieldDef.required,
      readOnly: isDetail ? true : isFilter ? undefined : fieldDef.readOnly,
      placeholder: isFilter ? fieldDef.filterPlaceholder || fieldDef.placeholder : fieldDef.placeholder,
      enabled: fieldDef.enabled !== undefined ? fieldDef.enabled : true,
      mask: fieldDef.mask,
      options: loadedData ?? undefined,
      multiple: fieldDef.multiple
    };

    switch (fieldDef.dataType) {
      case 'boolean':
        return <NfBooleanField key={fieldName} props={props} />;
      case 'select':
        return <NfSelectField key={fieldName} props={props} />;
      case 'integer':
      case 'decimal':
        return <NfNumberField key={fieldName} props={props} />;
      case 'string':
      case 'password':
        return <NfTextField key={fieldName} props={props} />;
      case 'passwordInput':
        return <NfPasswordInputField key={fieldName} props={props} />;
      case 'date':
        return <NfDateField key={fieldName} props={props} />;
      case 'image':
        return <NfImageField key={fieldName} props={props} />;
      default:
        console.warn(`FormLayout: No renderer for dataType '${fieldDef.dataType}' in field '${fieldName}'.`);
        return <div key={fieldName}>(No renderer for dataType '{fieldDef.dataType}')</div>;
    }
  };

  // #endregion

  return (
    <Stack gap={appCfg.forms.verticalGap} style={style}>

      {/* Header row, if any */}

      {headerFields.length > 0 && (
        <Group wrap="nowrap" gap="md">
          {headerFields.map((fieldName: string) => renderField(fieldName))}
        </Group>
      )}

      {/* Sections */}

      {sections.map((section: SectionSchema, sectionIdx: number) => {
        const sectionContents = (
          <SimpleGrid cols={section.columns?.length || 1} spacing="md">
            {section.columns?.map((column: (string | string[])[], colIdx: number) => (
              <Stack key={colIdx} gap="md">
                {column.map((item: string | string[], itemIdx: number) =>
                  Array.isArray(item) ? (
                    <Group key={itemIdx} wrap="nowrap" gap="md">
                      {item.map((fieldName: string) => renderField(fieldName))}
                    </Group>
                  ) : (
                    renderField(item)
                  )
                )}
              </Stack>
            ))}
          </SimpleGrid>
        );

        return (
          <Section
            key={sectionIdx}
            schema={section}
            contents={sectionContents}
          />
        );
      })}

    </Stack>
  );
}
