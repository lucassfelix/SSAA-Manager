//
// Application properties.
//

// #region --------------------------------------------------------------------------------- Imports

import type { MantineShadow, MantineSize, MantineSpacing } from "@mantine/core";

import { ShellProps } from "@/shell/Shell";
import { MenuItem } from "@/shell/MainMenu";
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
    emphasis?: {
      textLight?: string;
      textDark?: string;
      backgroundLight?: string;
      backgroundDark?: string;
    };
    wrappers?: {
      size?: MantineSize;
      statusWidth?: number;
      booleanWidth?: number;
    };
    booleanIcons?: {
      size?: number;
      stroke?: number;
      trueIcon?: string;
      falseIcon?: string;
      trueColorLight?: string;
      trueColorDark?: string;
      falseColorLight?: string;
      falseColorDark?: string;
    };
  };
  toolbar: ToolbarThemeProps;
  buttons: {
    [key: string]: ToolbarItem;
  };
  filterPanel: {
    verticalPadding?: number;
    transitionDuration?: number;
    verticalGap?: MantineSpacing;
    fullHeight?: boolean;
    toolbar?: ToolbarThemeProps;
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
  listViews: ListViewsProps;
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
    typography: {
      mainFamily?: string | null;
      headingsFamily?: string | null;
    };
    modes: {
      light: ThemeModeProps;
      dark: ThemeModeProps;
    }
  };
}

// #endregion
