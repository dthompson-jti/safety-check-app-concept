// src/features/Overlays/SettingsOverlay.tsx
import { useAtom } from 'jotai';
import { appConfigAtom } from '../../data/atoms';
import { Switch } from '../../components/Switch';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import styles from './SettingsOverlay.module.css';

const viewModeOptions = [
  { value: 'card', label: 'Card View', icon: 'grid_view' },
  { value: 'list', label: 'List View', icon: 'view_list' },
] as const;

export const SettingsOverlay = () => {
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);

  const handleHapticsChange = (checked: boolean) => {
    setAppConfig(currentConfig => ({ ...currentConfig, hapticsEnabled: checked }));
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsSection}>
        <h3 className={styles.sectionTitle}>PREFERENCES</h3>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <label id="schedule-view-label" className={styles.itemLabel}>
              Schedule View
            </label>
            <IconToggleGroup
              aria-labelledby="schedule-view-label"
              options={viewModeOptions}
              value={appConfig.scheduleViewMode}
              onValueChange={(value) => setAppConfig(c => ({...c, scheduleViewMode: value}))}
            />
          </div>
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
      {/* Other sections like Account, etc. would go here */}
    </div>
  );
};