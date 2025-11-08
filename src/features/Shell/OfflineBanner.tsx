// src/features/Shell/OfflineBanner.tsx
import { useAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { connectionStatusAtom } from '../../data/atoms';
import styles from './OfflineBanner.module.css';

export const OfflineBanner = () => {
  const [status, setStatus] = useAtom(connectionStatusAtom);

  if (status === 'online') {
    return null;
  }

  const handleSync = () => {
    setStatus('syncing');
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setStatus(success ? 'online' : 'offline');
    }, 2500);
  };

  const content = {
    offline: {
      icon: 'cloud_off',
      text: 'You are currently offline.',
    },
    syncing: {
      icon: 'sync',
      text: 'Syncing...',
    },
  }[status];

  return (
    <AnimatePresence>
      <motion.div
        className={styles.banner}
        data-status={status}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        {/* Add the dedicated `styles.icon` class for unambiguous styling. */}
        <span className={`material-symbols-rounded ${styles.icon} ${status === 'syncing' ? styles.spinner : ''}`}>
          {content.icon}
        </span>
        <span className={styles.bannerText}>{content.text}</span>
        {status === 'offline' && (
          <button className={styles.syncButton} onClick={handleSync}>
            Sync Now
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};