//
// Date field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { clsx } from "clsx";
import { InputBase } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import { FormFieldProps, useAppUI } from "context";
import dayjs from "dayjs";
import NfIcon from "@/icon/NfIcon";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfDateField({ props }: { props: FormFieldProps }) {

  // #region Hooks and variables

  const { name, enabled, label, initialValue, width, size, required, readOnly, placeholder } = props;
  const { appCfg } = useAppUI();
  const dateFmt = String(appCfg.strings.defaultDateFormat ?? 'YYYY-MM-DD');

  // If date field is read-only, render as text field
  if (readOnly) {
    return (
      <InputBase
          name= {name}
          label={label}
          size={size}
          readOnly
          defaultValue={dayjs(initialValue).format(dateFmt)}
          w={width}
          className={clsx('nf-field nf-readonly', required ? 'nf-required' : '' )}
          rightSection={<NfIcon icon="calendar" size={20} stroke={2} />}
      />
    );
  }  

  // #endregion

  return (
    <DatePickerInput
      name={name}
      label={label}
      size={size}
      required={required}
      readOnly={readOnly}
      disabled={enabled === false}
      placeholder={readOnly ? undefined : placeholder}
      defaultValue={initialValue}
      w={width}
      className={clsx('nf-field', required ? 'nf-required' : '')}
      wrapperProps={{ 'data-field-props': name }}
      valueFormat={dateFmt}
      clearable={!required}
      styles={{ input: { cursor: readOnly ? 'not-allowed' : 'pointer' } }}
      rightSection={<NfIcon icon="calendar" size={20} stroke={2} />}
      rightSectionPointerEvents="none"
    />
  );
};

// #endregion
