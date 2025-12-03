//
// Partially collapsible shell component with header and navbar with icons and tooltips.
//

// #region --------------------------------------------------------------------------------- Imports

import { AppShell, Group, ScrollArea } from "@mantine/core";

import { useAppUI } from "context";
import { type CollapsibleShellProps, ShellProps } from "./Shell";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function SidebarIconsLayout({ mobileOpened, desktopOpened, expandedWidth,
  itemRenderer, mainContents }: CollapsibleShellProps) {

  // #region Hooks and variables

  const { appCfg } = useAppUI();
  const shellCfg = appCfg.shell as ShellProps;
  const collapsedWidth = shellCfg.navbar.collapsedWidth;

  // #endregion

  return (
    <AppShell
      header={{ height: shellCfg.header.height }}
      layout={shellCfg.header.fullWidth ? 'default' : 'alt'}
      navbar={{
        width: desktopOpened ? expandedWidth : collapsedWidth,
        breakpoint: 'sm',
        // Keep navbar visible on desktop; we control width ourselves
        collapsed: { mobile: !mobileOpened, desktop: false },
      }}
    >
      {/* Shell header */}
      <AppShell.Header withBorder={shellCfg.header.bordered}>
        <Group gap={16} h="100%" px="md" wrap="nowrap">
          {itemRenderer(shellCfg.header.items, false)}
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar
        withBorder={shellCfg.navbar.bordered}
        style={{ transition: 'width 200ms ease', willChange: 'width', overflowX: 'hidden' }}
      >

        {/* Navbar menu */}
        <ScrollArea scrollbarSize={10} scrollHideDelay={200} scrollbars="y"
          style={{ height: `calc(100vh - ${shellCfg.header.height}px)` }}>
          <AppShell.Section grow p="sm" style={{ width: '100%', overflowX: 'hidden' }}>
            {itemRenderer(shellCfg.navbar.items, !desktopOpened)}
          </AppShell.Section>
        </ScrollArea>

        {/* Navbar footer */}
        {shellCfg.navbar.footer && (
          <div style={{ width: '100%' }}>
            <AppShell.Section p="sm" style={{ width: '100%' }}>
              {itemRenderer(shellCfg.navbar.footerItems, !desktopOpened)}
            </AppShell.Section>
          </div>
        )}

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
