// src/features/Shell/FloatingHeader.tsx
import { useState } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import * as RadixPopover from '@radix-ui/react-popover';
import {
  appViewAtom,
  isSelectRoomModalOpenAtom,
  isWriteNfcModalOpenAtom,
  isStatusOverviewOpenAtom,
} from '../../data/atoms';
import { PillToggle } from '../../components/PillToggle';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { ActionMenu, ActionMenuItem } from '../../components/ActionMenu';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { StatusOverviewBar } from './StatusOverviewBar';
import styles from './FloatingHeader.module.css';

export const FloatingHeader = () => {
  const [view, setView] = useAtom(appViewAtom);
  const setIsSelectRoomModalOpen = useSetAtom(isSelectRoomModalOpenAtom);
  const setIsWriteNfcModalOpen = useSetAtom(isWriteNfcModalOpenAtom);
  const isOverviewOpen = useAtomValue(isStatusOverviewOpenAtom);

  // Use a controlled state for the popover to ensure reliability.
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const isDashboard = view === 'dashboardTime' || view === 'dashboardRoute';

  // onClick handlers now close the menu after performing their action.
  const actionMenuItems: (ActionMenuItem | 'separator')[] = [
    {
      id: 'supplemental-check',
      icon: 'add_comment',
      label: 'Add Supplemental Check',
      onClick: () => {
        setIsSelectRoomModalOpen(true);
        setIsActionMenuOpen(false);
      },
    },
    {
      id: 'write-nfc-tag',
      icon: 'nfc',
      label: 'Write NFC Tag',
      onClick: () => {
        setIsWriteNfcModalOpen(true);
        setIsActionMenuOpen(false);
      },
    },
  ];

  const handleMenuClick = () => {
    setView(view === 'sideMenu' ? 'dashboardTime' : 'sideMenu');
  };

  return (
    <motion.header layout="position" transition={{ duration: 0.3 }} className={styles.header}>
      <div className={styles.headerContent}>
        <Tooltip content="Open Navigation">
          <Button variant="tertiary" size="m" iconOnly onClick={handleMenuClick} aria-label="Open navigation menu">
            <span className="material-symbols-rounded">menu</span>
          </Button>
        </Tooltip>

        <div className={styles.centerContent}>{isDashboard ? <PillToggle /> : <ConnectionStatusIndicator />}</div>

        <div className={styles.rightActions}>
          {/*
            This is the robust, officially supported pattern for nesting a Tooltip and a Popover
            to ensure their trigger events do not conflict. The Radix `Root` components are nested,
            then their `Trigger` components are nested, which guarantees correct event propagation.
          */}
          <RadixPopover.Root open={isActionMenuOpen} onOpenChange={setIsActionMenuOpen}>
            <Tooltip content="More Actions">
              <RadixPopover.Trigger asChild>
                <Button variant="tertiary" size="m" iconOnly aria-label="More actions">
                  <span className="material-symbols-rounded">add</span>
                </Button>
              </RadixPopover.Trigger>
            </Tooltip>
            <RadixPopover.Portal>
              <RadixPopover.Content className="menu-popover" sideOffset={5} align="end">
                <ActionMenu items={actionMenuItems} />
              </RadixPopover.Content>
            </RadixPopover.Portal>
          </RadixPopover.Root>
        </div>
      </div>
      <AnimatePresence>
        {isOverviewOpen && isDashboard && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <StatusOverviewBar />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};