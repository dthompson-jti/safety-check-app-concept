// src/features/Shell/FloatingHeader.tsx
import { useAtom, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import {
  appViewAtom,
  isManualCheckModalOpenAtom,
  // isWriteNfcModalOpenAtom, // FIX: Removed unused import
  isScheduleSearchActiveAtom,
  scheduleSearchQueryAtom,
} from '../../data/atoms';
import { PillToggle } from '../../components/PillToggle';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { StatusOverviewBar } from './StatusOverviewBar';
import { ScheduleSearchBar } from './ScheduleSearchBar';
import styles from './FloatingHeader.module.css';

export const FloatingHeader = () => {
  const [appView, setAppView] = useAtom(appViewAtom);
  const setIsManualCheckModalOpen = useSetAtom(isManualCheckModalOpenAtom);
  // const setIsWriteNfcModalOpen = useSetAtom(isWriteNfcModalOpenAtom); // FIX: Removed unused setter
  const [isSearchActive, setIsSearchActive] = useAtom(isScheduleSearchActiveAtom);
  const setScheduleSearchQuery = useSetAtom(scheduleSearchQueryAtom);

  const isDashboard = appView === 'dashboardTime' || appView === 'dashboardRoute';

  const handleMenuClick = () => {
    setAppView(appView === 'sideMenu' ? 'dashboardTime' : 'sideMenu');
  };

  const handleSearchToggle = () => {
    if (isSearchActive) {
      setScheduleSearchQuery('');
    }
    setIsSearchActive(!isSearchActive);
  };

  const rightSideActions = (
    <div className={styles.rightActions}>
      <Tooltip content={isSearchActive ? 'Close search' : 'Search schedule'}>
        <Button
          variant="tertiary"
          size="m"
          iconOnly
          onClick={handleSearchToggle}
          aria-label={isSearchActive ? 'Close search' : 'Search schedule'}
        >
          <span className="material-symbols-rounded">{isSearchActive ? 'close' : 'search'}</span>
        </Button>
      </Tooltip>
      <Tooltip content="Add manual check">
        <Button variant="tertiary" size="m" iconOnly onClick={() => setIsManualCheckModalOpen(true)}>
          <span className="material-symbols-rounded">add</span>
        </Button>
      </Tooltip>
    </div>
  );

  return (
    <motion.header layout className={styles.header}>
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
              {isDashboard ? (
                <div className={styles.pillToggleWrapper}>
                  <PillToggle />
                </div>
              ) : (
                <ConnectionStatusIndicator />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {rightSideActions}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {isSearchActive ? (
          <motion.div
            key="search-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <ScheduleSearchBar />
          </motion.div>
        ) : (
          <motion.div
            key="status-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <StatusOverviewBar />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};