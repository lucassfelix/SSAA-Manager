//
// Application properties.
//

// #region --------------------------------------------------------------------------------- Imports

import type { MantineShadow, MantineSize, MantineSpacing } from "@mantine/core";

import { TopControlProps, ShellProps } from "@/shell/Shell";
import { MainMenuProps, MenuItem } from "@/shell/MainMenu";
import { ToolbarItem, ToolbarThemeProps } from "@/toolbar/Toolbar";
import { TabThemeProps } from "@/form/TabbedLayout";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

type ThemeModeProps = {
  expandedLogo: string;
  collapsedLogo: string;
};

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
    footerIconsSize?: number;
    footerIconsStroke?: number;
    headerIconsSize?: number;
    headerIconsStroke?: number;
    trueIcon?: string;
    falseIcon?: string;
    imageRadius?: MantineSize;
  };
  filterToolbar?: ToolbarThemeProps;
  actionToolbar?: ToolbarThemeProps;
  messageBox: {
    icon?: {
      size?: MantineSize;
      stroke?: number;
      filled?: boolean;
    };
    toolbar: ToolbarThemeProps;
    deleteControls: ToolbarItem[];
  };
  filterPanel?: {
    labelPosition?: 'top' | 'none';
    verticalPadding?: number;
    transitionDuration?: number;
  };
}

export interface MenuConfig {
  items: MenuItem[];
}

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
  errorImages: {
    [key: string]: string;
  };
  paths: {
    images: string;
  };
  shell: ShellProps;
  menu: MainMenuProps;
  toolbars: ToolbarThemeProps;
  topControls: TopControlProps;
  controls: {
    [key: string]: ToolbarItem;
  };
  listViews: ListViewsProps;
  forms: {
    fieldSize?: MantineSize;
    verticalGap?: MantineSpacing;
    fullHeight?: boolean;
    clearSelectionValue?: string;
    selectionCheck?: boolean;
    checkboxTopPadding?: number;
    outlinedSections?: boolean;
    imageRadius?: MantineSize;
    imageHeight?: number;
    tabs?: TabThemeProps;
    toolbar?: ToolbarThemeProps;
  };
  theme: {
    defaultUIScale: number;
    iconFamily: 'tabler' | 'material';
    mainFontFamily?: string | null;
    headingsFontFamily?: string | null;
    lightMode: ThemeModeProps;
    darkMode: ThemeModeProps;
    iconMapMaterial?: { [key: string]: string };
    iconMapTabler?: { [key: string]: string };
  };
}

// #endregion
