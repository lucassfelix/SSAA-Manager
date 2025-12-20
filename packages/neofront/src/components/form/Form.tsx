//
// Wrapper for record forms.
//

// #region --------------------------------------------------------------------------------- Imports

import type { JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Divider, Group, ScrollArea, Stack, Title } from "@mantine/core";

import { useAppUI } from "context";
import { getValueByPath } from '@/listView/datatableUtils';
import NfToolbar from "@/toolbar/Toolbar";
import FormLayout from './FormLayout';
import ErrorPage from '@/errorpage/ErrorPage';
import { RecordConfig } from 'src/contexts/FormProps';

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
  const { appCfg, viewResult, currentView, currentRecordId } = useAppUI();

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
  const record = currentRecordId ? records?.find(r => String(getValueByPath(r, idAccessor)) ===
    String(currentRecordId)) : undefined;
  const name = record ? getValueByPath(record, nameAccessor) : undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const isFilter = op === 'filter';
  const formCfg = isFilter ? { ...appCfg.forms, ...appCfg.listViews.filterPanel } : appCfg.forms;
  const recordCfg = (allowedOps.includes(op as AllowedOp) ?
    viewResult.form[op as AllowedOp] : {}) as RecordConfig;
  const toolbarCfg = isFilter ? { ...formCfg.toolbar, ...appCfg.listViews.filterToolbar } : formCfg.toolbar;
  const toolbarItems = isFilter ? viewResult.listView.filterPanel?.toolbar : recordCfg.toolbar;
  const hasToolbar = Boolean(toolbarItems?.length);

  // Compute whether previous/next records exist and prepare toolbar items
  const recordsList = records ?? [];
  const curIndex = currentRecordId ? recordsList.findIndex(r =>
    String(getValueByPath(r, idAccessor)) === String(currentRecordId)) : -1;
  const hasPrev = curIndex > 0;
  const hasNext = curIndex !== -1 && curIndex < recordsList.length - 1;

  // Prepare toolbar items with disabled state for previous/next buttons
  const resolvedToolbarItems = (toolbarItems ?? []).map(it => {
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
      };
      return copy;
    }

    const copy = { ...(it as object) } as any;
    if (copy.action === 'previous') {
      copy.disabled = !hasPrev;
    } else if (copy.action === 'next') {
      copy.disabled = !hasNext;
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
    const params = new URLSearchParams(location.search);
    params.delete('op');
    params.delete('id');
    const target = location.pathname + (params.toString() ? `?${params.toString()}` : '');
    navigate(target, { replace: true });
  }

  // Handler for toolbar actions
  const handleAction = (action: string) => {
    switch (action) {
      case 'cancel':
        navigateToListView();
        break;
      case 'send':
        // TODO: fetch the current field values
        console.log(`Action: ${action}`);
        navigateToListView();
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

  const formLayoutComponent = (
    <FormLayout
      key={currentRecordId || 'new'}
      op={op}
      recordCfg={recordCfg}
      record={record}
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

  // #endregion

  return (
    <Stack gap={formCfg.verticalGap} h={formCfg.fullHeight ? "100%" : "auto"}>

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
            {formLayoutComponent}
            {/* Inline toolbar */}
            <Box flex={1} />
            {hasToolbar ? toolbarComponent : null}
          </Group>
        ) : formLayoutComponent}
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
