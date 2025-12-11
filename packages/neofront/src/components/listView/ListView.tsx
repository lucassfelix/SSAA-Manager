//
// List view component with toolbar, filter panel, and data table.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack } from "@mantine/core";

import { useAppUI } from "context";
import NfToolbar, { ToolbarItem } from "@/toolbar/Toolbar";
import NfDataTable from "@/listView/DataTable";
import FilterPanel from "@/listView/FilterPanel";

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function NfListView(): JSX.Element {

  // #region Hooks and variables

  const { appCfg, viewResult, userSettings, setUserSettings, currentView } = useAppUI();
  const listViewSchema = viewResult?.listView;
  const withPanel = listViewSchema?.filterPanel;
  const navigate = useNavigate();
  const filterOpen = userSettings.views?.[currentView!]?.filterPanelOpen ?? false;

  // Map toolbar items: strings to appCfg.lists.buttons, objects as-is
  const toolbarItems: ToolbarItem[] = (listViewSchema?.toolbar ?? []).map(
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
    switch (action) {
      case 'add':
        navigate(`?v=${currentView}&op=add`);
        return;
      case 'toggleFilterPanel':
        toggleFilterPanelState();
        return;
      case 'edit':
        console.log(currentView);
        navigate(`?v=${currentView}&op=edit&id=${_payload}`);
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
        />
      )}

      {/* Filter panel */}
      <FilterPanel
        schema={withPanel ? listViewSchema.filterPanel : undefined}
        open={filterOpen}
        onAction={handleAction}
      />

      {/* Data table (the Box assures smooth transition when the filter panel is present) */}
      <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <NfDataTable />
      </Box>

    </Stack>
  );
}

// #endregion
