// src/features/Shell/ConnectivityBadge.tsx
import { useAtomValue } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { connectionStatusAtom } from '../../data/atoms';
import styles from './ConnectivityBadge.module.css';

export const ConnectivityBadge = () => {
  const status = useAtomValue(connectionStatusAtom);

  if (status === 'online') {
    return null;
  }

  const content = {
    offline: {
      icon: 'cloud_off',
      text: 'Offline',
    },
    syncing: {
      icon: 'sync',
      text: 'Syncing...',
    },
  }[status];

  return (
    <AnimatePresence>
      <motion.div
        className={styles.badge}
        data-status={status}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <span className={`material-symbols-rounded ${status === 'syncing' ? styles.spinner : ''}`}>
          {content.icon}
        </span>
        <span>{content.text}</span>
      </motion.div>
    </AnimatePresence>
  );
};