//
// Wrapper for record forms.
//

// #region --------------------------------------------------------------------------------- Imports

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
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
        message={appCfg.errorStrings.formMissing.replace("{type}", op).replace("{view}",
          currentView)}
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
  const isFilter = op === 'filter';
  const formCfg = isFilter ? { ...appCfg.forms, ...appCfg.listViews.filterPanel } : appCfg.forms;
  const recordCfg = (allowedOps.includes(op as AllowedOp) ?
    viewResult.form[op as AllowedOp] : {}) as RecordConfig;
  const toolbarCfg = isFilter ? { ...formCfg.toolbar, ...appCfg.listViews.filterToolbar } : formCfg.toolbar;
  const toolbarItems = isFilter ? viewResult.listView.filterPanel?.toolbar : recordCfg.toolbar;
  const hasToolbar = Boolean(toolbarItems?.length);

  // Build form schema with initial values prefilled from record

  // Preset handlers for toolbar actions
  const handleAction = (action: string) => {
    switch (action) {
      case 'cancel':
        navigate(-1);
        break;
      case 'send':
        // TODO: fetch the current field values
        console.log(`Action: ${action}`);
        navigate(-1);
        break;
      default:
        onAction?.(action);
        break;
    }
  };

  const toolbarComponent = (
    <NfToolbar
      items={toolbarItems}
      cfg={{ ...appCfg.toolbars, ...toolbarCfg }}
      onAction={handleAction} />
  );

  const formLayoutComponent = (
    <FormLayout
      key={currentRecordId || 'new'}
      op={op}
      recordCfg={recordCfg}
      record={record} />
  );

  // #endregion

  function getToolbarPosition(): "top" | "bottom" | "right" | null {
    if(!hasToolbar) {
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
  console.log(isFilter, toolbarPosition);

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
