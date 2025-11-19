// src/layouts/MainLayout.tsx
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { AppView, appViewAtom } from '../data/atoms';
import { ScheduleListView } from '../features/Schedule/ScheduleListView';
import styles from './MainLayout.module.css';

const viewMap: Record<Extract<AppView, 'dashboardTime' | 'dashboardRoute'>, number> = {
  dashboardTime: 0,
  dashboardRoute: 1,
};

// ANIMATION POLISH: Explicit tween physics
const viewTransition = {
  type: 'tween',
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
} as const;

export const MainLayout = () => {
  const view = useAtomValue(appViewAtom);

  const viewIndex =
    view === 'dashboardTime' || view === 'sideMenu'
      ? viewMap.dashboardTime
      : viewMap.dashboardRoute;

  return (
    <div className={styles.contentWrapper}>
      <motion.div
        className={styles.filmStrip}
        animate={{ x: `-${viewIndex * (100 / 2)}%` }}
        transition={viewTransition}
      >
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