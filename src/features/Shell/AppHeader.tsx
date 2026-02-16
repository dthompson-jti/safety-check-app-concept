import { useRef, useCallback, useState, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { appViewAtom, offlineTimestampAtom, appConfigAtom } from '../../data/atoms';
import { headerHeightAtom } from '../../data/layoutAtoms';
import { lateCheckCountAtom, queuedChecksCountAtom } from '../../data/appDataAtoms';
import { useLayoutRegistration } from '../../data/useLayoutRegistration';
import { useWaapiSync } from '../../hooks/useWaapiSync';
import { useConnectionManager } from '../../hooks/useConnectionManager';
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
  const { status, toggleConnection: triggerSyncFlow } = useConnectionManager();

  const offlineTimestamp = useAtomValue(offlineTimestampAtom);
  const queuedCount = useAtomValue(queuedChecksCountAtom);
  // dispatch removed (handled by hook)
  // triggerHaptic removed (handled by hook)
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
    triggerSyncFlow();
  };

  const isOfflineHeader = status === 'offline';
  const showPill = status === 'offline' || status === 'syncing' || status === 'connected' || (status as string) === 'synced';

  return (
    <header
      className={styles.header}
      ref={combinedRef}
      data-offline={isOfflineHeader}
      data-status={status} // For Option B Success Flash styling
      data-header-style={appConfig.headerStyle}
      data-shadow={appConfig.showChromeShadow}
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
              className={isOfflineHeader ? styles.offlineButton : ''}
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
              y: isOfflineHeader ? -2 : 0,
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <StatusBar variant={isOfflineHeader ? 'solid' : 'default'} />
          </motion.div>

          {/* Offline Pill - Appears below status badges when offline */}
          <AnimatePresence>
            {showPill && (
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
                              marginRight: '6px' // Increased spacing for cleaner look
                            }}
                          >sync</span>
                          <span className={styles.offlineTimer}>Uploading {queuedCount} checks</span>
                        </motion.div>
                      ) : status === 'connected' || status === 'synced' ? (
                        <motion.div
                          key="success-state"
                          className={styles.offlineContentRow}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                          exit={{ opacity: 0, transition: { duration: 0.05 } }}
                        >
                          <span
                            className="material-symbols-rounded"
                            style={{
                              color: 'var(--surface-fg-on-solid)',
                              marginLeft: '-4px', // Offset internal icon padding for better optical centering
                              marginRight: '2px'
                            }}
                          >check</span>
                          <span className={styles.offlineTimer}>
                            {status === 'synced' ? 'Complete' : 'Connected'}
                          </span>
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
          <UserAvatar className={isOfflineHeader ? styles.offlineAvatar : ''} />
        </div>
      </div>
    </header>
  );
};
