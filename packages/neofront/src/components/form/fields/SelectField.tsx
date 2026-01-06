//
// Select field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { useState } from 'react';
import { ComboboxItem, InputBase, Select, MultiSelect, type ComboboxData } from '@mantine/core';

import { FormFieldProps, useAppUI } from 'context';
import NfIcon from '@/icon/NfIcon';

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfSelectField({ props }: { props: FormFieldProps }) {

  // #region Hooks and variables

  const { name, enabled, label, initialValue, width, size, required, readOnly, placeholder,
    options, multiple } = props;

  // Controlled value state
  const raw: any = initialValue as any;
  const initNorm = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? (raw.id ?? raw.value ?? null) : raw;
  const [value, setValue] = useState<any>(() => {
    if (multiple) {
      if (Array.isArray(initNorm)) {
        return initNorm.map(v => String(v));
      }
      return initNorm != null ? [String(initNorm)] : [];
    }
    return initNorm != null ? String(initNorm) : null;
  });

  if(!options) {
    console.warn(`SelectField: No options provided for field '${name}'. Make sure the relevant tables are imported in loader.js.`);
  }

  // If select field is read-only, render as text field showing the option label
  if (readOnly) {
    const initValue = multiple ? (
      (Array.isArray(initNorm) ? initNorm : (initNorm != null ? [initNorm] : []))
        .map(v => options?.find(o => String(o.value) === String(v))?.label ?? String(v))
        .join(', ')
    ) : (
      options?.find(o => String(o.value) === String(initNorm))?.label ?? (initNorm != null ? String(initNorm) : undefined)
    );
    return (
      <InputBase
          name= {name}
          label={label}
          size={size}
          readOnly
          defaultValue={initValue}
          w={width}
          className="nf-field nf-readonly"
      />
    );
  }

  const { appCfg } = useAppUI();
  const formsCfg = appCfg.forms ?? {};
  const clearValue = formsCfg.clearSelectionValue ?? "__clear_selection__";
  const selectionCheck = formsCfg.selectionCheck ?? false;

  // Make sure values are in correct format
  const data = (options ?? [{value: 1, label: "(Empty)"}])?.flatMap((o) => {
    const v = String(o.value);
    if (required && v === clearValue) {
      console.warn(`SelectField: '${clearValue}' should not be used as a regular option value.`);
      return [];
    }
    return { value: v, label: o.label ?? v };
  }) as ComboboxData | undefined;

  // Renders an option item with optional selection check icon
  function renderOption(option: ComboboxItem) {
    const isSelected = multiple ? (Array.isArray(value) && value.includes(option.value)) : option.value === value;

    const renderedOption = (
      <span className={option.value === clearValue ? 'nf-clear' : (
        isSelected ? 'nf-selected' : undefined
      )}>
        {option.label}
      </span>
    );

    return selectionCheck ? <>
      <NfIcon
        icon={option.value === value ? 'check' : null}
        size={16}
        stroke={3}
        style={{ opacity: 0.5 }}
      />
      {renderedOption}
    </> : renderedOption;
  }

  // #endregion

  return (
    multiple ? (
      <MultiSelect
        name={name}
        label={label}
        size={size}
        required={required}
        disabled={enabled === false}
        placeholder={placeholder}
        value={value as string[]}
        w={width}
        renderOption={({ option }) => renderOption(option)}
        data={data ?? []}
        onChange={(vals) => setValue(vals)}
        className="nf-field"
        wrapperProps={{ 'data-field-props': name }}
      />
    ) : (
      <Select
        name={name}
        label={label}
        size={size}
        required={required}
        readOnly={readOnly}
        disabled={enabled === false}
        placeholder={placeholder}
        value={value as string | null}
        w={width}
        autoSelectOnBlur
        allowDeselect={false}
        renderOption={({ option }) => renderOption(option)}
        data={data ?? []}
        onChange={(v, option) => setValue(option?.value === clearValue ? null : v)}
        className="nf-field"
        wrapperProps={{ 'data-field-props': name }}
      />
    )
  );
}

// #endregion
