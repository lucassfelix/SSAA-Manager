//
// Small typed wrapper for @tabler/icons-react.
// Exports a mapping of icon names to Tabler icons,
//

// #region --------------------------------------------------------------------------------- Imports

import { ComponentType, JSX } from "react";
import { type IconProps, IconCircleOff } from "@tabler/icons-react";
import * as Tabler from '@tabler/icons-react';

import { NfIconProps } from "./NfIcon";

// #endregion

// #region -------------------------------------------------------------------------------- Icon map

const iconMap = {
  add: "IconPlus",
  bank: "IconBuildingBank",
  filter: "IconFilter2",
  menu: "IconMenu2",
  moreVertical: "IconDotsVertical",
  notification: "IconBellRinging2",
  userSettings: "IconUserCog",
} as Record<string, string>;

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfTablerIcon(props: NfIconProps): JSX.Element {

  if (!props.icon) {
    return <></>;
  }

  const { icon, size, stroke, color, filled, style } = props;

  // Prefer explicit mapping; otherwise try to derive Tabler export name automatically
  let Comp: ComponentType<IconProps> | undefined;

  const mappedName = iconMap[icon];
  if (mappedName) {
    Comp = (Tabler as any)[mappedName] as ComponentType<IconProps> | undefined;
  }
  if (!Comp) {
    const toPascal = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
    const base = `Icon${toPascal(icon)}`;
    const autoName = filled && (Tabler as any)[`${base}Filled`] ? `${base}Filled` : base;
    Comp = (Tabler as any)[autoName] as ComponentType<IconProps> | undefined;
  }

  if (Comp === undefined) {
    console.warn(`TablerIcon: Icon "${icon}" not found.`);
    return <IconCircleOff size={size} stroke={stroke} color="red" />;
  }

  return <Comp size={size} stroke={stroke} color={color} style={style} />;
}

// #endregion
