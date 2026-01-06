import { useRef, useCallback, useState, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { appViewAtom, connectionStatusAtom, offlineTimestampAtom, appConfigAtom } from '../../data/atoms';
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
  const appConfig = useAtomValue(appConfigAtom);

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
      data-header-style={appConfig.headerStyle}
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
          {/* Status Badges - Always present, variant changes based on offline status */}
          <motion.div
            className={styles.statusBadgesWrapper}
            animate={{
              y: isOffline ? -2 : 0,
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <StatusBar variant={isOffline ? 'solid' : 'default'} />
          </motion.div>

          {/* Offline Pill - Appears below status badges when offline */}
          <AnimatePresence>
            {isOffline && (
              <motion.div
                key="offline-pill"
                className={styles.offlinePillWrapper}
                initial={{ y: 12, opacity: 0, height: 0 }}
                animate={{ y: -6, opacity: 1, height: 'auto' }}
                exit={{ y: 12, opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  className={styles.offlineBar}
                  onClick={status === 'offline' ? handleSync : undefined}
                  aria-label={status === 'offline' ? "Offline: Click to sync" : "Back online"}
                  data-status={status}
                >
                  <div className={styles.offlineBarContent}>
                    {/* Instant exit, smooth enter - eliminates empty pill gap */}
                    <AnimatePresence mode="wait">
                      {status === 'syncing' ? (
                        <motion.div
                          key="syncing"
                          className={styles.offlineContentRow}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                          exit={{ opacity: 0, transition: { duration: 0.05 } }}
                        >
                          <span
                            className={`material-symbols-rounded ${styles.spinning}`}
                            style={{
                              color: 'var(--surface-fg-on-solid)',
                              marginRight: '2px' // Optical adjustment: Material Symbols have built-in padding
                            }}
                          >sync</span>
                          <span className={styles.offlineTimer}>Connecting...</span>
                        </motion.div>
                      ) : status === 'connected' ? (
                        <motion.div
                          key="connected"
                          className={styles.offlineContentRow}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                          exit={{ opacity: 0, transition: { duration: 0.05 } }}
                        >
                          <span
                            className="material-symbols-rounded"
                            style={{
                              color: 'var(--surface-fg-on-solid)',
                              marginRight: '2px' // Optical adjustment: Material Symbols have built-in padding
                            }}
                          >check</span>
                          <span className={styles.offlineTimer}>Connected</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="offline-content"
                          className={styles.offlineContentRow}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                          exit={{ opacity: 0, transition: { duration: 0.05 } }}
                        >
                          <span className={styles.offlineTimer}>Offline: {duration}</span>
                          <svg width="12" height="1" viewBox="0 0 12 1" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.divider}>
                            <rect width="12" height="1" fill="currentColor" />
                          </svg>
                          <span className={styles.queuedText}>{queuedCount} Queued</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.rightActions}>
          <UserAvatar className={isOffline ? styles.offlineAvatar : ''} />
        </div>
      </div>
    </header>
  );
};
