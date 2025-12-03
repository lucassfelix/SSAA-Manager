//
// Helpers for masked text fields and formatted values.
//

// #region --------------------------------------------------------------------------------- Imports

import IMask from 'imask';

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface MaskSpec {
  pattern: string;
  digits?: number;
}

// #endregion

// #region ------------------------------------------------------------------------------- Functions

// Simple, dependency-free formatter for display purposes. Used in data table columns.
export function applyMask(value: any, mask?: MaskSpec) {
  
  if (!mask) {
    return value;
  }

  let raw = value == null ? '' : String(value);

  if (mask.digits) {
    raw = raw.replace(/\D/g, '');
    if (raw === '') {
      return '';
    }
    raw = raw.padStart(mask.digits, '0');
  }

  const masked = IMask.createMask({ mask: mask.pattern });
  masked.resolve(raw);
  return masked.value || '[error]';
}

// Hook to compute mask config and default value for masked input fields.
export function useMask(value: any, mask?: MaskSpec) {

  let imaskConfig: string | undefined = undefined;
  let defValue = value;

  if (mask) {
    if (mask.digits) {
      const raw = value == null ? '' : String(value).replace(/\D/g, '');
      if (raw !== '') {
        defValue = raw.padStart(mask.digits, '0');
      }
    }
    imaskConfig = mask.pattern;
  }

  return { imaskConfig, defValue };
}

// #endregion
