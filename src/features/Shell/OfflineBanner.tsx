// src/features/Shell/OfflineBanner.tsx
import { useState, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { connectionStatusAtom, offlineTimestampAtom } from '../../data/atoms';
import { queuedChecksCountAtom, dispatchActionAtom } from '../../data/appDataAtoms';
import { bannerHeightAtom } from '../../data/layoutAtoms';
import { useLayoutRegistration } from '../../data/useLayoutRegistration';
import { useHaptics } from '../../data/useHaptics';
import { useAppSound } from '../../data/useAppSound';
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
  const { trigger: triggerHaptic } = useHaptics();
  const { play: playSound } = useAppSound();

  const [duration, setDuration] = useState('0:00');
  // Use centralized layout registration
  const bannerRef = useLayoutRegistration(bannerHeightAtom);

  // Audio/Haptic Feedback on State Change
  useEffect(() => {
    if (status === 'offline') {
      triggerHaptic('warning');
    } else if (status === 'online' && offlineTimestamp) {
      // Sync complete (transition back to online handled in handleSync mostly, but this catches external updates)
    }
  }, [status, offlineTimestamp, triggerHaptic]);

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

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [status, offlineTimestamp]);

  if (status === 'online') {
    return null;
  }

  const handleSync = () => {
    setStatus('syncing');
    triggerHaptic('medium');
    setTimeout(() => {
      dispatch({ type: 'SYNC_QUEUED_CHECKS', payload: { syncTime: new Date().toISOString() } });
      triggerHaptic('success');
      playSound('success');
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
        ref={bannerRef as React.RefObject<HTMLDivElement>}
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
