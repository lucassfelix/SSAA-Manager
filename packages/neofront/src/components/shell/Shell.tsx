//
// Main shell component for NeoFront applications.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX, ReactNode } from "react";
import { Space, Tooltip, Title, Box, Group, ActionIcon, Center, Loader } from "@mantine/core";
import { Image } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

import { useAppUI } from "context";
import ThemeSwitch from "./ThemeSwitch";
import FullyCollapsibleLayout from "./FullyCollapsibleLayout";
import SidebarIconsLayout from "./SidebarIconsLayout";
import MainMenu, { MainMenuProps } from "./MainMenu";

import NfForm, { FormOperationType } from "@/form/Form";
import ErrorPage from "@/errorpage/ErrorPage";
import NfListView from "@/listView/ListView";
import NfIcon from "@/icon/NfIcon";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

/** Types accepted by the item renderer */
type ItemRendererTypes = 'collapseToggle' | 'logo' | 'spacer' | 'title' | 'themeSwitch' | 'mainMenu';

/** Shell layout configuration */
export interface ShellProps {
  header: {
    fullWidth?: boolean;
    height: number;
    bordered: boolean;
    items: ItemRendererTypes[];
  },
  navbar: {
    width: number;
    collapsible: boolean;
    collapsedWidth: number;
    bordered: boolean;
    icons: boolean;
    footer: boolean;
    items: ItemRendererTypes[];
    footerItems: ItemRendererTypes[];
  },
  menu: MainMenuProps;
  title?: {
    label: string;
  };
  toggleNavbar?: {
    rotateIcon?: boolean;
    native?: boolean;
    tipCollapse: string;
    tipExpand: string;
  };
  themeSwitcher: {
    tipLight: string;
    tipDark: string;
  };
  logo: {
    collapsedHeight: number;
    expandedHeight: number;
    collapsedWidth: number;
    expandedWidth: number;
    altText: string;
  }
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

export default function Shell() {

  // #region Hooks and variables

  const { appCfg, userSettings, setUserSettings, currentView, currentOp, viewResult,
    isReady } = useAppUI();
  const op = currentOp as FormOperationType;

  const shellCfg = appCfg.shell as ShellProps;
  const errStr = appCfg.errorStrings;
  const expandedWidth = shellCfg.navbar.width || 240;
  const themeCfg = appCfg.theme.modes[userSettings.dark ? 'dark' : 'light'];
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const desktopOpened = !userSettings.navbarCollapsed;
  const collapsible = shellCfg.navbar.collapsible;
  const toggleCfg = shellCfg.toggleNavbar!;

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
          alt={shellCfg.logo.altText ?? "Logo"}
          h={collapsed ? shellCfg.logo.collapsedHeight : shellCfg.logo.expandedHeight}
          w={ collapsed ? shellCfg.logo.collapsedWidth : shellCfg.logo.expandedWidth }
          fit="contain"
        />
      </Group>
    );
  }

  // Render items using the order defined in configuration
  function itemRenderer(items: ItemRendererTypes[], collapsed: boolean): JSX.Element[] {
    if (!items || items?.length === 0) {
      console.warn(`No items defined in container`);
      return [<span key={`header-item-empty`}>{`[No elements found in container]`}</span>];
    }
    return ((items as ItemRendererTypes[]) || []).map((it, idx) => {
      const key = `header-item-${idx}-${it}`;
      switch (it) {
        case 'collapseToggle':
          return <span key={key}>{navCollapseToggle}</span>;
        case 'logo':
          return <Logo key={key} collapsed={collapsed} />;
        case 'spacer':
          return <Space key={key} flex="auto" />;
        case 'title':
          return <Title key={key} order={4}>{shellCfg.title?.label}</Title>;
        case 'themeSwitch':
          return <ThemeSwitch key={key} />;
        case 'mainMenu':
          return <MainMenu key={key} cfg={appCfg.shell.menu} collapsed={collapsed} />;
        default:
          console.warn(`No header item found for '${it}'`);
          return <span key={key}>{`[No element found: ${it}]`}</span>;
      }
    });
  }

  // Navbar collapse/expand toggle
  const navCollapseToggle = collapsible ? (
    <Tooltip label={desktopOpened ? toggleCfg.tipCollapse : toggleCfg.tipExpand}>
      <ActionIcon
        size={appCfg.forms.toolbar?.iconButton?.size}
        radius={appCfg.forms.toolbar?.iconButton?.radius}
        title={desktopOpened ? toggleCfg.tipCollapse : toggleCfg.tipExpand}
        variant="subtle"
        color="var(--mantine-primary-color-light-color)"
        onClick={() => { handleToggleDesktop(); toggleMobile(); }}
      >
        <NfIcon
          icon="menu"
          style={toggleCfg.rotateIcon ? {
            transform: desktopOpened ? 'rotate(-180deg)' : 'rotate(0deg)',
            transition: 'transform 0.4s ease',
          } : undefined}
        />
      </ActionIcon>
    </Tooltip>
  ) : <></>;

  // Main contents rendered inside the shell

  const mainContents = (
    <Box p={16} h="100%" miw={800}>
      {!isReady ? (
        <Center h="100%">
          <Loader size="lg" />
        </Center>
      ) : viewResult.listView ? (
        viewResult.listView.type === 'listView' ?
          (op ? <NfForm op={op} /> : <NfListView />) : (
            <ErrorPage
              message={errStr.noViewType.replace("{type}", viewResult.listView.type)}
              image="fruit_basket"
              fullHeight
            />
          )
      ) : (
        <ErrorPage
          message={errStr.viewMissing.replace("{view}", currentView)}
          image="beach_house"
          fullHeight
        />
      )}
    </Box>
  );

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
