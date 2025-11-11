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

  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const isDashboard = view === 'dashboardTime' || view === 'dashboardRoute';

  const actionMenuItems: (ActionMenuItem | 'separator')[] = [
    {
      id: 'supplemental-check',
      icon: 'add_comment',
      label: 'Add supplemental check',
      onClick: () => {
        setIsSelectRoomModalOpen(true);
        setIsActionMenuOpen(false);
      },
    },
    {
      id: 'write-nfc-tag',
      icon: 'nfc',
      label: 'Write NFC tag',
      onClick: () => {
        setIsWriteNfcModalOpen(true);
        setIsActionMenuOpen(false);
      },
    },
  ];

  const handleMenuClick = () => {
    setView(view === 'sideMenu' ? 'dashboardTime' : 'sideMenu');
  };

  // ARCHITECTURE: The effect for measuring height has been moved to the parent AppShell
  // component, which is responsible for the overall layout. This makes the FloatingHeader
  // a simpler, more focused component.

  return (
    // The `layout` prop is removed as this element is no longer responsible for its own position.
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Tooltip content="Open navigation">
          <Button variant="tertiary" size="m" iconOnly onClick={handleMenuClick} aria-label="Open navigation menu">
            <span className="material-symbols-rounded">menu</span>
          </Button>
        </Tooltip>

        <div className={styles.centerContent}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDashboard ? 'pill-toggle' : 'status-indicator'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {isDashboard ? <PillToggle /> : <ConnectionStatusIndicator />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.rightActions}>
          <RadixPopover.Root open={isActionMenuOpen} onOpenChange={setIsActionMenuOpen}>
            <Tooltip content="More actions">
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
        {isOverviewOpen && (
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
    </header>
  );
};