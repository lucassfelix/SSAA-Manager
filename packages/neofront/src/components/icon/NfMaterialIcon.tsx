//
// Wrapper for Material Symbol icons.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from 'react';
import 'material-symbols';

import { useAppUI } from 'context';
import { Box } from '@mantine/core';
import { NfIconProps } from './NfIcon';

// #endregion

// #region ------------------------------------------------------------------------------- Constants

// See https://fonts.google.com/icons

const iconMap = {
  chart: "show_chart",
  adjustments: "tune",
  building: "apartment",
  buildings: "domain",
  circleCheck: "check_circle",
  edit: "edit_square",
  filter: "filter_list",
  menu: "menu",
  moon: "bedtime",
  moreVertical: "more_vert",
  notification: "notifications",
  squareX: "disabled_by_default",
  sum: "functions",
  sun: "wb_sunny",
  trash: "delete",
  tools: "design_services",
  user: "person",
  userSettings: "manage_accounts",
  view: "visibility",
  wallet: "account_balance_wallet"
} as Record<string, string>;

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfMaterialIcon(props: NfIconProps): JSX.Element {

  if (!props.icon) {
    return <></>;
  }

  const { appCfg } = useAppUI();
  const { icon, size, color, filled, style, stroke } = props;

  const toSnake = (str: string) => str.split(/\.?(?=[A-Z])/).join('_').toLowerCase();
  const iconName = {...iconMap, ...appCfg.theme.iconMapMaterial}[icon] ?? toSnake(icon);
  const strokeSize = ((s?: number) => typeof s === 'number' ? s * 250 : 400)(stroke);

  return (
    <>
      <Box
        className={`material-symbols${filled ? '' : '-outlined'}`}
        component="span"
        style={{
          fontSize: size,
          color: color,
          ...style,
          width: size,
          overflow: 'hidden',
          fontVariationSettings: `'FILL' 0, 'wght' ${strokeSize}, 'GRAD' 0, 'opsz' 48`
        }}
      >
        {iconName}
      </Box>
    </>
  );
}

// #endregion
