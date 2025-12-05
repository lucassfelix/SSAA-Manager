//
// Simple icon component that wraps different icon libraries.
//

// #region --------------------------------------------------------------------------------- Imports

import { CSSProperties, JSX } from "react";

import NfTablerIcon from "./NfTablerIcon";
import NfMaterialIcon from "./NfMaterialIcon";
import { useAppUI } from "context";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface NfIconProps {
  icon: string | null;
  size?: number;
  stroke?: number | string;
  color?: string;
  filled?: boolean;
  style?: CSSProperties;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfIcon(props: NfIconProps): JSX.Element {
  const { appCfg } = useAppUI();

  switch(appCfg.theme.iconFamily) {
    case 'material':
      return <NfMaterialIcon {...props} />;
    case 'tabler':
    default:
      return <NfTablerIcon {...props} />;
  }
}

// #endregion
