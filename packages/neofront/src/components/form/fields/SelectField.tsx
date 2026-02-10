//
// Select field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { ComboboxItem, Group, InputBase, Select, MultiSelect, Pill } from '@mantine/core';
import { type ComboboxData } from '@mantine/core';

import { FormFieldProps, useAppUI } from 'context';
import NfIcon from '@/icon/NfIcon';

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfSelectField({ props }: { props: FormFieldProps }) {

  // #region Hooks and variables

  const { name, enabled, label, initialValue, width, size, required, readOnly, placeholder,
    options, multiple } = props;

  const { appCfg } = useAppUI();
  const formsCfg = appCfg.forms ?? {};
  const clearValue = formsCfg.clearSelectionValue ?? "__clear_selection__";
  const selectionCheck = formsCfg.selectionCheck ?? false;

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

  if (!options) {
    console.warn(`SelectField: No options provided for field '${name}'. Make sure the relevant tables are imported in loader.js.`);
  }

  // Keep value in valid options only
  useEffect(() => {
    if (readOnly || options == null) {
      return;
    }

    if (options.length === 0) {
      if (multiple) {
        const cur = Array.isArray(value) ? (value as string[]) : [];
        if (cur.length !== 0) {
          setValue([]);
        }
      } else {
        if (value != null && value !== '') {
          setValue(null);
        }
      }
      return;
    }

    const allowed = new Set(options.map(o => String(o.value)));
    if (multiple) {
      const cur = Array.isArray(value) ? (value as string[]) : [];
      const next = cur.filter(v => allowed.has(String(v)));
      if (next.length !== cur.length) {
        setValue(next);
      }
      return;
    }

    if (value != null && !allowed.has(String(value))) {
      setValue(null);
    }
  }, [multiple, options, readOnly, value]);

  // If select field is read-only, render as text field showing the option label
  if (readOnly) {
    const initLabels = (Array.isArray(initNorm) ? initNorm : (initNorm != null ? [initNorm] : []))
      .map(v => options?.find(o => String(o.value) === String(v))?.label ?? String(v));

    const initValue = options?.find(o => String(o.value) === String(initNorm))?.label ??
      (initNorm != null ? String(initNorm) : undefined);

    return multiple ? (
      <InputBase
        component="div"
        label={label}
        size={size}
        w={width}
        className="nf-field nf-readonly"
      >
        <Group gap={6} style={{ flexWrap: 'wrap', height: '100%' }}>
          {initLabels.map((txt, idx) => (
            <Pill key={`${name}-${idx}`} variant="contrast">{txt}</Pill>
          ))}
        </Group>
      </InputBase>
    ) : (
      <InputBase
        name={name}
        label={label}
        size={size}
        w={width}
        readOnly
        defaultValue={initValue}
        className="nf-field nf-readonly"
      />
    );
  }

  // Make sure values are in correct format
  const data = (options ?? [{ value: 1, label: "(Empty)" }])?.flatMap((o) => {
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
        icon={isSelected ? 'check' : null}
        size={16}
        stroke={3}
        style={{ opacity: 0.5 }}
      />
      {renderedOption}
    </> : renderedOption;
  }

  // #endregion

  return (
    <div data-field-props={name}>
      {multiple ? (
        <>
          {(value as string[]).map((v, i) => (
            <input key={`${name}-${i}`} type="hidden" name={name} value={v} />
          ))}
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
            className={clsx('nf-field', readOnly ? "nf-readonly" : '', required ? 'nf-required' : '' )}
          />
        </>
      ) : (
        <>
          <input type="hidden" name={name} value={(value as string | null) ?? ''} />
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
            className={clsx('nf-field', readOnly ? "nf-readonly" : '', required ? 'nf-required' : '' )}
          />
        </>
      )}
    </div>
  );
}

// #endregion
