// src/features/Overlays/SettingsOverlay.tsx
import { useAtom } from 'jotai';
import {
  appConfigAtom,
  connectionStatusAtom,
  isScheduleSearchActiveAtom,
} from '../../data/atoms';
import { Switch } from '../../components/Switch';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import styles from './SettingsOverlay.module.css';

const viewModeOptions = [
  { value: 'card', label: 'Card View', icon: 'grid_view' },
  { value: 'list', label: 'List View', icon: 'view_list' },
] as const;

const connectionOptions = [
  { value: 'online', label: 'Online', icon: 'wifi' },
  { value: 'offline', label: 'Offline', icon: 'wifi_off' },
] as const;

export const SettingsOverlay = () => {
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);
  const [connectionStatus, setConnectionStatus] = useAtom(connectionStatusAtom);
  const [isSearchActive, setIsSearchActive] = useAtom(isScheduleSearchActiveAtom);

  const handleHapticsChange = (checked: boolean) => {
    setAppConfig(currentConfig => ({ ...currentConfig, hapticsEnabled: checked }));
  };

  return (
    <div className={styles.overlayContainer}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Preferences</h3>
        <div className={styles.settingRow}>
          <label>Schedule View</label>
          <IconToggleGroup
            options={viewModeOptions}
            value={appConfig.scheduleViewMode}
            onValueChange={(value) => setAppConfig(c => ({...c, scheduleViewMode: value}))}
          />
        </div>
        {/* DEFINITIVE FIX: The Haptics toggle is now implemented to correctly update the appConfig object property. */}
        <div className={styles.settingRow}>
          <label>Haptic Feedback</label>
          <Switch checked={appConfig.hapticsEnabled} onCheckedChange={handleHapticsChange} />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Developer Tools</h3>
        <div className={styles.settingRow}>
          <label>Connection Status</label>
          <IconToggleGroup
            options={connectionOptions}
            value={connectionStatus}
            onValueChange={setConnectionStatus}
          />
        </div>
        {/* DEFINITIVE FIX: The dev toggle now uses its specific, correctly-typed atom, which resolves the 'unknown' to 'boolean' error. */}
        <div className={styles.settingRow}>
          <label>Force Search Bar Visible</label>
          <Switch checked={isSearchActive} onCheckedChange={setIsSearchActive} />
        </div>
      </div>
    </div>
  );
};