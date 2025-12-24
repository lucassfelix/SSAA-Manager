//
// Toolbar component.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX, useState } from "react";
import { clsx } from "clsx";
import { ActionIcon, Box, Button, Divider, Group, Menu, Text, Tooltip } from "@mantine/core";

import { useAppUI } from "context";
import NfIcon from "@/icon/NfIcon";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface ToolbarThemeProps {
  horizontalPadding: number;
  verticalPadding: number;
  gap: number;
  upperBorder?: boolean;
  align?: 'left' | 'center' | 'right' | 'apart';
  position?: 'top' | 'bottom' | 'right';
  iconButtons?: {
    rotateSelected?: boolean;
    size?: number | string;
    radius?: number | string;
    filled?: boolean;
    selectedVariant?: string;
    regularVariant?: string;
    iconSize?: number;
    iconStroke?: number;
    selectedIcon?: string;
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
  texts?: {
    size?: number | string;
    fontWeight: number;
    width?: number;
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
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  class?: string;
}

interface ToolbarSubItem extends ToolbarItemBase {
  type?: 'menuItem' | 'separator';
}

export interface ToolbarItem extends ToolbarItemBase {
  type?: 'text' | 'title' | 'iconButton' | 'textButton' | 'separator' | 'spacer';
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
  items?: (string | ToolbarItem)[];
  cfg: ToolbarThemeProps;
  onAction?: (action: string, payload?: any) => void;
  isItemSelected?: (itemName: string) => boolean;
  className?: string;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfToolbar(props: NfToolbarProps): JSX.Element | null {

  // #region Hooks and variables

  const { cfg, items, onAction, isItemSelected } = props;

  if (!items) {
    console.warn("Toolbar: No items provided.");
    return null;
  }

  const { viewResult, appCfg, currentView } = useAppUI();

  const toolbarItems = items.map(item => {
    if (typeof item === 'object') {
      return item;
    }
    const btn = appCfg.controls[item] as ToolbarItem;
    if (!btn) {
      console.warn(`Toolbar: Control '${item}' not found.`);
    }
    return btn;
  }).filter(Boolean) ?? [];

  if (!cfg || !toolbarItems || toolbarItems.length === 0) {
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
  const fieldsCfg = viewResult.fieldConfig[currentView];
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
        .replace('{singular}', fieldsCfg?.strings?.singular || fieldsCfg?.name)
        .replace('{plural}', fieldsCfg?.strings?.plural || fieldsCfg?.name)
        ;
    }

    function renderSeparator(key: string): JSX.Element {
      return <Divider key={key} orientation="vertical" />;
    }

    function renderSpacer(key: string): JSX.Element {
      return <Box key={key} flex="1" />;
    }

    function renderText(it: ToolbarItem, key: string): JSX.Element {
      return (
        <Text
          key={key}
          fw={cfg.texts?.fontWeight}
          styles={{ root: { fontSize: cfg.texts?.size } }}
          style={cfg.texts?.width ? { minWidth: cfg.texts.width } : undefined}
        >
          {it.text}
        </Text>
      );
    }

    function renderTitle(it: ToolbarItem, key: string): JSX.Element {
      return (
        <Text
          key={key}
          fw={cfg.titles?.fontWeight}
          styles={{ root: { fontSize: cfg.titles?.size } }}
          style={cfg.titles?.width ? { minWidth: cfg.titles.width } : undefined}
        >
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
      return (it.tip && !it.disabled) ? (
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
            className={clsx(`nf-Button-${textBtnVariant}`, it.class ? `nf-${it.class}` : undefined)}
            aria-label={it.label ?? name}
            radius={cfg.textButtons?.radius}
            onClick={() => handleClick(it)}
            disabled={it.disabled === true}
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
            disabled={it.disabled === true}
            className={it.class ? `nf-${it.class}` : undefined}
          >
            {renderIcon(it.icon!, it.selected)}
          </ActionIcon>
        );
      }
    }

    function renderDropDownButton(key: string, it: ToolbarItem): JSX.Element {
      return <Menu position="bottom-start" offset={0} key={key}>
        <Menu.Target>
          <div style={{ display: 'inline-flex' }}>
            {renderSimpleButton(it, key)}
          </div>
        </Menu.Target>
        <Menu.Dropdown>
          {it.items?.map((mi: ToolbarSubItem, idx: number) => {
            if (mi.type === 'separator') {
              return <Menu.Divider key={`${key}-mdiv-${idx}`} />;
            }
            return (
              <Menu.Item
                key={`${key}-mitem-${idx}`}
                onClick={() => handleClick(mi)}
                disabled={mi.disabled === true}
                leftSection={mi.selectable ?
                  <NfIcon
                    icon={isItemSelected && isItemSelected(mi.action!) ?
                      iconBtnConfig?.selectedIcon || "check" : "_blank"}
                    size={iconBtnConfig?.iconSize}
                    stroke={iconBtnConfig?.iconStroke}
                  />
                  : undefined}
              >
                {mi.label ?? `[${mi.name}]`}
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>;
    }

    function renderButton(it: ToolbarItem, key: string): JSX.Element {
      return Array.isArray(it.items) ? renderDropDownButton(key, it) : renderSimpleButton(it, key);
    }

    // #endregion

    switch (item.type) {
      case 'separator':
        return renderSeparator(keyName);
      case 'spacer':
        return renderSpacer(keyName);
      case 'text':
        return renderText(item, keyName);
      case 'title':
        return renderTitle(item, keyName);
      case 'iconButton':
      case 'textButton':
        return renderButton(item, keyName);
      default:
        console.warn(`Toolbar: Toolbar item ${item.name} type is unknown: "${item.type}"`);
        return <span key={keyName}>[{item.name}]</span>;
    }
  }

  // #endregion

  return (
    <Group
      wrap="nowrap"
      gap={gap}
      px={horizontalPadding}
      py={verticalPadding}
      justify={justifyOptions[align || 'left']}
      className={clsx("nf-toolbar", props.className)}
    >
      {toolbarItems.map((it, idx) => {
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
