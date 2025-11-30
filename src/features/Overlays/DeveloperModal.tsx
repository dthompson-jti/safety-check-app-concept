// src/features/Overlays/DeveloperModal.tsx
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import {
  connectionStatusAtom,
  ConnectionStatus,
  appConfigAtom,
  hardwareSimulationAtom
} from '../../data/atoms';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import { addToastAtom, toastsAtom, ToastVariant } from '../../data/toastAtoms';
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

interface ToastDefinition {
  label: string;
  message: string;
  icon: string;
  variant: ToastVariant;
  logic: string;
  stableId?: string;
}

const toastDefinitions: ToastDefinition[] = [
  { label: 'Scan Success', message: 'Check completed', icon: 'check_circle', variant: 'success', logic: 'Valid QR scan processed.' },
  { label: 'Simple Submit', message: 'Check completed (Simple)', icon: 'check_circle', variant: 'success', logic: 'Simple Submit enabled.' },
  { label: 'Supplemental', message: 'Supplemental check saved', icon: 'task_alt', variant: 'success', logic: 'Unscheduled check added.' },
  { label: 'Sync Complete', message: 'Data synced', icon: 'cloud_done', variant: 'success', logic: 'Reconnection after offline.' },
  { label: 'Missed Check', message: 'Check for Room 101 missed', icon: 'history', variant: 'warning', logic: 'Ticker passes due + interval.', stableId: 'lifecycle-missed-check' },
  { label: 'Hardware Error', message: 'Camera/NFC failed', icon: 'error', variant: 'alert', logic: 'Hardware simulation active.' },
  { label: 'Neutral Info', message: 'No incomplete checks', icon: 'info', variant: 'neutral', logic: 'Action on empty list.' },
];

export const DeveloperModal = () => {
  const [connectionStatus, setConnectionStatus] = useAtom(connectionStatusAtom);
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);
  const [simulation, setSimulation] = useAtom(hardwareSimulationAtom);
  const dispatch = useSetAtom(dispatchActionAtom);
  const addToast = useSetAtom(addToastAtom);
  // UPDATED: Need access to active toasts to calculate the increment
  const activeToasts = useAtomValue(toastsAtom);
  const { trigger: triggerHaptic } = useHaptics();

  const handleSwitch = (setter: (val: boolean) => void) => (checked: boolean) => {
    triggerHaptic('light');
    setter(checked);
  };

  const handleResetData = () => {
    triggerHaptic('warning');
    dispatch({ type: 'RESET_DATA' });
    addToast({ message: 'Application data reset to defaults.', icon: 'delete', variant: 'neutral' });
  };

  const handleToastTrigger = (def: ToastDefinition) => {
    triggerHaptic('medium');

    let message = def.message;

    // UPDATED: Logic to simulate accumulating missed checks
    if (def.stableId === 'lifecycle-missed-check') {
      const existingToast = activeToasts.find(t => t.stableId === def.stableId);
      
      if (existingToast) {
        let count = 1;
        // Try to parse existing counter: "2 checks missed"
        const match = existingToast.message.match(/^(\d+)\s+checks\s+missed/i);
        
        if (match) {
          count = parseInt(match[1], 10);
        }
        
        // Increment count
        count++;
        message = `${count} checks missed`;
      }
    }

    addToast({ 
      message: message, 
      icon: def.icon, 
      variant: def.variant,
      stableId: def.stableId 
    });
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* 1. Data Management (Moved to Top) */}
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Data Management</h3>
        <Button variant="secondary" onClick={handleResetData}>
          <span className="material-symbols-rounded">restart_alt</span>
          Reset Application Data
        </Button>
      </div>

      {/* 2. Workflow Section */}
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
          
          <div className={styles.settingsItem}>
            <label htmlFor="missed-toasts-switch" className={styles.itemLabel}>Missed check toasts</label>
            <Switch
              id="missed-toasts-switch"
              checked={appConfig.missedCheckToastsEnabled}
              onCheckedChange={handleSwitch((c) => setAppConfig(cur => ({ ...cur, missedCheckToastsEnabled: c })))}
            />
          </div>

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

      {/* 3. Scan Settings */}
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Scan Settings</h3>
        <IconToggleGroup
          id="scan-mode-toggle"
          options={scanModeOptions}
          value={appConfig.scanMode}
          onValueChange={(mode) => { triggerHaptic('selection'); setAppConfig((c) => ({ ...c, scanMode: mode })); }}
        />
      </div>

      {/* 4. App Style */}
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

      {/* 5. Simulation */}
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

      {/* 6. Toast Playground (Added at Bottom) */}
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Toast Playground</h3>
        <div className={styles.toastGrid}>
          {toastDefinitions.map((def, index) => (
            <div key={index} className={styles.toastCard}>
              <button 
                className={styles.toastTrigger} 
                data-variant={def.variant}
                onClick={() => handleToastTrigger(def)}
              >
                <span className="material-symbols-rounded">{def.icon}</span>
                {def.label}
              </button>
              <span className={styles.toastLogic}>{def.logic}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};