import { useRef, useCallback, useState, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { appViewAtom, connectionStatusAtom, offlineTimestampAtom } from '../../data/atoms';
import { headerHeightAtom } from '../../data/layoutAtoms';
import { lateCheckCountAtom, queuedChecksCountAtom, dispatchActionAtom } from '../../data/appDataAtoms';
import { useLayoutRegistration } from '../../data/useLayoutRegistration';
import { useWaapiSync } from '../../hooks/useWaapiSync';
import { useHaptics } from '../../data/useHaptics';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { StatusBar } from './StatusBar';
import { UserAvatar } from '../../components/UserAvatar';
import styles from './AppHeader.module.css';

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const AppHeader = () => {
  const [appView, setAppView] = useAtom(appViewAtom);
  const lateCount = useAtomValue(lateCheckCountAtom);
  const [status, setStatus] = useAtom(connectionStatusAtom);
  const offlineTimestamp = useAtomValue(offlineTimestampAtom);
  const queuedCount = useAtomValue(queuedChecksCountAtom);
  const dispatch = useSetAtom(dispatchActionAtom);
  const { trigger: triggerHaptic } = useHaptics();

  const [duration, setDuration] = useState('0:00');

  // Use centralized layout registration
  const layoutRef = useLayoutRegistration(headerHeightAtom);

  // Separate ref for WAAPI sync (animating element)
  const animRef = useRef<HTMLElement | null>(null);

  // Combine refs
  const combinedRef = useCallback((node: HTMLElement | null) => {
    layoutRef.current = node;
    animRef.current = node;
  }, [layoutRef]);

  // Sync pulse animations when late checks exist (only in online mode)
  useWaapiSync(animRef, { isEnabled: lateCount > 0 && status === 'online' });

  useEffect(() => {
    if (status !== 'offline' || !offlineTimestamp) {
      setDuration('0:00');
      return;
    }

    const updateTimer = () => {
      setDuration(formatDuration(Date.now() - offlineTimestamp));
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [status, offlineTimestamp]);

  const handleMenuClick = () => {
    setAppView(appView === 'sideMenu' ? 'dashboardTime' : 'sideMenu');
  };

  const handleSync = () => {
    setStatus('syncing');
    triggerHaptic('medium');
    setTimeout(() => {
      dispatch({ type: 'SYNC_QUEUED_CHECKS', payload: { syncTime: new Date().toISOString() } });
      triggerHaptic('success');
      setStatus('connected');

      // Return to online after brief confirmation
      setTimeout(() => setStatus('online'), 1000);
    }, 2000);
  };


  const isOffline = status !== 'online';

  return (
    <header
      className={styles.header}
      ref={combinedRef}
      data-offline={isOffline}
      data-status={status} // For Option B Success Flash styling
      aria-live="polite"
    >
      <div className={styles.headerContent}>
        <div className={styles.leftActions}>
          <Tooltip content="Open navigation">
            <Button
              variant="tertiary"
              size="lg"
              iconOnly
              onClick={handleMenuClick}
              aria-label="Open navigation menu"
              className={isOffline ? styles.offlineButton : ''}
            >
              <span className="material-symbols-rounded">menu</span>
            </Button>
          </Tooltip>
        </div>

        <div className={styles.centerContent}>
          {/* Always show StatusBar (Missed/Due counts) - use solid variant for contrast when offline */}
          <motion.div
            key="statusbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <StatusBar variant={isOffline ? 'solid' : 'default'} />
          </motion.div>
        </div>

        <div className={styles.rightActions}>
          <UserAvatar className={isOffline ? styles.offlineAvatar : ''} />
        </div>
      </div>

      {/* Offline Bar: Expands downwards */}
      <AnimatePresence>
        {isOffline && (
          <motion.button
            className={styles.offlineBar}
            onClick={status === 'offline' ? handleSync : undefined}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            aria-label={status === 'offline' ? "Offline: Click to sync" : "Back online"}
          >
            <div className={styles.offlineBarContent}>
              <AnimatePresence mode="wait">
                {status === 'syncing' ? (
                  /* Syncing State */
                  <motion.div
                    key="syncing"
                    className={styles.offlineContentRow}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={`material-symbols-rounded ${styles.spinning}`}>sync</span>
                    <span className={styles.offlineTimer}>Syncing...</span>
                  </motion.div>
                ) : status === 'connected' ? (
                  /* Option B: Success Flash Content (Simplified) */
                  <motion.div
                    key="connected"
                    className={styles.offlineContentRow}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="material-symbols-rounded">check</span>
                    <span className={styles.offlineTimer}>Connected</span>
                  </motion.div>
                ) : (
                  /* Standard Offline Content */
                  <motion.div
                    key="offline"
                    className={styles.offlineContentRow}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="material-symbols-rounded">cloud_off</span>
                    <span className={styles.offlineTimer}>Offline {duration}</span>
                    <span className={styles.separator} />
                    <span className={styles.queuedCount}>{queuedCount} queued</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </header>
  );
};
