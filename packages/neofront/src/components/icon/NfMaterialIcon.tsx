//
// Small typed wrapper for @tabler/icons-react.
// Exports a mapping of icon names to Tabler icons,
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from 'react';
import 'material-symbols';

import { Box } from '@mantine/core';
import { NfIconProps } from './NfIcon';

// #endregion

// #region ------------------------------------------------------------------------------- Constants

// See https://fonts.google.com/icons

const iconMap = {
  activity: "show_chart",
  adjustments: "tune",
  building: "apartment",
  circleCheck: "check_circle",
  dental: "dentistry",
  filter: "filter_alt",
  menu: "menu",
  moon: "bedtime",
  moreVertical: "more_vert",
  notification: "notifications",
  squareX: "disabled_by_default",
  sun: "wb_sunny",
  user: "person",
  userSettings: "manage_accounts",
  wallet: "account_balance_wallet"
} as Record<string, string>;

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfMaterialIcon(props: NfIconProps): JSX.Element {

  if (!props.icon) {
    return <></>;
  }

  const { icon, size, color, filled, style, stroke } = props;

  const toSnake = (str: string) => str.split(/\.?(?=[A-Z])/).join('_').toLowerCase();
  const iconName = iconMap[icon] ?? toSnake(icon);
  const cssPrefix = ".material-symbols-outlined {font-variation-settings: 'FILL' 0, 'wght' ";
  const cssSuffix = ", 'GRAD' 0, 'opsz' 48}";
  const strokeSize = ((s?: number) => typeof s === 'number' ? s * 200 : 400)(stroke);

  return (
    <>
      <style>{cssPrefix + strokeSize + cssSuffix}</style>
      <Box
        className={`material-symbols${filled ? '' : '-outlined'}`}
        component="span"
        style={{
          fontSize: size,
          color: color,
          ...style,
          width: size,
          overflow: 'hidden',
        }}
      >
        {iconName}
      </Box>
    </>
  );
}

// #endregion
