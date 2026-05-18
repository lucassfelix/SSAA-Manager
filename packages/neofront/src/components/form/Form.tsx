//
// Wrapper for record forms.
//

// #region --------------------------------------------------------------------------------- Imports

import type { JSX } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Divider, Group, ScrollArea, Stack, Title } from "@mantine/core";

import { useAppUI } from "context";
import { getValueByPath } from '@/listView/datatableUtils';
import NfToolbar from "@/toolbar/Toolbar";
import FormLayout from './FormLayout';
import TabbedLayout from './TabbedLayout';
import ErrorPage from '@/errorpage/ErrorPage';
import DeleteBox from '@/messageBox/DeleteBox';
import { getFormValues, hasAllRequired } from './validation';
import { RecordConfig } from "context";
import { withApiFetchCredentials } from '@/app/mainUtils';

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export type FormOperationType = "filter" | "edit" | "add" | "detail";

const allowedOps = ["edit", "add", "detail"] as const;
type AllowedOp = typeof allowedOps[number];

interface FormProps {
  op: FormOperationType;
  onAction?: (action: string, payload?: any) => void;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfForm(props: FormProps): JSX.Element {

  // #region Hooks and context

  const { op, onAction } = props;
  const { appCfg, viewResult, currentView, currentRecordId, currentSearchParams } = useAppUI();

  if (!viewResult) {
    return (
      <ErrorPage
        message={appCfg.errorStrings.formMissing.replace("{type}", op).replace("{view}", currentView)}
        image={appCfg.errorImages?.formMissing || "forest"}
      />
    );
  }

  const nameAccessor = viewResult.listView.config?.nameAccessor ?? 'name';
  const idAccessor = viewResult.listView.config?.idAccessor ?? 'id';
  const records = viewResult.data[currentView];
  const navigate = useNavigate();
  const record = currentRecordId ? records?.find(r => String(getValueByPath(r, idAccessor)) ===
    String(currentRecordId)) : undefined;
  
  const prefillRecord = useMemo(() => {
    if (op !== 'add') {
      return undefined;
    }
    const prefill: Record<string, any> = {};
    for (const [key, value] of currentSearchParams.entries()) {
      if (key !== 'v' && key !== 'op' && key !== 'id' && key !== 'tab') {
        prefill[key] = value;
      }
    }
    return Object.keys(prefill).length > 0 ? prefill : undefined;
  }, [op, currentSearchParams]);
  
  const effectiveRecord = record ?? prefillRecord;
  const name = effectiveRecord ? getValueByPath(effectiveRecord, nameAccessor) : undefined;
  const isFilter = op === 'filter';
  const formCfg = isFilter ? { ...appCfg.forms, ...appCfg.listViews.filterPanel } : appCfg.forms;
  const recordCfg = (allowedOps.includes(op as AllowedOp) ? viewResult.form[op as AllowedOp] : {}) as RecordConfig;
  const toolbarCfg = isFilter ? { ...formCfg.toolbar, ...appCfg.listViews.filterToolbar } : formCfg.toolbar;
  const toolbarItems = isFilter ? viewResult.listView.filterPanel?.toolbar : recordCfg.toolbar;
  const hasToolbar = Boolean(toolbarItems?.length);

  const formRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const recomputeRef = useRef<() => void>(() => {});
  const [deleteRequest, setDeleteRequest] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});

  const requiredNames = useMemo(() => {
    if (op !== 'add' && op !== 'edit') {
      return [];
    }
    const fields = viewResult.fieldConfig?.[currentView]?.fields ?? {};
    return Object.entries(fields)
      .filter(([, def]: any) => def?.required && def?.enabled !== false && def?.readOnly !== true)
      .map(([name]) => name);
  }, [currentView, op, viewResult.fieldConfig]);

  const filterKeys = useMemo(() => {
    if (op !== 'add' && op !== 'edit') {
      return [] as string[];
    }
    const fields = viewResult.fieldConfig?.[currentView]?.fields ?? {};
    return Object.values(fields)
      .map((def: any) => def?.dataType === 'select' ? def?.options?.filter : null)
      .filter((v: any): v is string => typeof v === 'string' && v.length > 0);
  }, [currentView, op, viewResult.fieldConfig]);

  function scheduleRecompute() {
    if (rafRef.current != null) {
      return;
    }
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      recomputeValidity();
    });
  }

  function recomputeValidity() {
    if (requiredNames.length === 0 && filterKeys.length === 0) {
      setIsValid(true);
      return;
    }

    const values = getFormValues(formRef.current);

    if (filterKeys.length > 0) {
      const next: Record<string, unknown> = {};
      for (const k of filterKeys) {
        next[k] = values[k];
      }
      setFilterValues(prev => {
        const changed = Object.keys(next).some(k => prev[k] !== next[k]) || Object.keys(prev).some(k => !(k in next));
        return changed ? next : prev;
      });
    }

    setIsValid(requiredNames.length === 0 ? true : hasAllRequired(values, requiredNames));
  }

  recomputeRef.current = recomputeValidity;

  useEffect(() => {
    recomputeValidity();
  }, [currentRecordId, requiredNames.length]);

  useEffect(() => {
    if (op !== 'add' && op !== 'edit') {
      return;
    }
    const handler = () => setTimeout(() => recomputeRef.current(), 0);
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [op, requiredNames.length]);

  // Compute whether previous/next records exist and prepare toolbar items
  const recordsList = records ?? [];
  const curIndex = currentRecordId ? recordsList.findIndex(r =>
    String(getValueByPath(r, idAccessor)) === String(currentRecordId)) : -1;
  const hasPrev = curIndex > 0;
  const hasNext = curIndex !== -1 && curIndex < recordsList.length - 1;

  // Prepare toolbar items with disabled state for previous/next buttons
  const resolvedToolbarItems = (toolbarItems ?? []).map((it: string | Record<string, unknown>) => {
    if (typeof it === 'string') {
      const btn = appCfg.controls[it] as any;
      if (!btn) {
        return it;
      }
      // clone to avoid mutating global config
      const copy = { ...btn } as any;
      if (it === 'previous') {
        copy.disabled = !hasPrev;
      } else if (it === 'next') {
        copy.disabled = !hasNext;
      } else if (it === 'send') {
        copy.disabled = !isValid;
      };
      return copy;
    }

    const copy = { ...(it as object) } as any;
    if (copy.action === 'previous') {
      copy.disabled = !hasPrev;
    } else if (copy.action === 'next') {
      copy.disabled = !hasNext;
    } else if (copy.action === 'send') {
      copy.disabled = !isValid;
    };
    return copy;
  });

  // Preset handlers for toolbar actions
  function navigateToAdjacent(offset: number) {
    try {
      const recordsList = records ?? [];
      const curId = currentRecordId;
      const idx = recordsList.findIndex(r => String(getValueByPath(r, idAccessor)) === String(curId));
      if (idx === -1) {
        return;
      };
      const targetIdx = idx + offset;
      if (targetIdx < 0 || targetIdx >= recordsList.length) {
        return;
      }
      const target = recordsList[targetIdx];
      const targetId = String(getValueByPath(target, idAccessor));
      navigate(`/?v=${currentView}&op=${op}&id=${targetId}`);
    } catch (_e) {
      // ignore navigation errors
    }
  }

  // Navigate back to list view by removing op and id parameters
  function navigateToListView() {
    const params = new URLSearchParams(currentSearchParams);
    params.delete('op');
    params.delete('id');
    navigate(`/?${params.toString()}`, { replace: true });
  }

  async function saveRecord() {
    if (appCfg.data?.source !== 'api' || !appCfg.data.apiBaseUrl) {
      console.warn('Form: API data source not configured');
      return;
    }

    const baseUrl = appCfg.data.apiBaseUrl.replace(/\/$/, "");
    const payload = getFormValues(formRef.current);

    if (op === 'add') {
      const response = await fetch(`${baseUrl}/record/${currentView}`, withApiFetchCredentials(appCfg.data, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      }));
      if (!response.ok) {
        let msg = 'Failed to save record';
        try {
          const err = await response.json();
          msg = err?.sqlMessage || err?.message || msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const result = await response.json();
      const newId = result?.insertId;
      if (newId != null) {
        navigate(`/?v=${currentView}&op=detail&${idAccessor}=${newId}`);
      } else {
        navigateToListView();
      }
      return;
    }

    if (op === 'edit') {
      const response = await fetch(
        `${baseUrl}/record/${currentView}/${encodeURIComponent(String(currentRecordId))}?idAccessor=${encodeURIComponent(idAccessor)}`,
        withApiFetchCredentials(appCfg.data, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        })
      );
      if (!response.ok) {
        let msg = 'Failed to update record';
        try {
          const err = await response.json();
          msg = err?.sqlMessage || err?.message || msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      navigateToListView();
    }
  }

  // Handler for toolbar actions
  const handleAction = (action: string) => {
    switch (action) {
      case 'cancel':
        navigateToListView();
        break;
      case 'send':
        saveRecord().catch(e => console.error(e));
        break;
      case 'edit':
        navigate(`/?v=${currentView}&op=edit&id=${currentRecordId}`);
        break;
      case 'delete':
        setDeleteRequest(true);
        break;
      case 'previous':
        navigateToAdjacent(-1);
        break;
      case 'next':
        navigateToAdjacent(+1);
        break;
      default:
        onAction?.(action);
        break;
    }
  };

  const toolbarComponent = (
    <NfToolbar
      items={resolvedToolbarItems}
      cfg={{ ...appCfg.toolbars, ...toolbarCfg }}
      onAction={handleAction}
    />
  );

  // Choose TabbedLayout if layout has tabs, otherwise FormLayout
  const layout = isFilter ? viewResult.listView.filterPanel?.layout : viewResult.form.layout;
  const hasTabs = layout?.tabs && Array.isArray(layout.tabs) && layout.tabs.length > 0;

  const formLayoutComponent = hasTabs ? (
    <TabbedLayout
      key={currentRecordId || 'new'}
      op={op}
      recordCfg={recordCfg}
      record={effectiveRecord}
      values={filterValues}
    />
  ) : (
    <FormLayout
      key={currentRecordId || 'new'}
      op={op}
      recordCfg={recordCfg}
      record={effectiveRecord}
      formLayout={viewResult.form.layout}
      values={filterValues}
    />
  );

  function getToolbarPosition(): "top" | "bottom" | "right" | null {
    if (!hasToolbar) {
      return null;
    }
    if (toolbarCfg?.position === "top") {
      return "top";
    } else if (isFilter && toolbarCfg?.position === "right") {
      return "right";
    } else {
      return "bottom";
    }
  }

  const toolbarPosition = getToolbarPosition();

  const formBox = (
    <Box ref={formRef} onChange={scheduleRecompute} style={{ width: '100%' }}>
      {formLayoutComponent}
    </Box>
  );

  // #endregion

  return (
    <Stack gap={formCfg.verticalGap} h={formCfg.fullHeight ? "100%" : "auto"}>

      <DeleteBox
        record={deleteRequest ? (effectiveRecord ?? null) : null}
        viewName={currentView}
        idAccessor={idAccessor}
        nameAccessor={nameAccessor}
        onClose={() => setDeleteRequest(false)}
        onDeleted={navigateToListView}
      />

      {/* Title */}
      {recordCfg.title && <Title order={4}>{recordCfg.title.replace("{name}", name)}</Title>}

      {/* Toolbar */}
      {toolbarPosition === "top" ? (
        <Stack>
          {toolbarComponent}
          {formCfg.toolbar?.upperBorder && <Divider />}
        </Stack>
      ) : null}

      {/* Form layout */}
      <ScrollArea>
        {toolbarPosition === "right" ? (
          <Group align="flex-end">
            {formBox}
            {/* Inline toolbar */}
            <Box flex={1} />
            {hasToolbar ? toolbarComponent : null}
          </Group>
        ) : (
          formBox
        )}
      </ScrollArea>

      {/* Toolbar */}
      {toolbarPosition === "bottom" ? (
        <Stack>
          {formCfg.toolbar?.upperBorder && <Divider />}
          {toolbarComponent}
        </Stack>
      ) : null}

    </Stack>
  );
}

// #endregion
