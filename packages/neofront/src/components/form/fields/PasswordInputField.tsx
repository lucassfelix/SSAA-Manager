//
// Text field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { clsx } from "clsx";
import { PasswordInput, Tooltip } from "@mantine/core";

import { FormFieldProps, useAppUI } from "context";
import { useMask } from './createMask';
import NfIcon from "@/icon/NfIcon";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfPasswordInputField({ props }: { props: FormFieldProps }) {

  // #region Hooks and variables

  const { name, enabled, label, initialValue, width, size, required, readOnly,
    placeholder, mask } = props;
  const { appCfg } = useAppUI();

  // Apply mask if applicable

  let defValue = initialValue;
  const result = useMask(initialValue, mask);
  defValue = result.defValue;
  const btnCfg = appCfg.toolbars.iconButtons;

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
      visibilityToggleIcon={({ reveal }) =>
        <Tooltip label={reveal ? appCfg.strings.hidePassword : appCfg.strings.showPassword}>
          <NfIcon
            icon={reveal ? "eyeOff" : "eyeCheck"}
            size={btnCfg?.iconSize}
            stroke={btnCfg?.iconStroke}
            filled={btnCfg?.filled}
          />
        </Tooltip>
      }
    />
  );
};

// #endregion
