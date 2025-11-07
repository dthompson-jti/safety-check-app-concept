// src/layouts/MainLayout.tsx
import { useAtomValue } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, appViewAtom } from '../data/atoms';
// REORG: Updated import paths and component names for Shell components
import { FloatingHeader } from '../features/Shell/FloatingHeader';
import { FloatingFooter } from '../features/Shell/FloatingFooter';
import { AppSideMenu } from '../features/Shell/AppSideMenu';
// REORG: Updated import path and component name for Schedule component
import { ScheduleListView } from '../features/Schedule/ScheduleListView';
import styles from './MainLayout.module.css';

// This map translates the semantic AppView state into a numeric index
// for driving the carousel's position.
const viewMap: Record<AppView, number> = {
  sideMenu: 0,
  dashboardTime: 1,
  dashboardRoute: 2,
};

/**
 * Renders the correct content panel based on the global appViewAtom.
 * This component is responsible for the main content area that lives "under"
 * the persistent Header and Footer.
 */
const ContentPanels = () => {
  const view = useAtomValue(appViewAtom);
  const viewIndex = viewMap[view];

  // The "film strip" is a three-panel container that is translated horizontally
  // to show the correct view.
  return (
    <motion.div
      className={styles.filmStrip}
      animate={{ x: `-${viewIndex * (100 / 3)}%` }}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
    >
      <div className={styles.panel}>
        <AppSideMenu />
      </div>
      <div className={styles.panel}>
        <main className={styles.mainContent}>
          {/* Using a key is critical here. It tells React to treat this as a
              distinct component instance, preventing the vertical re-sort animation. */}
          <ScheduleListView key="time" viewType="time" />
        </main>
      </div>
      <div className={styles.panel}>
        <main className={styles.mainContent}>
          <ScheduleListView key="route" viewType="route" />
        </main>
      </div>
    </motion.div>
  );
};

/**
 * The main architectural layout of the application.
 * It establishes a persistent "shell" with the Header and Footer, and a content
 * area in between that can render either a sliding panel carousel or a
 * standalone view.
 */
export const MainLayout = () => {
  const view = useAtomValue(appViewAtom);
  // The persistent UI chrome is hidden only when the side menu is active.
  const isChromeVisible = view !== 'sideMenu';

  return (
    <div className={styles.appViewContainer}>
      <AnimatePresence>
        {isChromeVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FloatingHeader />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.contentWrapper}>
        <ContentPanels />
      </div>

      <AnimatePresence>
        {isChromeVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FloatingFooter />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};