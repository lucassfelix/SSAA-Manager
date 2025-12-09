//
// Toolbar component (metadata-driven).
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX, useState } from "react";
import { ActionIcon, Button, Divider, Group, Menu, Text, Tooltip } from "@mantine/core";
import NfIcon from "@/icon/NfIcon";
import { useAppUI } from "context";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface ToolbarThemeProps {
  horizontalPadding: number;
  verticalPadding: number;
  gap: number;
  upperBorder?: boolean;
  align?: 'left' | 'center' | 'right' | 'apart';
  iconButtons?: {
    rotateSelected?: boolean;
    size?: number | string;
    radius?: number | string;
    filled?: boolean;
    selectedVariant?: string;
    regularVariant?: string;
    iconSize?: number;
    iconStroke?: number;
  };
  textButtons?: {
    size?: number | string;
    radius?: number | string;
    defaultVariant?: string;
    regularVariant?: string;
    fontSize?: number | string;
    fontWeight?: number;
    uppercase?: boolean;
  };
  titles?: {
    size?: number | string;
    fontWeight: number;
    width?: number;
  };
}

interface ToolbarItemBase {
  type?: string;
  name?: string;
  label?: string;
  toggle?: boolean;
  action?: string;
  selected?: boolean;
}

interface ToolbarSubItem extends ToolbarItemBase {
  type?: 'menuItem' | 'separator';
}

export interface ToolbarItem extends ToolbarItemBase {
  type?: 'text' | 'iconButton' | 'textButton' | 'separator';
  icon?: string;
  tip?: string;
  selectedTip?: string;
  text?: string;
  default?: boolean;
  items?: ToolbarSubItem[];
}

interface ToolbarItemProps {
  item: ToolbarItem;
  keyName: string;
}

interface NfToolbarProps {
  items: ToolbarItem[];
  cfg: ToolbarThemeProps;
  onAction?: (action: string, payload?: any) => void;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfToolbar({ items, cfg, onAction }: NfToolbarProps): JSX.Element | null {

  // #region Hooks and variables

  const { viewResult, appCfg } = useAppUI();

  if (!cfg || !items || items.length === 0) {
    return null;
  }

  const { align, gap, horizontalPadding, verticalPadding } = cfg;
  const justifyOptions = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    apart: 'space-between',
  };

  const iconBtnConfig = cfg.iconButtons;
  const listCfg = viewResult?.listView;
  const tbCfg = { ...appCfg.toolbars, ...appCfg.forms.toolbar } as ToolbarThemeProps;

  // #endregion

  // #region Toolbar item component

  function ToolbarItem({ item, keyName }: ToolbarItemProps): JSX.Element | null {

    // #region Hooks and renderers

    const [_version, setVersion] = useState(0); // forces re-render on toggle

    if (!item) {
      return null;
    }

    const handleClick = (it: ToolbarItemBase) => {
      if (it.action) {
        onAction?.(it.action);
      }
      if (it.toggle) {
        it.selected = !it.selected; setVersion(v => v + 1);
      }
    };

    function replaceVars(str: string): string {
      return str
        .replace('{singular}', listCfg?.strings?.singular || listCfg?.name)
        .replace('{plural}', listCfg?.strings?.plural || listCfg?.name)
        ;
    }

    function renderSeparator(key: string): JSX.Element {
      return <Divider key={key} orientation="vertical" />;
    }

    function renderText(it: ToolbarItem, key: string): JSX.Element {
      return (
        <Text key={key} fw={cfg.titles?.fontWeight} styles={{ root: { fontSize: cfg.titles?.size } }}
          style={cfg.titles?.width ? { minWidth: cfg.titles.width } : undefined}>
          {it.text}
        </Text>
      );
    }

    function renderIcon(icon: string, selected?: boolean): JSX.Element {
      return <NfIcon
        icon={icon}
        size={iconBtnConfig?.iconSize}
        stroke={iconBtnConfig?.iconStroke}
        filled={iconBtnConfig?.filled}
        style={iconBtnConfig?.rotateSelected ? {
          transform: selected ? 'rotate(-180deg)' : 'rotate(0deg)',
          transition: 'transform 0.4s ease',
        } : undefined}
      />;
    }

    function renderTooltip(it: ToolbarItem, key: string, node: JSX.Element) {
      return (it.tip) ? (
        <Tooltip
          key={key}
          label={<span dangerouslySetInnerHTML={{
            __html: it.selected ? replaceVars(it.selectedTip ?? "") : replaceVars(it.tip ?? "")
          }} />}
          position="top"
        >{node}</Tooltip>
      ) : node;
    }

    function renderSimpleButton(it: ToolbarItem, key: string): JSX.Element {

      const name = it.name ? replaceVars(it.name) : undefined;

      if (it.type === 'textButton') {
        const textBtnVariant = it.default ? tbCfg.textButtons?.defaultVariant || 'filled' :
          tbCfg.textButtons?.regularVariant || 'outline';
        return renderTooltip(it, key,
          <Button
            key={key}
            size={cfg.textButtons?.size ? String(cfg.textButtons.size) : undefined}
            variant={textBtnVariant}
            className={`nf-Button-${textBtnVariant}`}
            aria-label={it.label ?? name}
            radius={cfg.textButtons?.radius}
            onClick={() => handleClick(it)}
            fz={cfg.textButtons?.fontSize ?? undefined}
            fw={cfg.textButtons?.fontWeight ?? undefined}
            style={{
              textTransform: cfg.textButtons?.uppercase ? "uppercase" : undefined
            }}
          >{it.label ?? `[${name}]`}</Button>);
      } else {
        const iconBtnVariant = it.selected ? tbCfg.iconButtons?.selectedVariant || 'filled' :
          tbCfg.iconButtons?.regularVariant || 'subtle';
        return renderTooltip(it, key,
          <ActionIcon
            key={key}
            size={iconBtnConfig?.size}
            variant={iconBtnVariant}
            aria-label={name ?? it.icon}
            radius={iconBtnConfig?.radius}
            onClick={() => handleClick(it)}
          >
            {renderIcon(it.icon!, it.selected)}
          </ActionIcon>
        );
      }
    }

    function renderMenuButton(it: ToolbarItem, key: string): JSX.Element {
      return Array.isArray(it.items) ? (
        <Menu position="bottom-start" offset={0} key={key}>
          <Menu.Target>
            <div style={{ display: 'inline-flex' }}>
              {renderSimpleButton(it, key)}
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            {it.items?.map((mi: ToolbarSubItem, idx: number) =>
              mi.type === 'separator' ? (
                <Menu.Divider key={`${key}-mdiv-${idx}`} />
              ) : (
                <Menu.Item key={`${key}-mitem-${idx}`} onClick={() => handleClick(mi)}>
                  {mi.label ?? `[${mi.name}]`}
                </Menu.Item>
              )
            )}
          </Menu.Dropdown>
        </Menu>
      ) : (
        renderSimpleButton(it, key)
      );
    }

    // #endregion

    switch (item.type) {
      case 'separator':
        return renderSeparator(keyName);
      case 'text':
        return renderText(item, keyName);
      case 'iconButton':
      case 'textButton':
        return renderMenuButton(item, keyName);
      default:
        console.warn(`Toolbar item ${item.name} type is unknown: "${item.type}"`);
        return <span key={keyName}>[{item.name}]</span>;
    }
  }

  // #endregion

  return (
    <Group gap={gap} px={horizontalPadding} py={verticalPadding}
      justify={justifyOptions[align || 'left']}>
      {items.map((it, idx) => {
        const keyName = `toolbar-item-${idx}`;
        return <ToolbarItem
          key={keyName}
          keyName={keyName}
          item={it}
        />;
      })}
    </Group>
  );
}

// #endregion
