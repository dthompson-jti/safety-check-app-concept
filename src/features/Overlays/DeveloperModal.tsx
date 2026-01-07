// src/features/Overlays/DeveloperModal.tsx
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import {
  appConfigAtom,
  hardwareSimulationAtom,
  connectionStatusAtom,
  isOfflineToggleVisibleAtom,
  ConnectionStatus,
} from '../../data/atoms';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import { addToastAtom, toastsAtom, ToastVariant } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';

import { SegmentedControl } from '../../components/SegmentedControl';
import { Switch } from '../../components/Switch';
import { Button } from '../../components/Button';
import styles from './DeveloperModal.module.css';



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
  const [connectionStatus, setConnectionStatus] = useAtom(connectionStatusAtom);
  const [isOfflineToggleVisible, setIsOfflineToggleVisible] = useAtom(isOfflineToggleVisibleAtom);
  const dispatch = useSetAtom(dispatchActionAtom);
  const addToast = useSetAtom(addToastAtom);
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
        <span className={styles.shortcutHint}>Shortcut: Ctrl+Backspace</span>
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

          <div className={appConfig.simpleSubmitEnabled ? styles.disabledGroup : ''}>
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
          <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
            <label className={styles.itemLabel}>Header style</label>
            <SegmentedControl
              id="header-style-toggle"
              options={[
                { value: 'secondary', label: 'Secondary' },
                { value: 'tertiary', label: 'Tertiary' },
                { value: 'quaternary', label: 'Quaternary' },
              ]}
              value={appConfig.headerStyle || 'secondary'}
              onValueChange={(val) => {
                triggerHaptic('selection');
                setAppConfig((c) => ({ ...c, headerStyle: val }));
              }}
            />
          </div>

          <div className={styles.settingsItem}>
            <label htmlFor="show-env-name-switch" className={styles.itemLabel}>Show environment name</label>
            <Switch
              id="show-env-name-switch"
              checked={appConfig.showEnvironmentName}
              onCheckedChange={handleSwitch((c) => setAppConfig(cur => ({ ...cur, showEnvironmentName: c })))}
            />
          </div>

          {appConfig.showEnvironmentName && (
            <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
              <label htmlFor="env-name-input" className={styles.itemLabel}>Environment name</label>
              <input
                id="env-name-input"
                className={styles.textInput}
                type="text"
                value={appConfig.environmentName}
                onChange={(e) => setAppConfig(cur => ({ ...cur, environmentName: e.target.value }))}
                placeholder="e.g. https://vicbc-qa-symphony.logan-symphony.com"
              />
            </div>
          )}
        </div>
      </div>


      {/* 5. Simulation */}
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Simulation</h3>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
            <label className={styles.itemLabel}>Connectivity</label>
            <SegmentedControl
              id="connectivity-toggle"
              options={[
                { value: 'online', label: 'Online', icon: 'cloud' },
                { value: 'offline', label: 'Offline', icon: 'cloud_off' },
              ]}
              value={connectionStatus === 'offline' ? 'offline' : 'online'}
              onValueChange={(val) => {
                triggerHaptic('selection');
                setConnectionStatus(val as ConnectionStatus);
              }}
              itemDirection="column"
            />
          </div>
          <div className={styles.settingsItem}>
            <label htmlFor="offline-toggle-visible-switch" className={styles.itemLabel}>Show offline toggle</label>
            <Switch
              id="offline-toggle-visible-switch"
              checked={isOfflineToggleVisible}
              onCheckedChange={handleSwitch((checked) => setIsOfflineToggleVisible(checked))}
            />
          </div>
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
            <label htmlFor="nfc-blocked-switch" className={styles.itemLabel}>Force NFC Blocked</label>
            <Switch
              id="nfc-blocked-switch"
              checked={simulation.nfcBlocked}
              onCheckedChange={handleSwitch((checked) => setSimulation(c => ({ ...c, nfcBlocked: checked })))}
            />
          </div>
          <div className={styles.settingsItem}>
            <label htmlFor="nfc-off-switch" className={styles.itemLabel}>Force NFC Turned Off</label>
            <Switch
              id="nfc-off-switch"
              checked={simulation.nfcTurnedOff}
              onCheckedChange={handleSwitch((checked) => setSimulation(c => ({ ...c, nfcTurnedOff: checked })))}
            />
          </div>

          {/* NFC Scan Timeout Duration */}
          <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
            <label className={styles.itemLabel}>Scan timeout</label>
            <SegmentedControl
              id="nfc-timeout-toggle"
              options={[
                { value: 'off', label: 'Off' },
                { value: '5000', label: '5s' },
                { value: '10000', label: '10s' },
                { value: '15000', label: '15s' },
                { value: '30000', label: '30s' },
              ]}
              value={appConfig.nfcTimeoutEnabled ? String(appConfig.nfcScanTimeout) : 'off'}
              onValueChange={(val) => {
                triggerHaptic('selection');
                if (val === 'off') {
                  setAppConfig((c) => ({ ...c, nfcTimeoutEnabled: false }));
                } else {
                  setAppConfig((c) => ({ ...c, nfcTimeoutEnabled: true, nfcScanTimeout: Number(val) }));
                }
              }}
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

      {/* 7. Toast Playground (Added at Bottom) */}
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
    </motion.div >
  );
};