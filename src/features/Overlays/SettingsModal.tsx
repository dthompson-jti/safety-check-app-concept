// src/features/Overlays/SettingsModal.tsx
import { useAtom, useSetAtom } from 'jotai';
import { appConfigAtom, sessionAtom } from '../../data/atoms';
import { Switch } from '../../components/Switch';
import styles from './SettingsModal.module.css';

export const SettingsModal = () => {
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);
  const setSession = useSetAtom(sessionAtom);

  const handleHapticsChange = (checked: boolean) => {
    setAppConfig(currentConfig => ({ ...currentConfig, hapticsEnabled: checked }));
  };

  const handleLogout = () => {
    // Resets the session state, effectively logging the user out.
    setSession({ isAuthenticated: false, userName: null });
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsSection}>
        <h3 className={styles.sectionTitle}>PREFERENCES</h3>
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
        </div>
      </div>

      {/* NEW: Account section with Logout button */}
      <div className={styles.settingsSection}>
        <h3 className={styles.sectionTitle}>ACCOUNT</h3>
        <div className={styles.settingsGroup}>
          <button
            className={`${styles.settingsItem} ${styles.destructive}`}
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};