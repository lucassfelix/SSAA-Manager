//
// Boolean field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { useState } from "react";
import { Checkbox } from "@mantine/core";

import { FormFieldProps, useAppUI } from "context";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfBooleanField({ props }: { props: FormFieldProps }) {

  // #region Hooks and variables

  const { name, label, initialValue, readOnly, width, enabled, required } = props;
  const { appCfg } = useAppUI();
  const formsCfg = appCfg.forms ?? {};
  const [value, setValue] = useState<boolean>(!!initialValue);

  // #endregion

  return (
    <Checkbox
      name={name}
      label={label}
      checked={value}
      disabled={enabled === false}
      required={required}
      w={width}
      className="nf-field"
      style={{
        paddingTop: formsCfg.checkboxTopPadding || 20,
        pointerEvents: readOnly ? 'none' : 'auto',
      }}
      onChange={e => {
        if (!readOnly) {
          setValue(e.currentTarget.checked);
        }
      }}
      wrapperProps={{ 'data-field-props': name }}
    />
  );
}

// #endregion
