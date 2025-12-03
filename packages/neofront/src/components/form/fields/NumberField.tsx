//
// Text field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { clsx } from "clsx";
import { NumberInput } from "@mantine/core";

import { FormFieldProps, useAppUI } from "context";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfNumberField({ props }: { props: FormFieldProps }) {

  // #region Hooks and variables

  const { name, enabled, label, initialValue, width, size, required, readOnly,
    placeholder, dataType } = props;
  const isDecimal = dataType === 'decimal' ? true : undefined;
  const { appCfg } = useAppUI();

  // #endregion

  return (
    <NumberInput
      name={name}
      label={label}
      size={size}
      required={required}
      readOnly={readOnly}
      disabled={enabled === false}
      placeholder={readOnly ? undefined : placeholder}
      defaultValue={initialValue}
      w={width}
      decimalSeparator={isDecimal ? String(appCfg.strings.decimalSeparator) : undefined}
      thousandSeparator={isDecimal ? String(appCfg.strings.thousandSeparator) : undefined}
      decimalScale={isDecimal ? 2 : undefined}
      fixedDecimalScale={isDecimal}
      hideControls={isDecimal}
      className={clsx('nf-field', readOnly ? "nf-readonly" : '')}
      wrapperProps={{ 'data-field-props': name }}
      allowNegative={false}
      styles={{
        input: {
          textAlign: "right", paddingRight: readOnly ? undefined : (isDecimal ? undefined : 32)
        }
      }}
    />
  );
};

// #endregion
