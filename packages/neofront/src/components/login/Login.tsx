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

/**
 * Normalizes login input: username only, or local part if `@domain` was typed.
 * When `authEmailDomain` is set, builds the Supabase Auth email in the background.
 */
function resolveLoginIdentity(
  raw: string,
  authEmailDomain?: string,
): { username: string; authEmail: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { username: '', authEmail: '' };
  }

  const domain = authEmailDomain?.trim().replace(/^@+/, '').toLowerCase();
  let username = trimmed;

  const at = trimmed.indexOf('@');
  if (at > 0) {
    username = trimmed.slice(0, at);
    const typedDomain = trimmed.slice(at + 1).toLowerCase();
    if (domain && typedDomain === domain) {
      return { username, authEmail: `${username}@${domain}` };
    }
    return { username, authEmail: trimmed };
  }

  if (domain) {
    return { username, authEmail: `${username}@${domain}` };
  }

  return { username, authEmail: trimmed };
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function Login(): JSX.Element {

  // #region Hooks and variables

  const { appCfg, loginCfg, userSettings } = useAppUI();
  const navigate = useNavigate();
  const loginOptions = appCfg.login;
  const fullHeight = loginOptions.fullHeight;
  const themeCfg = userSettings.dark ? loginOptions.logo?.darkMode : loginOptions.logo?.lightMode;
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
        void (async () => {
          const usernameEl = document.querySelector<HTMLInputElement>('input[name="username"]');
          const passwordEl = document.querySelector<HTMLInputElement>('input[name="passwordInput"]');
          const { username: loginUsername, authEmail } = resolveLoginIdentity(
            usernameEl?.value ?? '',
            loginOptions.authEmailDomain,
          );
          const password = passwordEl?.value ?? '';

          if (!loginUsername) {
            window.alert('Informe o usuário.');
            return;
          }
          const baseUrl = appCfg.data?.apiBaseUrl?.replace(/\/$/, '');
          const creds = appCfg.data?.apiFetchCredentials;

          if (!baseUrl || appCfg.data?.source !== 'api') {
            console.error('Login: API data source or apiBaseUrl not configured');
            return;
          }

          try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            let loginBody: { ok?: boolean; username?: string } = {};

            if (supabaseUrl && supabaseAnonKey) {
              const { createClient } = await import('@supabase/supabase-js');
              const sb = createClient(supabaseUrl, supabaseAnonKey);
              const { data: authData, error: authErr } = await sb.auth.signInWithPassword({
                email: authEmail,
                password,
              });
              if (authErr || !authData.session?.access_token) {
                window.alert(authErr?.message || 'Falha no login Supabase.');
                return;
              }
              const resp = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                credentials: creds ?? 'include',
                body: JSON.stringify({ supabase_access_token: authData.session.access_token }),
              });
              if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                window.alert((err as { message?: string })?.message || 'Falha ao criar sessão no servidor.');
                return;
              }
              loginBody = await resp.json().catch(() => ({}));
            } else {
              const resp = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                credentials: creds ?? 'include',
                body: JSON.stringify({ username: loginUsername, password }),
              });
              if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                window.alert((err as { message?: string })?.message || 'Falha no login.');
                return;
              }
              loginBody = await resp.json().catch(() => ({}));
            }

            const appUsername = String(loginBody.username ?? '').trim() || loginUsername;

            try {
              if (appUsername) {
                localStorage.setItem('__nf_username', appUsername);
              }
              localStorage.setItem('__nf_username_valid', '1');
              sessionStorage.removeItem('__nf_loaded_cache');
            } catch (_e) {
              /* ignore */
            }
            navigate({
              pathname: '/',
              search: `?v=${encodeURIComponent(appCfg.listViews.defaultList)}`,
            }, { replace: true });
          } catch (e) {
            console.error(e);
            window.alert('Erro inesperado no login.');
          }
        })();
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

      <Stack
        gap="xl"
        w={loginOptions.width}
        style={{ alignItems: loginOptions.alignItems ?? 'flex-start' }}
      >

        {/* Title */}
        <Title order={4}>{loginCfg?.[op]?.title}</Title>

        {/* Logo */}
        {loginOptions.logo && (
          <Group justify="center" style={{ width: '100%' }}>
            <Image
              src={appCfg.paths.images + themeCfg?.image}
              alt={loginOptions?.logo?.altText ?? "Logo"}
              h={loginOptions?.logo?.height}
              w={loginOptions?.logo?.width}
              fit="contain"
            />
          </Group>
        )}

        {/* Form layout */}
        <FormLayout
          op={op}
          recordCfg={loginCfg?.[op] as RecordConfig}
          formLayout={loginCfg?.layout as FormLayoutSchema}
          fields={loginOptions.fields}
          style={{ width: '100%' }}
        />

        {/* Separator */}
        {loginOptions.toolbar?.upperBorder && <Divider />}

        {/* Toolbar */}
        <NfToolbar
          items={resolvedToolbarItems}
          cfg={{ ...appCfg.toolbars, ...appCfg.forms.toolbar }}
          onAction={handleAction}
          style={{ width: '100%', flexDirection: 'column' }}
        />

      </Stack>

      {appCfg.login.themeSwitch &&
        <ThemeSwitch style={{ position: "absolute", top: 10, right: 10 }} />
      }

    </Center>
  );
}

// #endregion
