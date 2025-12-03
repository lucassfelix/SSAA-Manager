//
// Context handler for the application UI state.
//

// #region --------------------------------------------------------------------------------- Imports

import { createContext, useContext } from "react";

import { AppProps, MenuConfig, IconsConfig } from "context";
import { ViewResultProps } from "./FormProps";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface UserSettings {
  dark: boolean;
  navbarCollapsed: boolean;
  views?: Record<string, {
    filterPanelOpen?: boolean;
  }>;
}

interface AppUIContextValue {
  appCfg: AppProps;
  menuCfg: MenuConfig;
  iconsCfg: IconsConfig;
  userSettings: UserSettings;
  setUserSettings: (val: UserSettings) => void;
  currentView: string;
  currentOp: string;
  currentRecordId: string | number;
  viewResult: ViewResultProps;
  isReady: boolean;
}

// #endregion

// #region --------------------------------------------------------------------------------- Context

const AppUIContext = createContext<AppUIContextValue>({
  appCfg: {} as AppProps,
  menuCfg: { items: [] },
  iconsCfg: {},
  userSettings: {} as UserSettings,
  setUserSettings: () => {},
  currentView: '',
  currentOp: '',
  currentRecordId: '',
  viewResult: {} as AppUIContextValue["viewResult"],
  isReady: false,
});

export const useAppUI = () => useContext(AppUIContext);
export default AppUIContext;

// #endregion
