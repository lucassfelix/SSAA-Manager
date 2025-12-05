//
// Small typed wrapper for @tabler/icons-react.
// Exports a mapping of icon names to Tabler icons,
//

// #region --------------------------------------------------------------------------------- Imports

import { ComponentType, JSX } from "react";
import { type IconProps, IconCircleOff } from "@tabler/icons-react";
import * as Tabler from '@tabler/icons-react';

import { useAppUI, IconsConfig } from "context";
import { NfIconProps } from "./NfIcon";

// #endregion

// #region -------------------------------------------------------------------------------- Icon map

function buildIconMap(iconsCfg: IconsConfig, filled: boolean = false) {
  return Object.entries(iconsCfg).reduce((acc, [key, exportName]) => {
    (acc as any)[key] = (Tabler as any)[Array.isArray(exportName) ?
      exportName[filled ? (exportName[1] ? 1 : 0) : 0] : exportName];
    return acc;
  }, {} as Record<string, ComponentType<IconProps>>);
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfTablerIcon(props: NfIconProps): JSX.Element {

  if (!props.icon) {
    return <></>;
  }
  const { icon, size, stroke, color, filled, style } = props;
  const { iconsCfg } = useAppUI();
  // TODO: Build map only once, not on every render
  const map = buildIconMap(iconsCfg, filled);

  // Prefer explicit mapping; otherwise try to derive Tabler export name automatically
  let Comp: ComponentType<IconProps> | undefined = map[icon];
  if (!Comp) {
    const toPascal = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
    const base = `Icon${toPascal(icon)}`;
    const autoName = filled && (Tabler as any)[`${base}Filled`] ? `${base}Filled` : base;
    Comp = (Tabler as any)[autoName] as ComponentType<IconProps> | undefined;
  }

  if (Comp === undefined) {
    console.warn(`NfIcon: Icon "${icon}" not found.`);
    return <IconCircleOff size={size} stroke={stroke} color="red" />;
  }

  return <Comp size={size} stroke={stroke} color={color} style={style} />;
}

// #endregion
