//
// Text field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { IMaskInput } from 'react-imask';
import { clsx } from "clsx";
import { InputBase } from "@mantine/core";

import { FormFieldProps } from "context";
import { useMask } from './createMask';

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfTextField({ props }: { props: FormFieldProps }) {

  // #region Hooks and variables

  const { name, enabled, label, initialValue, width, size, required, readOnly,
    placeholder, mask } = props;

  let defValue = initialValue;
  const result = useMask(initialValue, mask);
  defValue = result.defValue;

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
      className={clsx('nf-field', readOnly ? "nf-readonly" : '')}
      component={result.imaskConfig ? IMaskInput : undefined}
      mask={result.imaskConfig}
      wrapperProps={{ 'data-field-props': name }}
    />
  );
};

// #endregion
