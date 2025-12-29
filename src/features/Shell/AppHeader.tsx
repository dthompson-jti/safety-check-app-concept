import { useRef, useCallback, useState, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { appViewAtom, connectionStatusAtom, offlineTimestampAtom } from '../../data/atoms';
import { headerHeightAtom } from '../../data/layoutAtoms';
import { lateCheckCountAtom, queuedChecksCountAtom, dispatchActionAtom } from '../../data/appDataAtoms';
import { useLayoutRegistration } from '../../data/useLayoutRegistration';
import { useWaapiSync } from '../../hooks/useWaapiSync';
import { useHaptics } from '../../data/useHaptics';
import { useAppSound } from '../../data/useAppSound';
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
  const { play: playSound } = useAppSound();

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
      playSound('success');
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
      aria-live="polite"
    >
      {/* Animated grey background overlay with offline content inside */}
      <motion.div
        className={styles.greyOverlay}
        initial={false}
        animate={{
          y: isOffline ? 0 : '-100%',
          opacity: isOffline ? 1 : 0
        }}
        transition={{ type: 'tween', duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Offline content positioned at center, moves with overlay */}
        <div className={styles.overlayContent}>
          <button
            className={styles.offlineStatus}
            data-status={status}
            onClick={status === 'offline' ? handleSync : undefined}
            disabled={status === 'syncing' || status === 'connected'}
          >
            <span className={`material-symbols-rounded ${status === 'syncing' ? styles.spinning : ''}`}>
              {status === 'syncing' ? 'sync' : status === 'connected' ? 'check_circle' : 'cloud_off'}
            </span>
            <span className={styles.offlineTextContainer}>
              <span className={styles.offlineTimer}>
                {status === 'syncing' ? 'Syncing...' : status === 'connected' ? 'Connected' : `Offline ${duration}`}
              </span>
              {status === 'offline' && (
                <>
                  <span className={styles.separator} />
                  <span className={styles.queuedCount}>{queuedCount} Queued</span>
                </>
              )}
            </span>
          </button>
        </div>
      </motion.div>

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
          <AnimatePresence mode="wait">
            {status === 'online' && (
              <motion.div
                key="online"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
              >
                <StatusBar />
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