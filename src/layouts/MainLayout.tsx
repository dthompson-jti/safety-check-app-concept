// src/layouts/MainLayout.tsx
import { useAtomValue } from 'jotai';
import { motion, useTransform } from 'framer-motion';
import { appViewAtom } from '../data/atoms';
import { ScheduleView } from '../features/Schedule/ScheduleView';
import { useGestureContext } from '../data/GestureContext';
import styles from './MainLayout.module.css';

export const MainLayout = () => {
  const appView = useAtomValue(appViewAtom);
  const { filmStripProgress } = useGestureContext();

  // 0 = Time View (0% x)
  // 1 = Route View (-50% x)
  const x = useTransform(filmStripProgress, [0, 1], ['0%', '-50%']);

  return (
    <div className={styles.filmStripContainer}>
      <motion.div 
        className={styles.filmStripTrack}
        style={{ x }}
        initial={false}
      >
        <div className={styles.viewPanel} aria-hidden={appView !== 'dashboardTime'}>
          <ScheduleView viewType="time" />
        </div>
        <div className={styles.viewPanel} aria-hidden={appView !== 'dashboardRoute'}>
          <ScheduleView viewType="route" />
        </div>
      </motion.div>
    </div>
  );
};