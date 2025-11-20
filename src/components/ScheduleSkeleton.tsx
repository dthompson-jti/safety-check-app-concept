// src/components/CheckSkeleton.tsx
import styles from './CheckSkeleton.module.css';

interface CheckSkeletonProps {
  variant: 'card' | 'list';
}

export const CheckSkeleton = ({ variant }: CheckSkeletonProps) => {
  const wrapperClass = variant === 'card' ? styles.cardWrapper : styles.listWrapper;
  return (
    <div className={wrapperClass}>
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