// src/features/Overlays/DeveloperModal.tsx
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import {
  appConfigAtom,
  hardwareSimulationAtom
} from '../../data/atoms';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import { addToastAtom, toastsAtom, ToastVariant } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Switch } from '../../components/Switch';
import { Button } from '../../components/Button';
import styles from './DeveloperModal.module.css';

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
  { label: 'Sync Complete', message: 'Data synced', icon: 'cloud_done', variant: 'success', logic: 'Reconnection after offline.' },
  { label: 'Missed Check', message: 'Check for Room 101 missed', icon: 'history', variant: 'warning', logic: 'Ticker passes due + interval.', stableId: 'lifecycle-missed-check' },
  { label: 'Camera Error', message: 'Camera not responding.\nTry restarting your device.', icon: 'no_photography', variant: 'alert', logic: 'Simulated camera failure.' },
  { label: 'NFC Error', message: 'Tag not read.\nHold phone steady against the tag.', icon: 'wifi_tethering_error', variant: 'alert', logic: 'Simulated NFC read failure.' },
];

export const DeveloperModal = () => {
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

          {/* PRD-07: Resident Status Count (2-7) */}
          <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
            <label className={styles.itemLabel}>Status count</label>
            <SegmentedControl
              id="resident-status-count-toggle"
              options={[
                { value: 'set-2', label: '2' },
                { value: 'set-3', label: '3' },
                { value: 'set-4', label: '4' },
                { value: 'set-5', label: '5' },
                { value: 'set-6', label: '6' },
                { value: 'set-7', label: '7' },
              ]}
              value={appConfig.residentStatusSet}
              onValueChange={(val) => { triggerHaptic('selection'); setAppConfig((c) => ({ ...c, residentStatusSet: val })); }}
            />
          </div>

          {/* PRD-07: Status Layout Toggle */}
          <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
            <label className={styles.itemLabel}>Status layout</label>
            <SegmentedControl
              id="status-layout-toggle"
              options={[
                { value: 'row', label: 'Row' },
                { value: 'column', label: 'Column' },
                { value: 'grid', label: 'Grid' },
              ]}
              value={appConfig.markMultipleLayout}
              onValueChange={(val) => { triggerHaptic('selection'); setAppConfig((c) => ({ ...c, markMultipleLayout: val })); }}
            />
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
            <label htmlFor="nfc-fail-switch" className={styles.itemLabel}>Force NFC Failure</label>
            <Switch
              id="nfc-fail-switch"
              checked={simulation.nfcFails}
              onCheckedChange={handleSwitch((checked) => setSimulation(c => ({ ...c, nfcFails: checked })))}
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
      </div>

      {/* 6. Toast Playground (Added at Bottom) */}
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Toast Playground</h3>
        <div className={styles.toastGrid}>
          {toastDefinitions.map((def, index) => (
            <div key={index} className={styles.toastPlaygroundItem}>
              <Button
                variant="secondary"
                onClick={() => handleToastTrigger(def)}
              >
                <span className="material-symbols-rounded">{def.icon}</span>
                {def.label}
              </Button>
              <p className={styles.toastDescription}>{def.logic}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};