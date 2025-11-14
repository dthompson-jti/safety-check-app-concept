// src/features/Overlays/DeveloperOverlay.tsx
import { useAtom } from 'jotai';
import { connectionStatusAtom, ConnectionStatus, appConfigAtom } from '../../data/atoms';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import { Switch } from '../../components/Switch';
import styles from './DeveloperOverlay.module.css';

const connectionOptions: readonly { value: ConnectionStatus; label: string; icon: string }[] = [
  { value: 'online', label: 'Online', icon: 'cloud' },
  { value: 'offline', label: 'Offline', icon: 'cloud_off' },
  { value: 'syncing', label: 'Syncing', icon: 'sync' },
] as const;

const scanModeOptions = [
  { value: 'qr', label: 'QR Code', icon: 'qr_code_2' },
  { value: 'nfc', label: 'NFC', icon: 'nfc' },
] as const;

export const DeveloperOverlay = () => {
  const [connectionStatus, setConnectionStatus] = useAtom(connectionStatusAtom);
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);

  const handleSlowLoadChange = (checked: boolean) => {
    setAppConfig(current => ({ ...current, isSlowLoadEnabled: checked }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>CONNECTIVITY</h3>
        <p className={styles.sectionHelper}>Simulate the application's network connection status.</p>
        <IconToggleGroup
          options={connectionOptions}
          value={connectionStatus}
          onValueChange={setConnectionStatus}
          id="connection-status-toggle"
        />
      </div>

      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>DEVICE SETTINGS</h3>
        <p className={styles.sectionHelper}>Control the primary input method for initiating checks.</p>
        <IconToggleGroup
          id="scan-mode-toggle"
          options={scanModeOptions}
          value={appConfig.scanMode}
          onValueChange={(mode) => setAppConfig((c) => ({ ...c, scanMode: mode }))}
        />
      </div>
      
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>PERFORMANCE</h3>
        <p className={styles.sectionHelper}>Test the UI's resilience to network latency.</p>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <label htmlFor="slow-load-switch" className={styles.itemLabel}>
              Simulate Slow Loading
            </label>
            <Switch
              id="slow-load-switch"
              checked={appConfig.isSlowLoadEnabled}
              onCheckedChange={handleSlowLoadChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};