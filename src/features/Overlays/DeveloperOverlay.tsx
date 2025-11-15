// src/features/Overlays/DeveloperOverlay.tsx
import { useAtom } from 'jotai';
import { connectionStatusAtom, ConnectionStatus, appConfigAtom } from '../../data/atoms';
import { nfcSimulationAtom, NfcSimulationMode } from '../../data/nfcAtoms';
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

const nfcSimOptions: readonly { value: NfcSimulationMode; label: string; icon: string }[] = [
    { value: 'forceSuccess', label: 'Success', icon: 'check' },
    { value: 'forceErrorWriteFailed', label: 'Write Fail', icon: 'wifi_off' },
    { value: 'forceErrorTagLocked', label: 'Tag Locked', icon: 'lock' },
    { value: 'random', label: 'Random', icon: 'casino' },
] as const;

export const DeveloperOverlay = () => {
  const [connectionStatus, setConnectionStatus] = useAtom(connectionStatusAtom);
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);
  const [nfcSimMode, setNfcSimMode] = useAtom(nfcSimulationAtom);

  const handleSlowLoadChange = (checked: boolean) => {
    setAppConfig(current => ({ ...current, isSlowLoadEnabled: checked }));
  };

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

      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>NFC simulation</h3>
        <p className={styles.sectionHelper}>Force the outcome of the next NFC tag write operation.</p>
        <IconToggleGroup
          options={nfcSimOptions}
          value={nfcSimMode}
          onValueChange={setNfcSimMode}
          id="nfc-sim-toggle"
        />
      </div>

      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Device settings</h3>
        <p className={styles.sectionHelper}>Select method for checks.</p>
        <IconToggleGroup
          id="scan-mode-toggle"
          options={scanModeOptions}
          value={appConfig.scanMode}
          onValueChange={(mode) => setAppConfig((c) => ({ ...c, scanMode: mode }))}
        />
      </div>
      
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Performance</h3>
        <p className={styles.sectionHelper}>Increase loading durations.</p>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <label htmlFor="slow-load-switch" className={styles.itemLabel}>
              Simulate slow loading
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