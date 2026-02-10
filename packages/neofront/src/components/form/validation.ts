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

  const result: Record<string, unknown> = {};
  const wrappers = Array.from(root.querySelectorAll<HTMLElement>('[data-field-props]'));

  for (const wrapper of wrappers) {
    const name = wrapper.getAttribute('data-field-props');
    if (!name) {
      continue;
    }

    const dateBtn = wrapper.querySelector<HTMLButtonElement>('button[data-dates-input]');
    if (dateBtn) {
      const hasPlaceholder = Boolean(dateBtn.querySelector('.mantine-InputPlaceholder-placeholder'));
      const text = (dateBtn.textContent ?? '').trim();
      result[name] = (!text || hasPlaceholder) ? null : text;
      continue;
    }

    const controls = Array.from(wrapper.querySelectorAll<HTMLInputElement | HTMLSelectElement |
      HTMLTextAreaElement>('input,select,textarea'));
    if (controls.length === 0) {
      continue;
    }

    const checkbox = controls.find((el): el is HTMLInputElement => el
      instanceof HTMLInputElement && el.type === 'checkbox');
    if (checkbox) {
      result[name] = checkbox.checked;
      continue;
    }

    const hiddenInputs = controls.filter((el): el is HTMLInputElement => el
      instanceof HTMLInputElement && el.type === 'hidden');
    const visible = controls.filter((el) => !(el instanceof HTMLInputElement && el.type === 'hidden'));

    if (hiddenInputs.length > 0) {
      const vals = hiddenInputs.map(i => i.value).filter(v => v !== '');
      const uniq = Array.from(new Set(vals));
      if (uniq.length <= 1) {
        result[name] = uniq[0] ?? null;
      } else {
        result[name] = uniq;
      }
      continue;
    }

    const val = (visible[0] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | undefined)?.value ?? '';
    result[name] = val === '' ? null : val;
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
