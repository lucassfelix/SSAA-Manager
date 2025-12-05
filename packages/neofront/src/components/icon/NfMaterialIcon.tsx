//
// Small typed wrapper for @tabler/icons-react.
// Exports a mapping of icon names to Tabler icons,
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from 'react';
import '@material-design-icons/font';
import { Box } from '@mantine/core';

import { NfIconProps } from './NfIcon';

// #endregion

// #region ------------------------------------------------------------------------------- Constants

// See https://marella.github.io/material-design-icons/demo/font/

const iconMap = {
  activity: "show_chart",
  adjustments: "tune",
  building: "apartment",
  filter: "filter_alt",
  menu: "menu",
  moon: "bedtime",
  moreVertical: "more_vert",
  notification: "notifications",
  sun: "wb_sunny",
  user: "person",
  wallet: "account_balance_wallet"
};

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfMaterialIcon(props: NfIconProps): JSX.Element {

  if (!props.icon) {
    return <></>;
  }

  const { icon, size, color, filled, style } = props;
  
  const toSnake = (str: string) => str.split(/\.?(?=[A-Z])/).join('_').toLowerCase();
  const iconName = (iconMap as Record<string, string>)[icon] ?? toSnake(icon);

  // Material Icons font

  return (
    <Box
      className={`material-icons-${filled ? '' : 'outlined'}`}
      component="span"
      style={{
        fontSize: size,
        color: color,
        ...style,
      }}
    >
      {iconName}
    </Box>
  );
}

// #endregion
