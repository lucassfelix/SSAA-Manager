//
// Renders a generic error page with a message and an image.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from "react";
import { Center, Divider, Stack, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

import { RecordConfig, useAppUI } from "context";
import NfToolbar from "@/toolbar/Toolbar";
import FormLayout from "@/form/FormLayout";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function Login(): JSX.Element {

  // #region Hooks and variables

  const { appCfg, loginCfg } = useAppUI();
  const navigate = useNavigate();
  const loginConfig = loginCfg!;
  const fullHeight = loginConfig.options?.fullHeight;
  const width = loginConfig.options?.width;
  const op = 'edit';  // Always "edit" for login forms

  // Resolve toolbar items
  const resolvedToolbarItems = (loginConfig?.[op]?.toolbar ?? []).map((it: any) => {
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
    <Center h={fullHeight ? "100vh" : undefined} w="100%">
      <Stack gap="xl" w={width}>

        {/* Title */}
        <Title order={4}>{loginConfig?.[op]?.title}</Title>

        {/* Form layout */}
        <FormLayout
          op={op}
          recordCfg={loginConfig[op] as RecordConfig}
          formLayout={loginConfig.layout!}
          fields={appCfg.fields}
        />

        <Divider />

        {/* Toolbar */}
        <NfToolbar
          items={resolvedToolbarItems}
          cfg={{ ...appCfg.toolbars, ...appCfg.forms.toolbar }}
          onAction={handleAction}
          style={{flexDirection: 'column'}}
        />

      </Stack>
    </Center>
  );
}

// #endregion
