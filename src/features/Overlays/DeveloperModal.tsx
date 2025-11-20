// src/features/Overlays/DeveloperModal.tsx
import { useAtom, useSetAtom } from 'jotai';
import {
  connectionStatusAtom,
  ConnectionStatus,
  appConfigAtom,
  hardwareSimulationAtom
} from '../../data/atoms';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import { Switch } from '../../components/Switch';
import { Button } from '../../components/Button';
import styles from './DeveloperModal.module.css';

const connectionOptions: readonly { value: ConnectionStatus; label: string; icon: string }[] = [
  { value: 'online', label: 'Online', icon: 'cloud' },
  { value: 'offline', label: 'Offline', icon: 'cloud_off' },
  { value: 'syncing', label: 'Syncing', icon: 'sync' },
] as const;

const scanModeOptions = [
  { value: 'qr', label: 'QR Code', icon: 'qr_code_2' },
  { value: 'nfc', label: 'NFC', icon: 'nfc' },
] as const;

export const DeveloperModal = () => {
  const [connectionStatus, setConnectionStatus] = useAtom(connectionStatusAtom);
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);
  const [simulation, setSimulation] = useAtom(hardwareSimulationAtom);
  const dispatch = useSetAtom(dispatchActionAtom);
  const addToast = useSetAtom(addToastAtom);

  const handleSlowLoadChange = (checked: boolean) => {
    setAppConfig(current => ({ ...current, isSlowLoadEnabled: checked }));
  };

  const handleCheckTypeChange = (checked: boolean) => {
    setAppConfig(current => ({ ...current, isCheckTypeEnabled: checked }));
  };

  const handleCameraFailChange = (checked: boolean) => {
    setSimulation(current => ({ ...current, cameraFails: checked }));
  };

  const handleNfcFailChange = (checked: boolean) => {
    setSimulation(current => ({ ...current, nfcFails: checked }));
  };

  const handleManualConfirmChange = (checked: boolean) => {
    setAppConfig(current => ({ ...current, manualConfirmationEnabled: checked }));
  };

  const handleMarkMultipleChange = (checked: boolean) => {
    setAppConfig(current => ({ ...current, markMultipleEnabled: checked }));
  };

  const handleSimpleSubmitChange = (checked: boolean) => {
    setAppConfig(current => ({ ...current, simpleSubmitEnabled: checked }));
  };

  const handleStatusIndicatorsChange = (checked: boolean) => {
    setAppConfig(current => ({ ...current, showStatusIndicators: checked }));
  };

  const handleResetData = () => {
    dispatch({ type: 'RESET_DATA' });
    addToast({ message: 'Application data reset to defaults.', icon: 'delete' });
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
        <h3 className={styles.sectionHeader}>Hardware Simulation</h3>
        <p className={styles.sectionHelper}>Simulate device hardware failures.</p>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <label htmlFor="camera-fail-switch" className={styles.itemLabel}>
              Force Camera Failure
            </label>
            <Switch
              id="camera-fail-switch"
              checked={simulation.cameraFails}
              onCheckedChange={handleCameraFailChange}
            />
          </div>
          <div className={styles.settingsItem}>
            <label htmlFor="nfc-fail-switch" className={styles.itemLabel}>
              Force NFC Reader Failure
            </label>
            <Switch
              id="nfc-fail-switch"
              checked={simulation.nfcFails}
              onCheckedChange={handleNfcFailChange}
            />
          </div>
        </div>
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
        <h3 className={styles.sectionHeader}>Feature Toggles</h3>
        <p className={styles.sectionHelper}>Enable or disable optional UI features.</p>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <label htmlFor="status-indicators-switch" className={styles.itemLabel}>
              Show status indicators (colored bars)
            </label>
            <Switch
              id="status-indicators-switch"
              checked={appConfig.showStatusIndicators}
              onCheckedChange={handleStatusIndicatorsChange}
            />
          </div>
          <div className={styles.settingsItem}>
            <label htmlFor="check-type-switch" className={styles.itemLabel}>
              Show check type
            </label>
            <Switch
              id="check-type-switch"
              checked={appConfig.isCheckTypeEnabled}
              onCheckedChange={handleCheckTypeChange}
            />
          </div>
          <div className={styles.settingsItem}>
            <label htmlFor="manual-confirm-switch" className={styles.itemLabel}>
              Manual confirmation
            </label>
            <Switch
              id="manual-confirm-switch"
              checked={appConfig.manualConfirmationEnabled}
              onCheckedChange={handleManualConfirmChange}
            />
          </div>
          <div className={styles.settingsItem}>
            <label htmlFor="mark-multiple-switch" className={styles.itemLabel}>
              Mark multiple
            </label>
            <Switch
              id="mark-multiple-switch"
              checked={appConfig.markMultipleEnabled}
              onCheckedChange={handleMarkMultipleChange}
            />
          </div>
          <div className={styles.settingsItem}>
            <label htmlFor="simple-submit-switch" className={styles.itemLabel}>
              Simple submit
            </label>
            <Switch
              id="simple-submit-switch"
              checked={appConfig.simpleSubmitEnabled}
              onCheckedChange={handleSimpleSubmitChange}
            />
          </div>
        </div>
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

      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Danger Zone</h3>
        <Button variant="secondary" onClick={handleResetData}>
           <span className="material-symbols-rounded">restart_alt</span>
           Reset Application Data
        </Button>
      </div>
    </div>
  );
};