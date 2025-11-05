// src/features/Settings/SettingsView.tsx
import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { sessionAtom, layoutModeAtom, scheduleLayoutAtom } from '../../data/atoms';
import { DeveloperSettingsView } from './DeveloperSettingsView';
import { AdminSettingsView } from './AdminSettingsView';
import styles from './SettingsView.module.css';

type SettingsScreen = 'master' | 'developer' | 'admin';

export const SettingsView = () => {
  const [activeScreen, setActiveScreen] = useState<SettingsScreen>('master');
  const setSession = useSetAtom(sessionAtom);
  const layoutMode = useAtomValue(layoutModeAtom);
  const scheduleLayout = useAtomValue(scheduleLayoutAtom);

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
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          >
            <header className={styles.header}>
              <h2>Settings</h2>
            </header>

            <div className={styles.settingsGroup}>
              <button className={styles.settingsItem} onClick={() => navigateTo('developer')}>
                <span className={styles.itemLabel}>Developer Options</span>
                <div className={styles.itemValue}>
                  <span>
                    {layoutMode.charAt(0).toUpperCase() + layoutMode.slice(1)},{' '}
                    {scheduleLayout.charAt(0).toUpperCase() + scheduleLayout.slice(1)}
                  </span>
                  <span className="material-symbols-rounded">chevron_right</span>
                </div>
              </button>
              <button className={styles.settingsItem} onClick={() => navigateTo('admin')}>
                <span className={styles.itemLabel}>Admin Tools</span>
                <div className={styles.itemValue}>
                  <span className="material-symbols-rounded">chevron_right</span>
                </div>
              </button>
            </div>

            <div className={styles.settingsGroup}>
              <button
                className={`${styles.settingsItem} ${styles.destructive}`}
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </motion.div>
        ) : activeScreen === 'developer' ? (
          <motion.div
            key="developer"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          >
            <DeveloperSettingsView onBack={navigateBack} />
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