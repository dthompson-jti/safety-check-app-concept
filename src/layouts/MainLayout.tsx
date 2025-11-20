// src/layouts/MainLayout.tsx
import { motion, useTransform } from 'framer-motion';
import { ScheduleListView } from '../features/Schedule/ScheduleListView';
import { useGestureContext } from '../context/GestureContext';
import styles from './MainLayout.module.css';

export const MainLayout = () => {
  // We still read the atom to know initial state if needed, 
  // but the motion is now driven by the coordinator.
  const { filmStripProgress } = useGestureContext();

  // Map 0 -> 0% (Time)
  // Map 1 -> -50% (Route)
  const x = useTransform(filmStripProgress, [0, 1], ['0%', '-50%']);

  return (
    <div className={styles.contentWrapper}>
      <motion.div
        className={styles.filmStrip}
        style={{ x }}
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