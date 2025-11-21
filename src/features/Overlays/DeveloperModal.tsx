// src/features/Overlays/DeveloperModal.tsx
import { useAtom, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import {
  connectionStatusAtom,
  ConnectionStatus,
  appConfigAtom,
  hardwareSimulationAtom
} from '../../data/atoms';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
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
  const { trigger: triggerHaptic } = useHaptics();

  const handleSwitch = (setter: (val: boolean) => void) => (checked: boolean) => {
    triggerHaptic('light');
    setter(checked);
  };

  const handleResetData = () => {
    triggerHaptic('warning');
    dispatch({ type: 'RESET_DATA' });
    addToast({ message: 'Application data reset to defaults.', icon: 'delete' });
  };

  // Animation: Slide-in from right (x: 100% -> 0) to replicate native modal behavior.
  return (
    <motion.div
      className={styles.container}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* 1. Workflow Section */}
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Workflow</h3>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <label htmlFor="simple-submit-switch" className={styles.itemLabel}>Simple submit</label>
            <Switch
              id="simple-submit-switch"
              checked={appConfig.simpleSubmitEnabled}
              onCheckedChange={handleSwitch((c) => setAppConfig(cur => ({ ...cur, simpleSubmitEnabled: c })))}
            />
          </div>

          {/* Dependent Options - Disabled when Simple Submit is ON */}
          <div className={appConfig.simpleSubmitEnabled ? styles.disabledGroup : ''}>
            <div className={styles.settingsItem}>
              <label htmlFor="manual-confirm-switch" className={styles.itemLabel}>Manual confirmation</label>
              <Switch
                id="manual-confirm-switch"
                checked={appConfig.manualConfirmationEnabled}
                onCheckedChange={handleSwitch((c) => setAppConfig(cur => ({ ...cur, manualConfirmationEnabled: c })))}
              />
            </div>
            <div className={styles.settingsItem}>
              <label htmlFor="mark-multiple-switch" className={styles.itemLabel}>Mark multiple</label>
              <Switch
                id="mark-multiple-switch"
                checked={appConfig.markMultipleEnabled}
                onCheckedChange={handleSwitch((c) => setAppConfig(cur => ({ ...cur, markMultipleEnabled: c })))}
              />
            </div>
            <div className={styles.settingsItem}>
              <label htmlFor="check-type-switch" className={styles.itemLabel}>Show check type</label>
              <Switch
                id="check-type-switch"
                checked={appConfig.isCheckTypeEnabled}
                onCheckedChange={handleSwitch((c) => setAppConfig(cur => ({ ...cur, isCheckTypeEnabled: c })))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scan Settings */}
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Scan Settings</h3>
        <IconToggleGroup
          id="scan-mode-toggle"
          options={scanModeOptions}
          value={appConfig.scanMode}
          onValueChange={(mode) => { triggerHaptic('selection'); setAppConfig((c) => ({ ...c, scanMode: mode })); }}
        />
      </div>

      {/* 3. App Style */}
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>App Style</h3>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <label htmlFor="status-indicators-switch" className={styles.itemLabel}>Show status indicators</label>
            <Switch
              id="status-indicators-switch"
              checked={appConfig.showStatusIndicators}
              onCheckedChange={handleSwitch((c) => setAppConfig(cur => ({ ...cur, showStatusIndicators: c })))}
            />
          </div>
        </div>
      </div>

      {/* 4. Simulation */}
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Simulation</h3>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <label htmlFor="camera-fail-switch" className={styles.itemLabel}>Force Camera Failure</label>
            <Switch
              id="camera-fail-switch"
              checked={simulation.cameraFails}
              onCheckedChange={handleSwitch((checked) => setSimulation(c => ({ ...c, cameraFails: checked })))}
            />
          </div>
          <div className={styles.settingsItem}>
            <label htmlFor="slow-load-switch" className={styles.itemLabel}>Simulate slow loading</label>
            <Switch
              id="slow-load-switch"
              checked={appConfig.isSlowLoadEnabled}
              onCheckedChange={handleSwitch((c) => setAppConfig(cur => ({ ...cur, isSlowLoadEnabled: c })))}
            />
          </div>
        </div>

        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <IconToggleGroup
            options={connectionOptions}
            value={connectionStatus}
            onValueChange={(val) => { triggerHaptic('selection'); setConnectionStatus(val); }}
            id="connection-status-toggle"
            fullWidth
          />
        </div>
      </div>

      {/* 5. Data Management */}
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Data Management</h3>
        <Button variant="secondary" onClick={handleResetData}>
          <span className="material-symbols-rounded">restart_alt</span>
          Reset Application Data
        </Button>
      </div>
    </motion.div>
  );
};