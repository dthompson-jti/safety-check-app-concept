// src/features/Shell/FloatingHeader.tsx
import { useAtom, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import {
  appViewAtom,
  isManualCheckModalOpenAtom,
} from '../../data/atoms';
import { PillToggle } from '../../components/PillToggle';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { StatusOverviewBar } from './StatusOverviewBar';
import styles from './FloatingHeader.module.css';

export const FloatingHeader = () => {
  const [appView, setAppView] = useAtom(appViewAtom);
  const setIsManualCheckOpen = useSetAtom(isManualCheckModalOpenAtom);

  const isDashboard = appView === 'dashboardTime' || appView === 'dashboardRoute';

  const handleMenuClick = () => {
    setAppView(appView === 'sideMenu' ? 'dashboardTime' : 'sideMenu');
  };

  return (
    <motion.header layout="position" className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.leftActions}>
          <Tooltip content="Open navigation">
            <Button variant="tertiary" size="m" iconOnly onClick={handleMenuClick} aria-label="Open navigation menu">
              <span className="material-symbols-rounded">menu</span>
            </Button>
          </Tooltip>
        </div>

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
          <Tooltip content="Add manual check">
            <Button variant="tertiary" size="m" iconOnly onClick={() => setIsManualCheckOpen(true)}>
              <span className="material-symbols-rounded">add</span>
            </Button>
          </Tooltip>
        </div>
      </div>
      
      <div className={styles.statusBar}>
        <StatusOverviewBar key="status-bar" />
      </div>
    </motion.header>
  );
};