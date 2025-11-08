// src/features/Shell/FloatingHeader.tsx
import { useAtom, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import {
  appViewAtom,
  isSelectRoomModalOpenAtom,
  isWriteNfcModalOpenAtom,
  isStatusOverviewOpenAtom,
} from '../../data/atoms';
import { PillToggle } from '../../components/PillToggle';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { Popover } from '../../components/Popover';
import { ActionMenu, ActionMenuItem } from '../../components/ActionMenu';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { StatusOverviewBar } from './StatusOverviewBar';
import styles from './FloatingHeader.module.css';

export const FloatingHeader = () => {
  const [view, setView] = useAtom(appViewAtom);
  const setIsSelectRoomModalOpen = useSetAtom(isSelectRoomModalOpenAtom);
  const setIsWriteNfcModalOpen = useSetAtom(isWriteNfcModalOpenAtom);
  const [isOverviewOpen, setIsOverviewOpen] = useAtom(isStatusOverviewOpenAtom);

  const isDashboard = view === 'dashboardTime' || view === 'dashboardRoute';

  const actionMenuItems: (ActionMenuItem | 'separator')[] = [
    {
      id: 'supplemental-check',
      icon: 'add_comment',
      label: 'Add Supplemental Check',
      onClick: () => setIsSelectRoomModalOpen(true),
    },
    {
      id: 'write-nfc-tag',
      icon: 'nfc',
      label: 'Write NFC Tag',
      onClick: () => setIsWriteNfcModalOpen(true),
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
          {isDashboard && (
            <Tooltip content={isOverviewOpen ? 'Hide Overview' : 'Show Overview'}>
              <Button
                variant="tertiary"
                size="m"
                iconOnly
                onClick={() => setIsOverviewOpen(!isOverviewOpen)}
                aria-pressed={isOverviewOpen}
              >
                <span className="material-symbols-rounded">
                  {isOverviewOpen ? 'visibility_off' : 'visibility'}
                </span>
              </Button>
            </Tooltip>
          )}
          <Popover
            trigger={
              <Tooltip content="More Actions">
                <Button variant="tertiary" size="m" iconOnly aria-label="More actions">
                  <span className="material-symbols-rounded">add</span>
                </Button>
              </Tooltip>
            }
          >
            <div className="menu-popover">
              <ActionMenu items={actionMenuItems} />
            </div>
          </Popover>
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