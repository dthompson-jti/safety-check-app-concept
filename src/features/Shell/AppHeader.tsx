// src/features/Shell/AppHeader.tsx
import { useLayoutEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import {
  appViewAtom,
  isManualCheckModalOpenAtom,
} from '../../data/atoms';
import { ViewModeSwitcher } from './ViewModeSwitcher';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { ConnectivityBadge } from './ConnectivityBadge';
import { StatusBar } from './StatusBar';
import styles from './AppHeader.module.css';

export const AppHeader = () => {
  const [appView, setAppView] = useAtom(appViewAtom);
  const setIsManualCheckOpen = useSetAtom(isManualCheckModalOpenAtom);
  const headerRef = useRef<HTMLElement>(null);

  const isDashboard = appView === 'dashboardTime' || appView === 'dashboardRoute';

  // DEFINITIVE FIX: Implement the Component Variable Contract.
  // This measures the header's actual height and sets a CSS variable, providing
  // a robust way for other components (like the sticky list headers) to position
  // themselves relative to it.
  useLayoutEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.removeProperty('--header-height');
    };
  }, []);

  const handleMenuClick = () => {
    setAppView(appView === 'sideMenu' ? 'dashboardTime' : 'sideMenu');
  };

  return (
    <header className={styles.header} ref={headerRef}>
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
              {isDashboard ? <ViewModeSwitcher /> : <ConnectivityBadge />}
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
        <StatusBar key="status-bar" />
      </div>
    </header>
  );
};