// src/features/Overlays/SettingsModal.tsx
import { useAtom, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { appConfigAtom, sessionAtom } from '../../data/atoms';
import { useHaptics } from '../../data/useHaptics';
import { Switch } from '../../components/Switch';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Button } from '../../components/Button';
import styles from './SettingsModal.module.css';

// PRD-006: Time Display options
const timeDisplayOptions = [
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'dual', label: 'Dual' },
] as const;

export const SettingsModal = () => {
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);
  const setSession = useSetAtom(sessionAtom);
  const { trigger: triggerHaptic } = useHaptics();

  const handleHapticsChange = (checked: boolean) => {
    triggerHaptic('light');
    setAppConfig(currentConfig => ({ ...currentConfig, hapticsEnabled: checked }));
  };

  const handleAudioChange = (checked: boolean) => {
    triggerHaptic('light');
    setAppConfig(currentConfig => ({ ...currentConfig, audioEnabled: checked }));
  };

  // PRD-006: Time Display mode handler
  const handleTimeDisplayChange = (value: 'relative' | 'absolute' | 'dual') => {
    triggerHaptic('selection');
    setAppConfig(currentConfig => ({ ...currentConfig, timeDisplayMode: value }));
  };

  const handleLogout = () => {
    setSession({ isAuthenticated: false, userName: null });
  };

  // Animation: Slide-in from right (x: 100% -> 0) to replicate native modal behavior.
  return (
    <motion.div
      className={styles.settingsContainer}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className={styles.settingsSection}>
        <h3 className={styles.sectionTitle}>Preferences</h3>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <label htmlFor="haptics-switch" className={styles.itemLabel}>
              Haptic Feedback
            </label>
            <Switch
              id="haptics-switch"
              checked={appConfig.hapticsEnabled}
              onCheckedChange={handleHapticsChange}
            />
          </div>
          <div className={styles.settingsItem}>
            <label htmlFor="audio-switch" className={styles.itemLabel}>
              Audio Feedback
            </label>
            <Switch
              id="audio-switch"
              checked={appConfig.audioEnabled}
              onCheckedChange={handleAudioChange}
            />
          </div>
          {/* PRD-006: Time Display toggle */}
          <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
            <label className={styles.itemLabel}>Time Display</label>
            <SegmentedControl
              id="time-display-toggle"
              options={timeDisplayOptions}
              value={appConfig.timeDisplayMode}
              onValueChange={handleTimeDisplayChange}
            />
          </div>
        </div>
      </div>

      <div className={styles.settingsSection}>
        <h3 className={styles.sectionTitle}>Account</h3>
        {/* 
          Updated: Using the standard Button component with 'secondary' variant.
          We removed the .settingsGroup wrapper here to prevent the button's 
          border/focus-ring from being cropped by overflow:hidden, and to 
          ensure the button's own border is fully visible.
        */}
        <Button
          variant="secondary"
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          Log Out
        </Button>
      </div>
    </motion.div>
  );
};
