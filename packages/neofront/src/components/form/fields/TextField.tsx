//
// Text field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { clsx } from "clsx";
import { IMaskInput } from 'react-imask';
import { InputBase } from "@mantine/core";

import { FormFieldProps } from "context";
import { useMask } from './createMask';

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfTextField({ props }: { props: FormFieldProps }) {
  // #region Hooks and variables

  const { name, enabled, label, initialValue, width, size, required, readOnly,
    placeholder, mask, dataType } = props;

  let defValue = initialValue;
  const result = useMask(initialValue, mask);
  const isPassword = dataType === 'password';
  defValue = isPassword ? "********" : result.defValue;

  // #endregion

  return (
    <InputBase
      name={name}
      label={label}
      size={size}
      required={required}
      readOnly={readOnly}
      disabled={enabled === false}
      placeholder={readOnly ? undefined : placeholder}
      defaultValue={defValue}
      w={width}
      className={clsx('nf-field', readOnly ? "nf-readonly" : '', isPassword ? 'nf-password' : '')}
      component={isPassword ? "input" : (result.imaskConfig ? IMaskInput : undefined)}
      type={isPassword ? "password" : undefined}
      mask={result.imaskConfig}
      wrapperProps={{ 'data-field-props': name }}
    />
  );
};

// #endregion
