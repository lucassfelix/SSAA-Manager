//
// Simple icon component that wraps different icon libraries.
//

// #region --------------------------------------------------------------------------------- Imports

import { CSSProperties, JSX } from "react";

import NfTablerIcon from "./NfTablerIcon";
import NfMaterialIcon from "./NfMaterialIcon";
import { useAppUI } from "context";
import { Box } from "@mantine/core";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface NfIconProps {
  icon: string | null;
  size?: number | string;
  stroke?: number;
  color?: string;
  filled?: boolean;
  style?: CSSProperties;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfIcon(props: NfIconProps): JSX.Element {

  const { icon, size, color, filled, style } = props;

  if (icon == '_blank') {
    return <Box
      className={`material-icons-${filled ? '' : 'outlined'}`}
      component="span"
      style={{
        fontSize: size,
        color: color,
        ...style,
        width: size,
        overflow: 'hidden',
      }}
    />;
  }

  const { appCfg } = useAppUI();

  switch (appCfg.theme.iconFamily) {
    case 'material':
      return <NfMaterialIcon {...props} />;
    case 'tabler':
    default:
      return <NfTablerIcon {...props} />;
  }
}

// #endregion
