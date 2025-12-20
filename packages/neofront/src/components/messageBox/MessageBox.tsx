//
// Neofront Modal Component
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Divider, MantineFontSize, Modal, Stack, Text } from '@mantine/core';

import { useAppUI } from 'context';
import NfToolbar, { ToolbarItem } from '@/toolbar/Toolbar';

// #endregion

// #region ----------------------------------------------------------------------------------- Types

interface NfModalProps {
  title: string;
  message: string;
  items: ToolbarItem[];
  onClose: () => void;
  onDelete: () => void;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function MessageBox(props: NfModalProps): JSX.Element {
  // #region Props and hooks

  const { title, message, items, onClose, onDelete } = props;
  const [opened, { open, close }] = useDisclosure(false);
  const { appCfg } = useAppUI();
  const cfg = appCfg.listViews.modalToolbar;

  // Open modal when mounted
  useEffect(() => { open(); }, []);

  function handleAction(action: string): void {
    if (action === 'close' || action === 'cancel') {
      (() => { onClose(); close(); })();
    } else if (action === 'delete') {
      (() => { onDelete(); onClose(); close(); })();
    }
  }

  // #endregion

  return (
    <Modal
      title={title}
      opened={opened}
      onClose={() => { handleAction('close'); }}
    >
      <>
        <Text
          size={cfg.texts?.size as MantineFontSize || 'sm'}
          fw={cfg.texts?.fontWeight || 500}
          mt="sm"
          mb="xl"
        >{message}</Text>
        <Stack>
          {cfg.upperBorder && <Divider />}
          <NfToolbar
            items={items}
            cfg={cfg}
            onAction={handleAction}
          />
        </Stack>
      </>
    </Modal>
  );
}

// #endregion
