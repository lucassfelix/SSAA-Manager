//
// Switch used to toggle between light and dark themes.
//

// #region --------------------------------------------------------------------------------- Imports

import { useMantineColorScheme, Tooltip, ActionIcon } from "@mantine/core";

import { useAppUI } from "context";
import type { ShellProps } from "./Shell";
import NfIcon from "../icon/NfIcon";

// #endregion

// #region ------------------------------------------------------------------------------- Component

/**
 * Switch between light and dark themes.
 * @returns The theme switch component.
 */
export default function ThemeSwitch() {

  // #region Hooks and variables

  const { appCfg, userSettings, setUserSettings } = useAppUI();
  const { colorScheme, setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const switcherCfg = (appCfg.shell as ShellProps).themeSwitcher;
  const label = userSettings.dark ? switcherCfg.tipLight : switcherCfg.tipDark;

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
        size="lg"
        aria-label={label}
        onClick={() => togggleTheme()}
      >
        <NfIcon icon={userSettings.dark ? "sun" : "moon"} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );

}

// #endregion
