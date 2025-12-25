//
// Switch used to toggle between light and dark themes.
//

// #region --------------------------------------------------------------------------------- Imports

import { CSSProperties, JSX } from "react";
import { useMantineColorScheme, Tooltip, ActionIcon } from "@mantine/core";

import { useAppUI } from "context";
import NfIcon from "@/icon/NfIcon";

// #endregion

interface ThemeSwitchProps {
  style?: CSSProperties;
}

// #region ------------------------------------------------------------------------------- Component

/**
 * Switch between light and dark themes.
 * @returns The theme switch component.
 */
export default function ThemeSwitch(props: ThemeSwitchProps): JSX.Element {

  // #region Hooks and variables

  const { style } = props;
  const { appCfg, userSettings, setUserSettings } = useAppUI();
  const { colorScheme, setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const switcherCfg = appCfg.topControls.themeSwitch;
  const label = userSettings.dark ? switcherCfg?.tipLight : switcherCfg?.tipDark;
  const iconBtnConfig = appCfg.toolbars.iconButtons;

  const togggleTheme = (): void => {
    const next = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(next);
    setUserSettings({ ...userSettings, dark: next === "dark" });
  };

  // #endregion

  return (
    <Tooltip label={label}>
      <ActionIcon
        variant="default"
        size={appCfg.forms.toolbar?.iconButtons?.size ?? appCfg.toolbars?.iconButtons?.size}
        radius={appCfg.forms.toolbar?.iconButtons?.radius}
        aria-label={label}
        onClick={() => togggleTheme()}
        style={style}
      >
        <NfIcon
          icon={userSettings.dark ? "sun" : "moon"}
          size={iconBtnConfig?.iconSize}
          stroke={iconBtnConfig?.iconStroke}
          filled={iconBtnConfig?.filled}
        />
      </ActionIcon>
    </Tooltip>
  );

}

// #endregion
