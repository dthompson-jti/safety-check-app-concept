// src/layouts/MainLayout.tsx
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
// The AppView type is still needed here for the viewMap
import { AppView, appViewAtom } from '../data/atoms';
import { ScheduleListView } from '../features/Schedule/ScheduleListView';
import styles from './MainLayout.module.css';

// The sideMenu view is removed from this component's concern.
const viewMap: Record<Extract<AppView, 'dashboardTime' | 'dashboardRoute'>, number> = {
  dashboardTime: 0,
  dashboardRoute: 1,
};

// DEFINITIVE FIX: Use 'as const' to give TypeScript the specific literal
// types that Framer Motion's 'transition' prop expects.
const viewTransition = {
  type: 'tween',
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
} as const;

export const MainLayout = () => {
  const view = useAtomValue(appViewAtom);

  // If the view is sideMenu, we default to the first panel (time)
  // to prevent errors and keep the layout stable underneath.
  const viewIndex =
    view === 'dashboardTime' || view === 'sideMenu'
      ? viewMap.dashboardTime
      : viewMap.dashboardRoute;

  return (
    <div className={styles.contentWrapper}>
      <motion.div
        className={styles.filmStrip}
        // The film strip now only has 2 panels, so we slide between 0% and -50%
        animate={{ x: `-${viewIndex * (100 / 2)}%` }}
        transition={viewTransition}
      >
        {/* The SideMenu panel has been removed */}
        <div className={styles.panel}>
          <main className={styles.mainContent}>
            <ScheduleListView key="time" viewType="time" />
          </main>
        </div>
        <div className={styles.panel}>
          <main className={styles.mainContent}>
            <ScheduleListView key="route" viewType="route" />
          </main>
        </div>
      </motion.div>
    </div>
  );
};