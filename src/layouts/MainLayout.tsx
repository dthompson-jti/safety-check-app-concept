// src/layouts/MainLayout.tsx
import { ScheduleView } from '../features/Schedule/ScheduleView';
import styles from './MainLayout.module.css';

export const MainLayout = () => {
  return (
    <div className={styles.container}>
      <ScheduleView viewType="time" />
    </div>
  );
};