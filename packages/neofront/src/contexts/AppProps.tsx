//
// Application properties.
//

// #region --------------------------------------------------------------------------------- Imports

import type { MantineShadow, MantineSize, MantineSpacing } from "@mantine/core";

import { ControlProps, ShellProps } from "@/shell/Shell";
import { MainMenuProps, MenuItem } from "@/shell/MainMenu";
import { ToolbarItem, ToolbarThemeProps } from "@/toolbar/Toolbar";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

type ThemeModeProps = {
  expandedLogo: string;
  collapsedLogo: string;
}

interface ListViewsProps {
  defaultList: string;
  table: {
    striped?: boolean;
    bordered?: boolean;
    rowBorders?: boolean;
    colBorders?: boolean;
    borderRadius?: number | string;
    horizontalSpacing?: number;
    verticalSpacing?: number;
    shadow?: MantineShadow;
    wrapperSize?: MantineSize;
    wrapperStatusWidth?: number;
    wrapperBooleanWidth?: number;
    booleanIconsSize?: number;
    booleanIconsStroke?: number;
    trueIcon?: string;
    falseIcon?: string;
  };
  filterToolbar?: ToolbarThemeProps;
  filterPanel?: {
    verticalPadding?: number;
    transitionDuration?: number;
    // verticalGap?: MantineSpacing;
    // fullHeight?: boolean;
    // toolbar?: ToolbarThemeProps;
  };
}

export interface MenuConfig {
  items: MenuItem[];
}

export type IconsConfig = Record<string, string | string[]>;

/** 
 * Application configuration structure. Should match the structure of app.json. 
 */
export interface AppProps {
  language: 'en-us' | 'es-419' | 'pt-br';
  projectId: string;
  strings: {
    [key: string]: string;
  };
  errorStrings: {
    [key: string]: string;
  };
  paths: {
    images: string;
  };
  shell: ShellProps;
  mainControls: ControlProps;
  controls: {
    [key: string]: ToolbarItem;
  }
  listViews: ListViewsProps;
  menu: MainMenuProps;
  toolbars: ToolbarThemeProps;
  forms: {
    fieldSize?: MantineSize;
    verticalGap?: MantineSpacing;
    fullHeight?: boolean;
    clearSelectionValue?: string;
    selectionCheck?: boolean;
    checkboxTopPadding?: number;
    outlinedSections?: boolean;
    toolbar?: ToolbarThemeProps;
    buttons: { [key: string]: ToolbarItem };
  }
  theme: {
    defaultUIScale: number;
    iconFamily: 'tabler' | 'material';
    mainFontFamily?: string | null;
    headingsFontFamily?: string | null;
    lightMode: ThemeModeProps;
    darkMode: ThemeModeProps;
  };
}

// #endregion
