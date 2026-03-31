# `login.json` Reference

**Schema:** `schemas/form.schema.json` (login uses a form layout)
**Location:** `project/login.json` OR inline in `project/app.json` under `login`

The login screen is configured as a form layout. It can live in two places:

1. **Separate file** (`project/login.json`) — referenced by `main.tsx` as `loginCfg`
2. **Inline** in `app.json` under the `"login"` key

Both patterns are valid. Use the separate file to keep `app.json` lean.

---

## `login.json` (separate file)

```json
{
  "$schema": "../../../../schemas/form.schema.json",
  "name": "login",
  "layout": {
    "sections": [
      {
        "initialState": "noheader",
        "columns": [
          [
            "username",
            "password"
          ]
        ]
      }
    ]
  },
  "add": {
    "toolbar": ["login", "forgotPassword"]
  }
}
```

The `add` operation is used as the login form action. Its `toolbar` controls
what buttons appear (login submit, forgot password link, etc.).

Field definitions for the login form (`username`, `password`, etc.) must be
declared in the `"login"` section of `app.json` under `login.fields`.

---

## Inline login config in `app.json`

When the login configuration is inlined, it lives under the `login` key in
`app.json`:

```json
"login": {
  "fullHeight": true,
  "width": 400,
  "alignItems": "center",
  "themeSwitch": true,
  "logo": {
    "height": 80,
    "width": 200,
    "altText": "Logo",
    "lightMode": { "image": "logo-light.svg" },
    "darkMode":  { "image": "logo-dark.svg" }
  },
  "toolbar": {
    "upperBorder": false
  },
  "fields": {
    "username": {
      "label": "Usuário",
      "dataType": "string",
      "placeholder": "Nome de usuário",
      "required": true
    },
    "password": {
      "label": "Senha",
      "dataType": "passwordInput",
      "placeholder": "Senha",
      "required": true
    }
  }
}
```

---

## Login config properties (in `app.json`)

| Property | Type | Description |
|----------|------|-------------|
| `fullHeight` | boolean | The login form container takes full viewport height |
| `width` | number | Login card width in px |
| `alignItems` | string | Vertical alignment of the login card (`"center"`, `"flex-start"`) |
| `themeSwitch` | boolean | Show a theme toggle on the login screen |
| `logo.height` | number | Logo height on the login screen |
| `logo.width` | number | Logo width |
| `logo.altText` | string | Alt text |
| `logo.lightMode.image` | string | Logo filename for light mode (relative to `paths.images`) |
| `logo.darkMode.image` | string | Logo filename for dark mode |
| `toolbar.upperBorder` | boolean | Whether the login button toolbar has a top border |
| `fields` | object | Field definitions for the login form (same shape as `fields.json` fields) |

---

## Login form layout

When `login.json` is a separate file, it uses the standard `form.schema.json`
sections/tabs layout. The field keys in the layout reference the `fields`
defined in `app.json login.fields`.

When using the inline pattern, the layout is implicit (single column of all
`login.fields` in order).

---

## Common field types for login

```json
"fields": {
  "username": {
    "label": "Usuário",
    "dataType": "string",
    "placeholder": "Seu nome de usuário",
    "required": true
  },
  "password": {
    "label": "Senha",
    "dataType": "passwordInput",
    "placeholder": "Sua senha",
    "required": true
  }
}
```

Use `"dataType": "passwordInput"` (not `"password"`) for the login password
field. `"password"` is for displaying a locked/hidden value; `"passwordInput"`
is the actual input field with show/hide toggle.
