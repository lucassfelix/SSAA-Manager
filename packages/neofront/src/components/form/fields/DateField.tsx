//
// Date field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { clsx } from "clsx";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";

import { FormFieldProps, useAppUI } from "context";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfDateField({ props }: { props: FormFieldProps }) {

  // #region Hooks and variables

  const { name, enabled, label, initialValue, width, size, required, readOnly, placeholder } = props;
  const { appCfg } = useAppUI();
  const dateFmt = String(appCfg.strings.defaultDateFormat ?? 'YYYY-MM-DD');

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
      className={clsx('nf-field', readOnly ? "nf-readonly" : '')}
      wrapperProps={{ 'data-field-props': name }}
      valueFormat={dateFmt}
      clearable={!required}
      styles={{ input: { cursor: readOnly ? 'not-allowed' : 'pointer' } }}
      rightSection={<IconCalendar size={18} stroke={1.5} />}
      rightSectionPointerEvents="none"
    />
  );
};

// #endregion
