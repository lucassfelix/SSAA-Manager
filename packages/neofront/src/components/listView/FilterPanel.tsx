//
// Filter panel wrapper for lists.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from 'react';
import { Box, Collapse, Divider } from '@mantine/core';

import { useAppUI } from "context";
import NfForm from "@/form/Form";
import { FilterPanelConfig } from "./DataTable";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

interface FilterPanelProps {
  schema?: FilterPanelConfig;
  open: boolean;
  onAction?: (action: string, payload?: any) => void;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function FilterPanel({ schema, open, onAction }: FilterPanelProps): JSX.Element | null {

  // #region Hooks and context

  if (!schema || !schema.layout) {
    return <Box mt={9} mb={8} />;
  }

  const { appCfg } = useAppUI();
  const filterCfg = appCfg.listViews.filterPanel;
  const transitionMs = filterCfg.transitionDuration ?? 200;
  const vPadding = filterCfg.verticalPadding || 0;

  // #endregion

  return (
    <>
      <Divider
        mt={open ? 16 : 8}
        mb={open ? 8 + vPadding : 8}
        opacity={open ? 1 : 0}
        style={{ transition: `margin ${transitionMs}ms ease, opacity ${transitionMs}ms ease` }}
      />

      <Collapse
        in={open}
        transitionDuration={transitionMs}
        keepMounted
      >
        <NfForm
          op="filter"
          onAction={onAction}
        />
      </Collapse>

      <Box
        style={{
          minHeight: open ? 8 + vPadding : 0,
          transition: `height ${transitionMs}ms ease`
        }}
      />
    </>
  );
}

// #endregion
