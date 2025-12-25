//
// Renders a generic error page with a message and an image.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from "react";
import { Center, Divider, Group, Image, Stack, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

import { FormLayoutSchema, RecordConfig, useAppUI } from "context";
import NfToolbar from "@/toolbar/Toolbar";
import FormLayout from "@/form/FormLayout";
import ThemeSwitch from "@/shell/ThemeSwitch";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function Login(): JSX.Element {

  // #region Hooks and variables

  const { appCfg, loginCfg, userSettings } = useAppUI();
  const navigate = useNavigate();
  const loginOptions = appCfg.login;
  const fullHeight = loginOptions.fullHeight;
  const width = loginOptions.width;
  const themeCfg = userSettings.dark ? loginOptions.logo.darkMode : loginOptions.logo.lightMode;
  const op = 'edit';  // Always "edit" for login forms

  // Resolve toolbar items
  const resolvedToolbarItems = (loginCfg?.[op]?.toolbar ?? []).map((it: any) => {
    if (typeof it === 'string') {
      return appCfg.controls[it] as any;
    }
    return { ...(it as object) } as any;
  });

  // Handler for toolbar actions
  const handleAction = (action: string) => {
    switch (action) {
      case 'login':
        try {
          sessionStorage.removeItem('__nf_loaded_cache');
        } catch (_e) {
          /* ignore */
        }
        navigate({
          pathname: '/',
          search: `?v=${encodeURIComponent(appCfg.listViews.defaultList)}`,
        }, { replace: true });
        return;
      case 'forgotPassword':
        console.log("Forgot password clicked");
        break;
      default:
        break;
    }
  };

  // #endregion

  return (
    <Center
      h={fullHeight ? "100vh" : undefined}
      w="100%"
      className="nf-login"
      style={{ position: "relative" }}
    >

      <Stack gap="xl" w={width}>

        {/* Title */}
        <Title order={4}>{loginCfg?.[op]?.title}</Title>

        {/* Logo */}
        <Group justify="center">
          <Image
            src={appCfg.paths.images + themeCfg.image}
            alt={loginOptions?.logo?.altText ?? "Logo"}
            h={loginOptions?.logo?.height}
            w={loginOptions?.logo?.width}
            fit="contain"
          />
        </Group>

        {/* Form layout */}
        <FormLayout
          op={op}
          recordCfg={loginCfg?.[op] as RecordConfig}
          formLayout={loginCfg?.layout as FormLayoutSchema}
          fields={loginOptions.fields}
        />

        {/* Separator */}
        {loginOptions.toolbar?.upperBorder && <Divider />}

        {/* Toolbar */}
        <NfToolbar
          items={resolvedToolbarItems}
          cfg={{ ...appCfg.toolbars, ...appCfg.forms.toolbar }}
          onAction={handleAction}
          style={{ flexDirection: 'column' }}
        />

      </Stack>

      {appCfg.login.themeSwitch &&
        <ThemeSwitch style={{ position: "absolute", top: 10, right: 10 }} />
      }

    </Center>

  );
}

// #endregion
