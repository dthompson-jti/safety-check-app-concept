// src/features/Overlays/DeveloperOverlay.tsx
import { useAtom } from 'jotai';
import { connectionStatusAtom, ConnectionStatus, appConfigAtom } from '../../data/atoms'; // [MODIFIED] Import appConfigAtom
import { IconToggleGroup } from '../../components/IconToggleGroup';
import styles from './DeveloperOverlay.module.css';

const connectionOptions: readonly { value: ConnectionStatus; label: string; icon: string }[] = [
  { value: 'online', label: 'Online', icon: 'cloud' },
  { value: 'offline', label: 'Offline', icon: 'cloud_off' },
  { value: 'syncing', label: 'Syncing', icon: 'sync' },
] as const;

// [NEW] Scan mode options moved here from SettingsOverlay
const scanModeOptions = [
  { value: 'qr', label: 'QR Code', icon: 'qr_code_2' },
  { value: 'nfc', label: 'NFC', icon: 'nfc' },
] as const;

export const DeveloperOverlay = () => {
  const [connectionStatus, setConnectionStatus] = useAtom(connectionStatusAtom);
  const [appConfig, setAppConfig] = useAtom(appConfigAtom); // [NEW] Read app config state

  return (
    <div className={styles.container}>
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Connectivity</h3>
        <p className={styles.sectionHelper}>Simulate the application's network connection status.</p>
        <IconToggleGroup
          options={connectionOptions}
          value={connectionStatus}
          onValueChange={setConnectionStatus}
          id="connection-status-toggle"
        />
      </div>

      {/* [NEW] Scan mode toggle moved here */}
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Device Settings</h3>
        <p className={styles.sectionHelper}>Control the primary input method for initiating checks.</p>
        <IconToggleGroup
            id="scan-mode-toggle"
            options={scanModeOptions}
            value={appConfig.scanMode}
            onValueChange={(mode) => setAppConfig((c) => ({ ...c, scanMode: mode }))}
          />
      </div>
    </div>
  );
};