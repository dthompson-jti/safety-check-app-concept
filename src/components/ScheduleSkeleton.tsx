// src/components/ScheduleSkeleton.tsx
import styles from './ScheduleSkeleton.module.css';

export const ScheduleSkeleton = () => {
  return (
    <div className={styles.cardWrapper}>
      <div className={styles.shimmer} />
      <div className={styles.indicator} />
      <div className={styles.mainContent}>
        <div className={styles.topRow}>
          <div className={styles.location} />
          <div className={styles.badge} />
        </div>
        <div className={styles.bottomRow}>
          <div className={styles.resident} />
          <div className={styles.residentShort} />
        </div>
      </div>
    </div>
  );
};