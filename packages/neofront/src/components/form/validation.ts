//
// Form validation helpers.
//

// #region ------------------------------------------------------------------------------- Functions

function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  return false;
}

// #endregion

// #region -------------------------------------------------------------------------------- Exports

export function getFormValues(root: HTMLElement | null): Record<string, unknown> {
  if (!root) {
    return {};
  }

  const names = Array.from(root.querySelectorAll<HTMLElement>('[data-field-props]'))
    .map(el => el.getAttribute('data-field-props'))
    .filter((v): v is string => Boolean(v));

  const result: Record<string, unknown> = {};
  for (const name of new Set(names)) {
    const inputs = Array.from(
      root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        `[name="${CSS.escape(name)}"]`
      )
    );
    if (inputs.length === 0) {
      continue;
    }
    if (inputs.length > 1) {
      result[name] = inputs.map(i => (i as HTMLInputElement).value).filter(v => v !== "");
      continue;
    }

    const input = inputs[0] as HTMLInputElement;
    if (input.type === 'checkbox') {
      result[name] = input.checked;
    } else {
      result[name] = input.value === "" ? null : input.value;
    }
  }

  return result;
}

export function hasAllRequired(values: Record<string, unknown>, requiredNames: string[]): boolean {
  return requiredNames.every((name) => {
    if (!(name in values)) {
      return true;
    }
    return !isBlank(values[name]);
  });
}

// #endregion
