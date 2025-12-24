//
// Simple icon component that wraps different icon libraries.
//

// #region --------------------------------------------------------------------------------- Imports

import { CSSProperties, JSX, forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

import NfTablerIcon from "./NfTablerIcon";
import NfMaterialIcon from "./NfMaterialIcon";
import { useAppUI } from "context";
import { Box } from "@mantine/core";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface NfIconProps extends ComponentPropsWithoutRef<'span'> {
  icon: string | null;
  size?: number | string;
  stroke?: number;
  color?: string;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

const NfIcon = forwardRef<HTMLSpanElement, NfIconProps>(function NfIcon(props, ref): JSX.Element {

  const { icon, size, color, filled, style, className, stroke, ...spanProps } = props;

  if (icon == '_blank') {
    return (
      <Box
        {...spanProps}
        ref={ref}
        className={`material-icons-${filled ? '' : 'outlined'}`}
        component="span"
        style={{
          fontSize: size,
          color: color,
          width: size,
          overflow: 'hidden',
          ...style,
        }}
      />
    );
  }

  const { appCfg } = useAppUI();
  const iconProps = { icon, size, stroke, color, filled, style, className };

  return (
    <Box
      {...spanProps}
      ref={ref}
      component="span"
      style={{ display: 'inline-flex' }}
    >
      {appCfg.theme.iconFamily === 'material' ?
        <NfMaterialIcon {...iconProps} /> :
        <NfTablerIcon {...iconProps} />}
    </Box>
  );
});

export default NfIcon;

// #endregion
