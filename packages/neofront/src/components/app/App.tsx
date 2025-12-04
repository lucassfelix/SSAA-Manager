//
// Main application component.
//

// #region --------------------------------------------------------------------------------- Imports

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DatesProvider } from '@mantine/dates';
import { createTheme, MantineProvider, DEFAULT_THEME } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";

import { AppUIContext, AppProps, MenuConfig, IconsConfig, UserSettings, ViewResultProps } from "context";
import Shell from "@/shell/Shell";
import { setDocumentTitle, useToggleClass, useEmbedTracking, extendDayjs } from "./appUtils";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

interface MainAppProps {
  appCfg: AppProps;
  menuCfg: MenuConfig;
  iconsCfg: IconsConfig;
  loadView: (viewName: string) => Promise<ViewResultProps> | undefined;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function App(props: MainAppProps) {

  // #region Hooks and variables
  
  const { appCfg, menuCfg, iconsCfg, loadView } = props;

  // Validate projectId
  if(!appCfg.projectId || appCfg.projectId.trim() === '') {
    throw new Error("Missing required projectId in app configuration.");
  }

  // Validate locale
  if (['en-us', 'es-419', 'pt-br'].includes(appCfg.language) === false) {
    throw new Error(`Unsupported language locale "${appCfg.language}" in app configuration.`);
  }
  document.documentElement.setAttribute('lang', appCfg.language);
  extendDayjs(appCfg.language);
  document.documentElement.style.fontSize = appCfg.theme.defaultUIScale + '%';

  // Store and retrieve settings from local storage
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>({
    key: `nf-${appCfg.projectId}`,
    defaultValue: {
      dark: false,
      navbarCollapsed: false,
      views: {},
    },
    getInitialValueInEffect: false,
  });

  // Derive current view from URL (?v=...) with fallback
  const [searchParams, setSearchParams] = useSearchParams();
  const urlView = searchParams.get('v') ?? appCfg.listViews.defaultList;
  const urlOp = searchParams.get('op') ?? '';

  // Loaded state: frozen until new view data is ready
  const [loaded, setLoaded] = useState<{
    view: string;
    op: string;
    recordId: string;
    result: ViewResultProps | undefined;
  }>({ view: '', op: '', recordId: '', result: undefined });

  // Use loaded values for rendering to prevent flashes during navigation
  const currentView = loaded.view || urlView;
  const currentOp = loaded.view ? loaded.op : urlOp;
  const currentRecordId = loaded.recordId;
  const viewResult = loaded.result;

  // Load view schema and data when URL view changes
  useEffect(() => {
    if (!searchParams.get('v')) {
      setSearchParams({ v: urlView }, { replace: true });
    }

    const loader = loadView(urlView);
    if (loader) {
      loader.then((result) => {
        const idAccessor = result?.listView?.config?.idAccessor ?? 'id';
        const recordId = searchParams.get(idAccessor) ?? '';
        setLoaded({ view: urlView, op: urlOp, recordId, result });
      });
    } else {
      setLoaded({ view: urlView, op: urlOp, recordId: '', result: {} as ViewResultProps });
    }
  }, [urlView, urlOp, setSearchParams, searchParams]);

  // Update document title when view or record changes
  useEffect(() => {
    setDocumentTitle(appCfg, currentView, viewResult, searchParams);
  }, [searchParams, currentView, viewResult, currentRecordId]);

  // Sync body class with theme for global CSS
  useToggleClass((typeof document !== 'undefined' ? document.body : null),
    'nf-dark', 'nf-light', userSettings.dark);

  // Send element bounds to parent window for integrated mode
  useEmbedTracking();

  // Define Mantine theme with global component props
  const theme = createTheme({
    components: {
      Select: { defaultProps: { comboboxProps: { offset: 2 } } },
      DatePickerInput: { defaultProps: { popoverProps: { offset: 2 } } }
    },
    fontFamily: `${appCfg.theme.typography.mainFamily || null}, ${DEFAULT_THEME.fontFamily}`,
    headings: {
      fontFamily: `${appCfg.theme.typography.headingsFamily || null}, ${DEFAULT_THEME.fontFamily}`,
    },
  });

  // #endregion

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme={userSettings.dark ? 'dark' : 'light'}
      forceColorScheme={userSettings.dark ? 'dark' : 'light'}
    >
      <DatesProvider settings={{ locale: appCfg.language, firstDayOfWeek: 0 }}>
        <AppUIContext.Provider value={{
          appCfg,
          menuCfg,
          iconsCfg,
          userSettings,
          setUserSettings,
          currentView,
          currentOp,
          viewResult: viewResult || {} as ViewResultProps,
          currentRecordId,
          isReady: Boolean(loaded.view),
        }}>
          <Shell />
        </AppUIContext.Provider>
      </DatesProvider>
    </MantineProvider>
  );

}

// #endregion
