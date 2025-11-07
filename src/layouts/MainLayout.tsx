// src/layouts/MainLayout.tsx
import { useAtomValue } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, appViewAtom } from '../data/atoms';
import { FloatingHeader } from '../features/Shell/FloatingHeader';
import { FloatingFooter } from '../features/Shell/FloatingFooter';
import { AppSideMenu } from '../features/Shell/AppSideMenu';
import { ScheduleListView } from '../features/Schedule/ScheduleListView';
import styles from './MainLayout.module.css';

// This map translates the semantic AppView state into a numeric index
// for driving the carousel's position.
const viewMap: Record<AppView, number> = {
  sideMenu: 0,
  dashboardTime: 1,
  dashboardRoute: 2,
};

// Define the shared, slower transition profile
// FIX: Add 'as const' to provide a specific literal type for 'tween', resolving the TS error.
const viewTransition = {
  type: 'tween',
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
} as const;

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
      transition={viewTransition}
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
            transition={viewTransition}
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
            transition={viewTransition}
          >
            <FloatingFooter />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};