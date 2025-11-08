// src/layouts/MainLayout.tsx
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { AppView, appViewAtom } from '../data/atoms';
import { AppSideMenu } from '../features/Shell/AppSideMenu';
import { ScheduleListView } from '../features/Schedule/ScheduleListView';
import styles from './MainLayout.module.css';

const viewMap: Record<AppView, number> = {
  sideMenu: 0,
  dashboardTime: 1,
  dashboardRoute: 2,
};

const viewTransition = {
  type: 'tween',
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
} as const;

/**
 * The main architectural layout of the application.
 * It establishes a persistent "shell" with the Header and Footer, and a content
 * area in between that can render either a sliding panel carousel or a
 * standalone view.
 */
export const MainLayout = () => {
  const view = useAtomValue(appViewAtom);
  const viewIndex = viewMap[view];

  return (
    <div className={styles.contentWrapper}>
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