//
// Wrapper for Tabler icons.
//

// #region --------------------------------------------------------------------------------- Imports

import { ComponentType, JSX } from "react";
import { type IconProps, IconCircleOff } from "@tabler/icons-react";
import * as Tabler from '@tabler/icons-react';

import { useAppUI } from "context";
import { NfIconProps } from "./NfIcon";

// #endregion

// #region ------------------------------------------------------------------------------- Constants

// See https://tabler.io/icons

const iconMap = {
  add: "Plus",
  buildingsAlt: "BuildingCommunity",
  chart: "Activity",
  favorite: "Heart",
  filter: "Filter2",
  menu: "Menu2",
  moreVertical: "DotsVertical",
  notification: "Bell",
  pen: "WritingSign",
  treeView: "Sitemap",
  userSettings: "UserCog",
  view: "Eye",
} as Record<string, string>;

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfTablerIcon(props: NfIconProps): JSX.Element {

  if (!props.icon) {
    return <></>;
  }

  const { appCfg } = useAppUI();
  const { icon, size, stroke, color, filled, style, className } = props;

  let Comp: ComponentType<IconProps> | undefined;
  const mappedName = `Icon${{...iconMap, ...appCfg.theme.iconMapTabler}[icon]}`;
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

  return <Comp size={size} stroke={stroke} color={color} style={style} className={`nf-${className}`} />;
}

// #endregion
