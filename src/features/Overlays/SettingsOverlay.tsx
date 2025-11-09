// src/features/Overlays/SettingsOverlay.tsx
import React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  sessionAtom,
  isWriteNfcModalOpenAtom,
  appConfigAtom,
  isStatusOverviewOpenAtom,
} from '../../data/atoms';
import { Switch } from '../../components/Switch';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import styles from './SettingsOverlay.module.css';

// Local component for structuring the settings page
const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className={styles.settingsSection}>
    <h3 className={styles.sectionTitle}>{title}</h3>
    <div className={styles.settingsGroup}>{children}</div>
  </div>
);

const scanModeOptions = [
  { value: 'qr', label: 'QR Code', icon: 'qr_code_2' },
  { value: 'nfc', label: 'NFC', icon: 'nfc' },
] as const;

const viewModeOptions = [
  { value: 'card', label: 'Cards', icon: 'dashboard' },
  { value: 'list', label: 'List', icon: 'list' },
] as const;

export const SettingsOverlay = () => {
  const [session, setSession] = useAtom(sessionAtom);
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);
  const [isOverviewOpen, setIsOverviewOpen] = useAtom(isStatusOverviewOpenAtom);
  const setIsWriteNfcModalOpen = useSetAtom(isWriteNfcModalOpenAtom);

  const handleLogout = () => {
    setSession({ isAuthenticated: false, userName: null });
  };

  return (
    <div className={styles.settingsContainer}>
      <SettingsSection title="User info">
        <div className={styles.settingsItem}>
          <span className={styles.itemLabel}>Logged in as</span>
          <div className={`${styles.itemValue} ${styles.readOnlyValue}`}>
            {session.userName || 'Unknown'}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="View settings">
        <div className={styles.settingsItem}>
          <label htmlFor="view-mode-toggle" className={styles.itemLabel}>
            Schedule view
          </label>
          <IconToggleGroup
            id="view-mode-toggle"
            options={viewModeOptions}
            value={appConfig.scheduleViewMode}
            onValueChange={(mode) => setAppConfig((c) => ({ ...c, scheduleViewMode: mode }))}
          />
        </div>
        <div className={styles.settingsItem}>
          <label htmlFor="haptics-toggle" className={styles.itemLabel}>
            Haptic feedback
          </label>
          <Switch
            id="haptics-toggle"
            checked={appConfig.hapticsEnabled}
            onCheckedChange={(checked) => setAppConfig((c) => ({ ...c, hapticsEnabled: checked }))}
          />
        </div>
        <div className={styles.settingsItem}>
          <label htmlFor="overview-toggle" className={styles.itemLabel}>
            Show status overview
          </label>
          <Switch
            id="overview-toggle"
            checked={isOverviewOpen}
            onCheckedChange={setIsOverviewOpen}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Admin tools">
        <button className={styles.settingsItem} onClick={() => setIsWriteNfcModalOpen(true)}>
          <span className={styles.itemLabel}>Write NFC tag</span>
          <div className={styles.itemValue}>
            <span className="material-symbols-rounded">chevron_right</span>
          </div>
        </button>
        <div className={styles.settingsItem}>
          <label htmlFor="scan-mode-toggle" className={styles.itemLabel}>
            Scan mode
          </label>
          <IconToggleGroup
            id="scan-mode-toggle"
            options={scanModeOptions}
            value={appConfig.scanMode}
            onValueChange={(mode) => setAppConfig((c) => ({ ...c, scanMode: mode }))}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Session">
        <button className={`${styles.settingsItem} ${styles.destructive}`} onClick={handleLogout}>
          Log out
        </button>
      </SettingsSection>
    </div>
  );
};