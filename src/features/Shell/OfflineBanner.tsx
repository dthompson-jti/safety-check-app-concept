// src/features/Shell/OfflineBanner.tsx
import { useState, useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { connectionStatusAtom, offlineTimestampAtom } from '../../data/atoms';
import { queuedChecksCountAtom, dispatchActionAtom } from '../../data/appDataAtoms';
import styles from './OfflineBanner.module.css';

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const OfflineBanner = () => {
  const [status, setStatus] = useAtom(connectionStatusAtom);
  const offlineTimestamp = useAtomValue(offlineTimestampAtom);
  const queuedCount = useAtomValue(queuedChecksCountAtom);
  const dispatch = useSetAtom(dispatchActionAtom);
  
  const [duration, setDuration] = useState('0:00');
  const bannerRef = useRef<HTMLDivElement>(null);

  // Timer Logic
  useEffect(() => {
    if (status !== 'offline' || !offlineTimestamp) {
      setDuration('0:00');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = now - offlineTimestamp;
      setDuration(formatDuration(diff));
    };

    // Update immediately, then every second
    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [status, offlineTimestamp]);

  // Component Variable Contract: Measure height
  useEffect(() => {
    const updateHeight = () => {
      if (bannerRef.current) {
        const height = bannerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--offline-banner-height', `${height}px`);
      } else {
        document.documentElement.style.removeProperty('--offline-banner-height');
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--offline-banner-height');
    };
  }, [status]);

  if (status === 'online') {
    return null;
  }

  const handleSync = () => {
    setStatus('syncing');
    // Simulate Sync Process
    setTimeout(() => {
      dispatch({ type: 'SYNC_QUEUED_CHECKS', payload: { syncTime: new Date().toISOString() } });
      setStatus('online');
    }, 2000);
  };

  const getQueueMessage = () => {
    if (queuedCount === 0) return 'No items queued for sync';
    if (queuedCount === 1) return '1 item queued for sync';
    return `${queuedCount} items queued for sync`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.banner}
        ref={bannerRef}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        <div className={styles.iconContainer}>
          <span className={`material-symbols-rounded ${styles.icon} ${status === 'syncing' ? styles.spinner : ''}`}>
            {status === 'syncing' ? 'sync' : 'cloud_off'}
          </span>
        </div>

        <div className={styles.textContainer}>
          {status === 'syncing' ? (
            <>
              <div className={styles.statusText}>Syncing data...</div>
              <div className={styles.queueText}>Please wait</div>
            </>
          ) : (
            <>
              <div className={styles.statusText}>Offline for {duration}</div>
              <div className={styles.queueText}>{getQueueMessage()}</div>
            </>
          )}
        </div>

        {status === 'offline' && (
          <button className={styles.syncButton} onClick={handleSync}>
            Sync Now
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};