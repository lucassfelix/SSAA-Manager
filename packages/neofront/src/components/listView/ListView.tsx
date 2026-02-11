//
// List view component with toolbar, filter panel, and data table.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack } from "@mantine/core";

import { ListViewProps, useAppUI } from "context";
import NfToolbar, { ToolbarItem } from "@/toolbar/Toolbar";
import NfDataTable from "@/listView/DataTable";
import FilterPanel from "@/listView/FilterPanel";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

interface NfListViewProps {
  viewSchema: ListViewProps;
  records: Record<string, any>[];
  parentView?: string;
  parentRecordId?: string | number;
};

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfListView(props: NfListViewProps): JSX.Element {

  // #region Hooks and variables

  const { appCfg, userSettings, setUserSettings, currentView, viewResult } = useAppUI();
  const { viewSchema, records, parentView, parentRecordId } = props;
  const withPanel = viewSchema?.filterPanel;
  const navigate = useNavigate();
  const filterOpen = userSettings.views?.[currentView!]?.filterPanelOpen ?? false;

  // Map toolbar items: strings to appCfg.lists.buttons, objects as-is
  const toolbarItems: ToolbarItem[] = (viewSchema?.toolbar ?? []).map(
    (item: string | ToolbarItem) => {
      if (typeof item === 'string') {
        const btn = appCfg.controls?.[item];
        if (!btn) {
          console.warn(`ListView: Toolbar button '${item}' not found in appCfg.controls.`);
        }
        return btn;
      }
      return item;
    }
  ).filter(Boolean) as ToolbarItem[];

  const toggleFilterPanelState = () => {
    setUserSettings({
      ...userSettings,
      views: {
        ...(userSettings.views || {}),
        [currentView!]: {
          ...(userSettings.views?.[currentView!] || {}),
          filterPanelOpen: !filterOpen,
        }
      }
    });
  };

  // Preset handlers for toolbar actions
  const handleAction = (action: string, _payload: any) => {
    const targetView = viewSchema.name || currentView;
    const params = new URLSearchParams({ v: targetView, op: 'add' });
    console.log(`Action: ${action}, Payload: ${_payload}`);
    switch (action) {
      case 'add':
        if (parentView && parentRecordId != null) {
          params.set(`${parentView.replace(/s$/, '')}_id`, String(parentRecordId));
        }
        navigate(`?${params.toString()}`);
        return;
      case 'toggleFilterPanel':
        toggleFilterPanelState();
        return;
      case 'edit':
        navigate(`?v=${targetView}&op=edit&id=${_payload}`);
        return;
      case 'closeFilterPanel':
        if (filterOpen) {
          toggleFilterPanelState();
        }
        return;
      default:
        console.log(`Action: ${action}`);
        return;
    }
  };

  // #endregion

  return (
    <Stack gap={0} h="100%">

      {/* Toolbar */}
      {toolbarItems && toolbarItems.length > 0 && (
        <NfToolbar
          items={toolbarItems.map(it => it.action === 'toggleFilterPanel' ?
            { ...it, selected: filterOpen } : it)}
          cfg={appCfg.toolbars}
          onAction={handleAction}
          fieldsCfg={viewResult?.fieldConfig?.[viewSchema.name]}
        />
      )}

      {/* Filter panel */}
      <FilterPanel
        schema={withPanel ? viewSchema.filterPanel : undefined}
        open={filterOpen}
        onAction={handleAction}
      />

      {/* Data table (the Box assures smooth transition when the filter panel is present) */}
      <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <NfDataTable viewSchema={viewSchema} records={records} />
      </Box>

    </Stack>
  );
}

// #endregion
