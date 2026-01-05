//
// Auxiliary functions for the main app
//

// #region --------------------------------------------------------------------------------- Imports

import { useEffect } from "react";

import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

import { AppProps, ViewResultProps } from "context";
import { getValueByPath } from "@/listView/datatableUtils";

// #endregion

// #region ------------------------------------------------------------------------------- Functions

/** Set document title based on current URL and view metadata. */
export function setDocumentTitle(appCfg: AppProps, currentView: string,
  viewResult: ViewResultProps | undefined, searchParams: URLSearchParams) {

  let pageName = currentView;
  const listView = viewResult?.listView;
  const op = searchParams.get('op');

  switch (op) {
    case 'detail':
    case 'edit':
      if (viewResult?.data) {
        const nameAccessor = listView?.config?.nameAccessor ?? 'name';
        const idAccessor = listView?.config?.idAccessor ?? 'id';
        const idVal = searchParams.get(idAccessor);
        const record = idVal ? (viewResult?.data[currentView] ?? []).find((r: any) =>
          String(getValueByPath(r, idAccessor) ?? '') === idVal) : undefined;
        const resolved = record ? getValueByPath(record, nameAccessor) : undefined;
        pageName = resolved ? resolved as string : `${pageName} ${idAccessor} ${idVal}`;
      }
      break;
    case 'add':
      if (viewResult?.form.add?.title) {
        pageName = viewResult?.form.add.title;
      }
      break;
    default: { // listView
      const viewTitle = listView?.toolbar?.find((it) => it.type === 'title');
      if (viewTitle?.text) {
        pageName = viewTitle.text;
      }
      break;
    }
  }

  // Build title from template
  const titleTpl = appCfg.strings.appTitle || '{pageName}';
  const version = appCfg.strings.appVersion || '';
  document.title = titleTpl.replace('{pageName}', pageName).replace('{version}', version);
}

/**
 * Toggles between two classes on a DOM element.
 * @param element The target DOM element.
 * @param trueClass The class to add when value is true.
 * @param falseClass The class to add when value is false.
 * @param value The boolean value to determine which class to add.
 */
export function useToggleClass(element: HTMLElement | null, trueClass: string,
  falseClass: string, value: boolean) {

  useEffect(() => {
    if (!element) {
      return;
    }
    // remove both then add only the chosen one
    element.classList.remove(trueClass, falseClass);
    element.classList.add(value ? trueClass : falseClass);
    return () => element.classList.remove(trueClass, falseClass);
  }, [trueClass, falseClass, value]);

}

/** Hook for tracking field elements and sending bounds to parent window in embedded mode. */
export function useEmbedTracking() {

  useEffect(() => {
    let lastTarget: HTMLElement | null = null;
    let isEnabled = true;

    /** Clear the bounds of the last tracked element. */
    const clearBounds = () => {
      window.parent.postMessage(
        { type: 'element-bounds', x: null, y: null, width: 0, height: 0, classList: [] }, '*'
      );
      lastTarget = null;
    };

    /** Find the nearest field element at the given coordinates. */
    const findFieldElement = (x: number, y: number) => {
      const target = document.elementFromPoint(x, y) as HTMLElement | null;
      if (!target || target === document.documentElement || target === document.body) {
        return null;
      }
      let current: HTMLElement | null = target;
      while (current && current !== document.body) {
        if (current.classList.contains('nf-field')) {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    };

    /** Post field element bounds and info to parent window. */
    const postFieldMessage = (fieldElement: HTMLElement, msgType: string) => {
      const rect = fieldElement.getBoundingClientRect();
      const name = fieldElement.getAttribute('data-field-props') || '{}';
      const payload: any = {
        type: msgType,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        classList: Array.from(fieldElement.classList),
        name
      };
      window.parent.postMessage(payload, '*');
    };

    /** Handle incoming messages from the parent window. */
    const handleMessage = (e: MessageEvent) => {
      // Allow parent to disable/enable tracking
      if (e.data?.type === 'gui-tracking-toggle') {
        isEnabled = e.data.enabled ?? true;
        if (!isEnabled) {
          clearBounds();
        }
        return;
      }

      if (!isEnabled) {
        return;
      }

      if (e.data?.type === 'gui-mousemove') {
        const { x, y } = e.data;
        const fieldElement = findFieldElement(x, y);
        if (!fieldElement) {
          if (lastTarget !== null) {
            clearBounds();
          }
          return;
        }
        if (fieldElement === lastTarget) {
          return;
        }
        lastTarget = fieldElement;
        postFieldMessage(fieldElement, 'element-bounds');
        return;
      }

      if (e.data?.type === 'gui-click') {
        const { x, y } = e.data;
        const fieldElement = findFieldElement(x, y);
        if (!fieldElement) {
          window.parent.postMessage({ type: 'element-click', x: null }, '*');
          return;
        }
        postFieldMessage(fieldElement, 'element-click');
        return;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
}

/** Perform extensions to dayjs. */
export function extendDayjs(locale: string) {

  dayjs.locale(locale);
  dayjs.extend(relativeTime);

  // Fix for Brazilian Portuguese weekdays abbreviations
  if (locale == 'pt-br') {
    dayjs.extend(updateLocale);
    dayjs.updateLocale(locale, { weekdaysMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] });
  }
}

// #endregion
