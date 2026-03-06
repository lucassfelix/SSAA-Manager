//
// Text area field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { clsx } from "clsx";
import { Textarea } from "@mantine/core";

import { FormFieldProps } from "context";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfTextArea({ props }: { props: FormFieldProps }) {

  const { name, enabled, label, initialValue, width, size, required, readOnly, placeholder,
    className } = props;

  const defValue = initialValue == null ? undefined : String(initialValue);

  return (
    <Textarea
      name={name}
      label={label}
      size={size}
      required={required}
      readOnly={readOnly}
      disabled={enabled === false}
      placeholder={readOnly ? undefined : placeholder}
      defaultValue={defValue}
      w={width}
      autosize
      maxRows={8}
      className={clsx(
        'nf-field',
        readOnly ? 'nf-readonly' : '',
        required ? 'nf-required' : '',
        className
      )}
      wrapperProps={{ 'data-field-props': name }}
    />
  );
}

// #endregion
