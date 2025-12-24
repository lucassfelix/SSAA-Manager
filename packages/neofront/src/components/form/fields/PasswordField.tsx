//
// Text field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { clsx } from "clsx";
import { PasswordInput } from "@mantine/core";

import { FormFieldProps } from "context";
import { useMask } from './createMask';

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfPasswordField({ props }: { props: FormFieldProps }) {

  // #region Hooks and variables

  const { name, enabled, label, initialValue, width, size, required, readOnly,
    placeholder, mask } = props;

  let defValue = initialValue;
  const result = useMask(initialValue, mask);
  defValue = result.defValue;

  // #endregion

  return (
    <PasswordInput
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
      wrapperProps={{ 'data-field-props': name }}
    />
  );
};

// #endregion
