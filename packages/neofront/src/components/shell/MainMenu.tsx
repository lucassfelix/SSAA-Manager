//
// Component that renders the main menu.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Divider, NavLink, Stack, Menu, Indicator, Tooltip } from '@mantine/core';

import NfIcon from '@/icon/NfIcon';
import { useAppUI } from "context";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface MainMenuProps {
  openSubmenusOnHover?: boolean;
  submenuOffset: number;
  items: {
    gap?: number | string;
    radius?: number | string;
    labelSize?: number | string;
    labelWeight?: number | string;
    subtitleSize?: number | string;
    subtitleWeight?: number | string;
    subtitleUppercase?: boolean;
    descriptionSize?: number | string;
    descriptionWeight?: number | string;
    iconFilled?: boolean;
    iconSize?: number | string;
    iconStroke?: number;
    arrowIcon?: string;
    arrowSize?: number;
    arrowStroke?: number;
  };
  submenuItems: {
    gap?: number | string;
    radius: number | string;
    labelSize?: number | string;
    labelWeight?: number | string;
    subtitleSize?: number | string;
    subtitleWeight?: number | string;
  }
}

// Minimal menu item type used by the renderer
export interface MenuItem {
  name?: string;
  label?: string;
  description?: string;
  type?: 'separator' | 'subtitle' | 'menuItem';
  icon?: string;
  emphasis?: string;
  badge?: string | number;
  badgeEmphasis?: string;
  items?: MenuItem[];
};

interface NfMenuProps {
  cfg: MainMenuProps;
  collapsed?: boolean;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function MainMenu({ cfg, collapsed = false }: NfMenuProps) {

  // #region Hooks and variables

  if (!cfg) {
    console.warn('MainMenu: no configuration provided');
    return null;
  }

  const { appCfg, menuCfg, currentView } = useAppUI();
  const [_searchParams, setSearchParams] = useSearchParams();
  const opacityTransition = { opacity: collapsed ? 0 : 1, transition: 'opacity 200ms ease' };
  const submenuCfg = {...cfg.items, ...cfg.submenuItems };

  // #endregion

  // #region Renderers

  function renderIcon(it: MenuItem, depth: number) {
    const iconSize = cfg.items.iconSize;
    const iconComponent = (
      <NfIcon
        icon={it.icon!}
        size={iconSize}
        stroke={cfg.items.iconStroke}
        color={it.emphasis ? `var(--mantine-color-${it.emphasis})` : undefined}
        filled={cfg.items.iconFilled}
      />
    );

    if (depth == 0 && appCfg.shell.navbar.icons) {
      return (it.icon ? (it.badge ? (
        <Indicator inline processing disabled={!collapsed} size={7}
          color={`var(--mantine-color-${it.badgeEmphasis})`}>
          {iconComponent}
        </Indicator>) : (iconComponent)
      ) :
        (<span style={{ display: 'inline-block', width: iconSize, height: iconSize }} />));
    } else {
      return undefined;
    }
  }

  function renderBadge(it: MenuItem) {
    return it.badge && !collapsed ? (
      <Badge
        size="md"
        color={`var(--mantine-color-${it.badgeEmphasis})`}
        style={{ '--badge-padding-x': 'var(--badge-padding-x-sm)' }}
      >{it.badge}</Badge>
    ) : undefined;
  }

  function renderSeparator(depth: number, key: string) {
    return depth >= 1 ? (
      <Menu.Divider key={`${key}-div`} />
    ) : (
      <Divider
        key={`${key}-div`}
        my="xs"
        style={opacityTransition} />
    );
  }

  function renderSubtitle(it: MenuItem, depth: number, key: string) {

    return depth >= 1 ? (
      <Menu.Label
        key={`${key}-lbl`}
        style={{
          textTransform: submenuCfg.subtitleUppercase ? "uppercase" : undefined
        }}
        styles={{
          label: {
            fontSize: submenuCfg.subtitleSize,
            fontWeight: submenuCfg.subtitleWeight
          }
        }}
      >{it.label}</Menu.Label>
    ) : (
      <Divider
        key={`${key}-lbl`}
        my="xs"
        label={it.label}
        style={{
          ...opacityTransition,
          textTransform: cfg.items.subtitleUppercase ? "uppercase" : undefined,
        }}
        styles={{
          label: {
            fontSize: cfg.items.subtitleSize,
            fontWeight: cfg.items.subtitleWeight
          }
        }}
      />
    );
  }

  function renderTooltip(it: MenuItem, depth: number, key: string, node: JSX.Element) {
    // HACK: The initial condition below ensures that when the navbar is collapsed, the submenu
    // is opened when clicked, but in this case we lose the tooltip.
    return ((!cfg.openSubmenusOnHover ? !it.items : true) && collapsed && depth === 0 && it.label) ? (
      <Tooltip key={key}
        label={it.label + (it.description ? `: ${it.description}` : '') +
          (it.badge ? ` (${it.badge})` : '')}
        position="right"
      >{node}</Tooltip>
    ) : node;
  }

  function renderItems(items: MenuItem[], prefix = '', depth = 0): JSX.Element[] {
    return items.map((it, idx) => {
      const key = it.name ? `${prefix}${it.name}` : `${prefix}anon-${idx}`;

      if (it.type === 'separator') {
        return renderSeparator(depth, key);
      } else if (it.type === 'subtitle') {
        return renderSubtitle(it, depth, key);
      } else if (it.type === 'menuItem') {
        // Render menu item
      } else if (it.type !== undefined) {
        console.warn(`MainMenu: type "${it.type}" is not recognized in menu item "${it.label || key}"`);
      }

      // Properties that are used for all menu items, either with sub-items or not
      const commonProps = {
        label: it.label,
        leftSection: renderIcon(it, depth),
        description: depth === 0 ? it.description : undefined,
        styles: {
          root: {
            borderRadius: cfg.items.radius,
          },
          label: {
            fontSize: cfg.items.labelSize,
            fontWeight: cfg.items.labelWeight,
          },
          description: {
            fontSize: cfg.items.descriptionSize,
            fontWeight: cfg.items.descriptionWeight,
          }
        },
        onClick: () => {
          // Navigate to the view if this is a leaf item with a view name
          if (it.name && !it.items) {
            setSearchParams({ v: it.name }, { replace: false });
          }
        }
      };

      const isActive = it.name ? it.name === currentView : false;

      if (it.items) {
        // Has sub-items, render as a flyout menu
        return (
          <Menu
            shadow="md"
            position="right-start"
            trigger={cfg.openSubmenusOnHover ? "hover" : undefined}
            offset={cfg.submenuOffset}
            radius={cfg.submenuItems.radius ?? cfg.items.radius}
            key={key}
          >
            <Menu.Target>
              {renderTooltip(it, depth, key,
                <NavLink
                  key={key}
                  {...commonProps}
                  rightSection={<NfIcon
                    icon={cfg.items.arrowIcon || 'chevronRight'}
                    size={cfg.items.arrowSize}
                    stroke={cfg.items.arrowStroke} />} />
              )}
            </Menu.Target>
            <Menu.Dropdown className='nf-submenu'>
              <Stack gap={cfg.submenuItems.gap ?? cfg.items.gap}>
                {renderItems(it.items, key ? `${key}-` : '', depth + 1)}
              </Stack>
            </Menu.Dropdown>
          </Menu>
        );
      } else {
        // Leaf item
        return renderTooltip(it, depth, key,
          depth >= 1 ? (
            <Menu.Item
              key={key}
              leftSection={renderIcon(it, depth)}
              rightSection={renderBadge(it)}
              onClick={commonProps.onClick}
              className={isActive ? 'nf-active' : ''}
              styles={{
                itemLabel: {
                  fontSize: submenuCfg.labelSize,
                  fontWeight: submenuCfg.labelWeight,
                }
              }}
            >
              {it.label}
            </Menu.Item>
          ) : (
            <NavLink
              key={key}
              {...commonProps}
              rightSection={renderBadge(it)}
              active={isActive}
            />
          )
        );
      }
    });
  }

  // #endregion

  return (
    <Stack gap={cfg.items.gap} id="main-menu-stack">
      {renderItems(menuCfg.items as MenuItem[], '')}
    </Stack>
  );
}

// #endregion
