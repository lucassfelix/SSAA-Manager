//
// Delete confirmation wrapper.
//

// #region --------------------------------------------------------------------------------- Imports

import type { JSX } from 'react';

import { useAppUI } from 'context';
import MessageBox from './MessageBox';
import { replaceVars } from '@/app/mainUtils';

// #endregion

// #region ----------------------------------------------------------------------------------- Types

interface DeleteBoxProps {
  record: Record<string, any> | null;
  viewName: string;
  idAccessor: string;
  nameAccessor: string;
  onClose: () => void;
  onDeleted?: () => void;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function DeleteBox(props: DeleteBoxProps): JSX.Element | null {
  const { record, viewName, idAccessor, nameAccessor, onClose, onDeleted } = props;
  const { appCfg, viewResult } = useAppUI();

  if (!record) {
    return null;
  }

  console.log('DeleteBox record:', record);
  const fieldsCfg = viewResult?.fieldConfig?.[viewName];
  const message = replaceVars(appCfg.strings.deleteItemConfirm ?? '', {
    fieldsCfg,
    record,
    idAccessor,
    nameAccessor,
  });

  async function doDelete() {
    if (appCfg.data?.source !== 'api' || !appCfg.data.apiBaseUrl) {
      console.warn('DeleteBox: API data source not configured');
      return;
    }

    const baseUrl = appCfg.data.apiBaseUrl.replace(/\/$/, '');
    const idVal = record?.[idAccessor];
    const response = await fetch(
      `${baseUrl}/record/${encodeURIComponent(viewName)}/${encodeURIComponent(String(idVal))}?idAccessor=${encodeURIComponent(idAccessor)}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      throw new Error('Failed to delete record');
    }

    onDeleted?.();
  }

  return (
    <MessageBox
      title={appCfg.strings.deleteItemTitle}
      message={message}
      items={appCfg.listViews.messageBox.deleteControls}
      icon={'help'}
      iconClass={'warning'}
      onClose={onClose}
      onDelete={() => { doDelete().catch(e => console.error(e)); }}
    />
  );
}

// #endregion
