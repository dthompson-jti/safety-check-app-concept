// src/features/Overlays/SettingsModal.tsx
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { appConfigAtom, sessionAtom, userPreferencesAtom } from '../../data/atoms';
import { featureFlagsAtom } from '../../data/featureFlags';
import { useHaptics } from '../../data/useHaptics';
import { useTheme, Theme } from '../../data/useTheme';
import { generateAvatarHue } from '../../data/users';

import { SegmentedControl } from '../../components/SegmentedControl';
import { Switch } from '../../components/Switch';
import { Button } from '../../components/Button';
import { ColorSlider } from '../../components/ColorSlider';
import styles from './SettingsModal.module.css';

const scanModeOptions = [
  { value: 'qr', label: 'QR Code', icon: 'qr_code_2' },
  { value: 'nfc', label: 'NFC', icon: 'nfc' },
] as const;

export const SettingsModal = () => {
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);
  const [featureFlags] = useAtom(featureFlagsAtom);
  const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);
  const session = useAtomValue(sessionAtom);
  const setSession = useSetAtom(sessionAtom);
  const { trigger: triggerHaptic } = useHaptics();
  const { theme, setTheme } = useTheme();

  const currentUser = session.user;

  const handleHapticsChange = (checked: boolean) => {
    triggerHaptic('light');
    setAppConfig(currentConfig => ({ ...currentConfig, hapticsEnabled: checked }));
  };

  const handleAvatarColorChange = (hue: number) => {
    if (!currentUser) return;

    setUserPreferences(prefs => ({
      ...prefs,
      [currentUser.username]: {
        ...prefs[currentUser.username],
        avatarHue: hue,
      },
    }));
  };

  const handleLogout = () => {
    setSession({ isAuthenticated: false, user: null });
  };

  // Get current avatar hue (custom or generated)
  const currentAvatarHue = currentUser
    ? (userPreferences[currentUser.username]?.avatarHue ?? generateAvatarHue(currentUser.username))
    : 0;

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
          {/* Scan Mode: Always visible */}
          <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
            <label className={styles.itemLabel}>Scan Mode</label>
            <SegmentedControl
              id="scan-mode-toggle"
              options={scanModeOptions}
              value={appConfig.scanMode}
              onValueChange={(mode) => { triggerHaptic('selection'); setAppConfig((c) => ({ ...c, scanMode: mode })); }}
              itemDirection="column"
            />
          </div>

          {/* Haptics: Only visible when useHapticsEnabled feature flag is on */}
          {featureFlags.useHapticsEnabled && (
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
          )}

          {/* Audio: Only visible when useSoundEnabled feature flag is on */}
          {featureFlags.useSoundEnabled && (
            <div className={styles.settingsItem}>
              <label htmlFor="audio-switch" className={styles.itemLabel}>
                Audio Feedback
              </label>
              <Switch
                id="audio-switch"
                checked={appConfig.audioEnabled}
                onCheckedChange={(checked) =>
                  setAppConfig(currentConfig => ({ ...currentConfig, audioEnabled: checked }))
                }
              />
            </div>
          )}

          {/* Theme: Always visible in promoted experience */}
          <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
            <label className={styles.itemLabel}>Theme</label>
            <SegmentedControl
              id="theme-toggle"
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark-c', label: 'Dark' },
              ]}
              value={theme === 'light' ? 'light' : 'dark-c'}
              onValueChange={(val) => {
                triggerHaptic('selection');
                setTheme(val as Theme);
              }}
            />
          </div>
        </div>
      </div>

      {/* Appearance Section: Only visible when dynamic avatar color is enabled */}
      {featureFlags.enableDynamicAvatarColor && (
        <div className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}>Appearance</h3>
          <div className={styles.settingsGroup}>
            <div
              className={styles.settingsItem}
              style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}
              data-no-hover="true"
            >
              <ColorSlider
                label="Avatar Color"
                value={currentAvatarHue}
                onChange={handleAvatarColorChange}
              />
            </div>
          </div>
        </div>
      )}

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
          <span className="material-symbols-rounded">logout</span>
          <span>Log Out</span>
        </Button>
      </div>
    </motion.div>
  );
};
