//
// Image field component.
//

// #region --------------------------------------------------------------------------------- Imports

import { Group, Image } from "@mantine/core";

import { FormFieldProps, useAppUI } from "context";
import NfTextField from "./TextField";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfImageField({ props }: { props: FormFieldProps }) {

  // #region Hooks and variables

  const { initialValue } = props;
  const { appCfg } = useAppUI();
  const formsCfg = appCfg.forms ?? {};

  // #endregion

  // TODO: Implement upload and edit with https://mantine.dev/x/dropzone/
  return (
    <Group style={{ alignItems: 'flex-start', gap: 16 }}>
      <NfTextField
        props={{ ...props, readOnly: true } }
      />
      <Image
        src={initialValue}
        style={{ width: "auto" }}
        radius={formsCfg.imageRadius || 'sm'}
      />
    </Group>
  );
}

// #endregion
