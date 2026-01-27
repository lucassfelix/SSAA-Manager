//
// Main shell component for NeoFront applications.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX, ReactNode } from "react";
import { Space, Tooltip, Title, Box, Group, ActionIcon, useMantineColorScheme } from "@mantine/core";
import { Image } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from "react-router-dom";

import { useAppUI } from "context";
import ThemeSwitch from "./ThemeSwitch";
import FullyCollapsibleLayout from "./FullyCollapsibleLayout";
import SidebarIconsLayout from "./SidebarIconsLayout";
import MainMenu from "./MainMenu";

import NfForm, { FormOperationType } from "@/form/Form";
import ErrorPage from "@/errorpage/ErrorPage";
import NfListView from "@/listView/ListView";
import NfIcon from "@/icon/NfIcon";
import NfToolbar from "@/toolbar/Toolbar";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

/** Types accepted by the item renderer */
type ItemRendererTypes = 'mainTitle' | 'collapseToggle' | 'logo' | 'spacer' | 'themeSwitch' |
  'mainMenu' | 'userToolbar';

/** Shell layout configuration */
export interface ShellProps {
  header: {
    fullWidth?: boolean;
    height: number;
    bordered: boolean;
    items: ItemRendererTypes[];
  };
  navbar: {
    width: number;
    collapsible: boolean;
    collapsedWidth: number;
    bordered: boolean;
    icons: boolean;
    footer: boolean;
    items: ItemRendererTypes[];
    footerItems: ItemRendererTypes[];
  };
  userToolbar?: string[];
}

export interface TopControlProps {
  mainTitle?: {
    label: string;
  };
  collapseToggle?: {
    rotateIcon?: boolean;
    tipCollapse: string;
    tipExpand: string;
  };
  themeSwitch?: {
    tipLight: string;
    tipDark: string;
  };
  logo?: {
    collapsedHeight: number;
    expandedHeight: number;
    collapsedWidth: number;
    expandedWidth: number;
    altText: string;
  };
}

/** Shell component props */
export interface CollapsibleShellProps {
  expandedWidth: number;
  mobileOpened: boolean;
  desktopOpened: boolean;
  mainContents: ReactNode;
  itemRenderer: (items: ItemRendererTypes[], collapsed: boolean) => JSX.Element[];
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function Shell(): JSX.Element {

  // #region Hooks and variables

  const { appCfg, userSettings, setUserSettings, currentView, currentOp, viewResult } = useAppUI();
  const navigate = useNavigate();
  const op = currentOp as FormOperationType;

  const shellCfg = appCfg.shell;
  const mainControls = appCfg.topControls;
  const errStr = appCfg.errorStrings;
  const expandedWidth = shellCfg.navbar.width || 240;
  const themeCfg = userSettings.dark ? appCfg.theme.darkMode : appCfg.theme.lightMode;
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const desktopOpened = !userSettings.navbarCollapsed;
  const collapsible = shellCfg.navbar.collapsible;
  const toggleCfg = mainControls.collapseToggle;
  const iconBtnConfig = appCfg.toolbars.iconButtons;

  const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });

  const actionHandler = (action: string): void => {
    switch (action) {
      case 'lightMode':
        setColorScheme("light");
        setUserSettings({ ...userSettings, dark: false });
        break;
      case 'darkMode':
        setColorScheme("dark");
        setUserSettings({ ...userSettings, dark: true });
        break;
      case 'logout':
        navigate('/login', { replace: true });
        return;
      default:
        console.log(`Action: '${action}'`);
        return;
    }
  };

  function isMenuItemSelected(action: string): boolean {
    switch (action) {
      case 'darkMode':
        return userSettings.dark;
      case 'lightMode':
        return !userSettings.dark;
      default:
        return false;
    }
  }

  function handleToggleDesktop(): void {
    try {
      // persist collapsed flag (true when closing)
      setUserSettings({ ...userSettings, navbarCollapsed: desktopOpened });
    } catch (_e) {
      // ignore persistence errors
    }
  }

  function Logo({ collapsed }: { collapsed: boolean }): JSX.Element {
    return (
      <Group justify="center">
        <Image
          src={appCfg.paths.images + (collapsed ? themeCfg.collapsedLogo : themeCfg.expandedLogo)}
          alt={mainControls?.logo?.altText ?? "Logo"}
          h={collapsed ? mainControls?.logo?.collapsedHeight : mainControls?.logo?.expandedHeight}
          w={collapsed ? mainControls?.logo?.collapsedWidth : mainControls?.logo?.expandedWidth}
          fit="contain"
        />
      </Group>
    );
  }

  function NavCollapseToggle() {
    return collapsible ? (
      <Tooltip label={desktopOpened ? toggleCfg?.tipCollapse : toggleCfg?.tipExpand}>
        <ActionIcon
          size={appCfg.forms.toolbar?.iconButtons?.size}
          radius={appCfg.forms.toolbar?.iconButtons?.radius}
          variant="subtle"
          color="var(--mantine-primary-color-light-color)"
          onClick={() => { handleToggleDesktop(); toggleMobile(); }}
        >
          <NfIcon
            icon="menu"
            size={iconBtnConfig?.iconSize}
            stroke={iconBtnConfig?.iconStroke}
            filled={iconBtnConfig?.filled}
            style={toggleCfg?.rotateIcon ? {
              transform: desktopOpened ? 'rotate(-180deg)' : 'rotate(0deg)',
              transition: 'transform 0.4s ease',
            } : undefined}
          />
        </ActionIcon>
      </Tooltip>
    ) : <></>;
  }

  // Render items using the order defined in configuration
  function itemRenderer(items: ItemRendererTypes[], collapsed: boolean): JSX.Element[] {
    if (!items || items?.length === 0) {
      console.warn(`Shell: No items defined in container`);
      return [<span key={`header-item-empty`}>{`[No elements found in container]`}</span>];
    }
    return ((items as ItemRendererTypes[]) || []).map((it, idx) => {
      const key = `header-item-${idx}-${it}`;
      switch (it) {
        case 'collapseToggle':
          return <NavCollapseToggle key={key} />;
        case 'logo':
          return <Logo key={key} collapsed={collapsed} />;
        case 'spacer':
          return <Space key={key} flex="auto" />;
        case 'mainTitle':
          return <Title key={key} order={4}>{mainControls.mainTitle?.label}</Title>;
        case 'themeSwitch':
          return <ThemeSwitch key={key} />;
        case 'mainMenu':
          return <MainMenu key={key} cfg={appCfg.menu} collapsed={collapsed} />;
        case 'userToolbar':
          return <NfToolbar key={key} cfg={appCfg.toolbars} items={shellCfg.userToolbar}
            onAction={actionHandler}
            isItemSelected={isMenuItemSelected}
          />;
        default:
          console.warn(`Shell: No header item found for '${it}'`);
          return <span key={key}>{`[${it}]`}</span>;
      }
    });
  }

  // Main contents rendered inside the shell
  const mainContents = (
    <Box p={16} h="100%" miw={800}>
      {viewResult?.listView ? (
        viewResult.listView.type === 'listView' ?
          (op ? (
            <NfForm op={op} />
          ) : (
            <NfListView
              viewSchema={viewResult.listView}
              records={viewResult.data[currentView]}
            />
          )) : (
            <ErrorPage
              message={errStr.noViewType.replace("{type}", viewResult.listView.type)}
              image={appCfg.errorImages?.noViewType || "fruit_basket"}
              fullHeight
            />
          )
      ) : (
        <ErrorPage
          message={errStr.viewMissing.replace("{view}", currentView)}
          image={appCfg.errorImages?.viewMissing || "beach_house"}
          fullHeight
        />
      )}
    </Box>
  );

  // Parameters for the shell layout
  const params = {
    mobileOpened: collapsible ? mobileOpened : true,
    desktopOpened: collapsible ? desktopOpened : true,
    expandedWidth,
    itemRenderer,
    mainContents
  };

  // #endregion

  return (shellCfg.navbar.collapsedWidth > 0) ?
    <SidebarIconsLayout {...params} /> :
    <FullyCollapsibleLayout {...params} />;
}

// #endregion
