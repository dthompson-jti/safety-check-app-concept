// src/features/Overlays/SettingsOverlay.tsx
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { sessionAtom } from '../../data/atoms';
// REORG: Updated import path for local component
import { AdminSettingsView } from './AdminSettingsView';
// REORG: Updated import path for CSS module
import styles from './SettingsOverlay.module.css';

type SettingsScreen = 'master' | 'admin';

export const SettingsOverlay = () => {
  const [activeScreen, setActiveScreen] = useState<SettingsScreen>('master');
  const setSession = useSetAtom(sessionAtom);

  const handleLogout = () => {
    setSession({ isAuthenticated: false, userName: null });
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-25%',
      opacity: direction > 0 ? 1 : 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-25%',
      opacity: direction < 0 ? 1 : 0,
    }),
  };

  // Direction for animation: 1 = moving forward (deeper), -1 = moving backward
  const [direction, setDirection] = useState(0);

  const navigateTo = (screen: SettingsScreen) => {
    setDirection(1);
    setActiveScreen(screen);
  };

  const navigateBack = () => {
    setDirection(-1);
    setActiveScreen('master');
  };

  // This wrapper ensures the content starts below the parent modal's header
  return (
    <div className={styles.settingsContainer}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        {activeScreen === 'master' ? (
          <motion.div
            key="master"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, padding: 'var(--spacing-4)' }}
          >
            <div className={styles.settingsGroup}>
              <button className={styles.settingsItem} onClick={() => navigateTo('admin')}>
                <span className={styles.itemLabel}>Admin Tools</span>
                <div className={styles.itemValue}>
                  <span className="material-symbols-rounded">chevron_right</span>
                </div>
              </button>
            </div>

            <div className={styles.settingsGroup}>
              <button className={`${styles.settingsItem} ${styles.destructive}`} onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="admin"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          >
            <AdminSettingsView onBack={navigateBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};