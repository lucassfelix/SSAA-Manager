//
// Fully collapsible shell component with header and navbar.
//

// #region --------------------------------------------------------------------------------- Imports

import { AppShell, Group, ScrollArea } from "@mantine/core";
import { type CollapsibleShellProps, ShellProps } from "./Shell";
import { useAppUI } from "context";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function FullyCollapsibleLayout({ mobileOpened, desktopOpened, expandedWidth,
  itemRenderer, mainContents }: CollapsibleShellProps) {

  // #region Hooks and variables

  const { appCfg } = useAppUI();
  const shellCfg = appCfg.shell as ShellProps;

  // #endregion

  return (
    <AppShell
      header={{ height: shellCfg.header.height }}
      layout={shellCfg.header.fullWidth ? 'default' : 'alt'}
      navbar={{
        width: expandedWidth,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      {/* Shell header */}
      <AppShell.Header withBorder={shellCfg.header.bordered}>
        <Group gap={8} h="100%" px="md" wrap="nowrap">
          {itemRenderer(shellCfg.header.items, false)}
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar
        withBorder={shellCfg.navbar.bordered}
      >

        {/* Navbar menu */}
        <AppShell.Section grow component={ScrollArea} p="sm">
          {itemRenderer(shellCfg.navbar.items, false)}
        </AppShell.Section>

        {/* Navbar footer */}
        {shellCfg.navbar.footer && <AppShell.Section p="sm">
          {itemRenderer(shellCfg.navbar.footerItems, false)}
        </AppShell.Section>}

      </AppShell.Navbar>

      {/* Main content */}
      <AppShell.Main style={{
        height: `calc(100vh - ${shellCfg.header.height}px)`,
        overflow: 'hidden'
      }}>
        {mainContents}
      </AppShell.Main>

    </AppShell>
  );
}

// #endregion
