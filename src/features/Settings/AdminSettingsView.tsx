// src/features/Settings/AdminSettingsView.tsx
import { useAtom, useSetAtom } from 'jotai';
import { isWriteNfcModalOpenAtom, appConfigAtom } from '../../data/atoms';
import { Button } from '../../components/Button';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import styles from './SettingsView.module.css';

interface AdminSettingsViewProps {
  onBack: () => void;
}

// FIX: Add 'as const' to infer literal types ('qr', 'nfc') instead of 'string'.
const scanModeOptions = [
  { value: 'qr', label: 'QR Code', icon: 'qr_code_2' },
  { value: 'nfc', label: 'NFC', icon: 'nfc' },
] as const;

export const AdminSettingsView = ({ onBack }: AdminSettingsViewProps) => {
  const setIsModalOpen = useSetAtom(isWriteNfcModalOpenAtom);
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);

  const handleScanModeChange = (scanMode: 'qr' | 'nfc') => {
    setAppConfig((prev) => ({ ...prev, scanMode }));
  };

  return (
    <div className={styles.detailViewWrapper}>
      <header className={styles.detailHeader}>
        <Button variant="secondary" size="s" iconOnly onClick={onBack} aria-label="Back">
          <span className="material-symbols-rounded">arrow_back</span>
        </Button>
        <h2>Admin Tools</h2>
      </header>

      <div className={styles.settingsGroup}>
        <button className={styles.settingsItem} onClick={() => setIsModalOpen(true)}>
          <span className={styles.itemLabel}>Write NFC Tag</span>
          <div className={styles.itemValue}>
            <span className="material-symbols-rounded">chevron_right</span>
          </div>
        </button>
        {/* New Scan Mode setting */}
        <div className={styles.settingsItem}>
          <span className={styles.itemLabel}>Scan Mode</span>
          <IconToggleGroup
            options={scanModeOptions}
            value={appConfig.scanMode}
            onValueChange={handleScanModeChange}
            id="scan-mode-toggle"
          />
        </div>
      </div>
    </div>
  );
};