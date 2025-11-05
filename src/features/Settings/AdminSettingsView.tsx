// src/features/Settings/AdminSettingsView.tsx
import { useSetAtom } from 'jotai';
import { isWriteNfcModalOpenAtom } from '../../data/atoms';
import { Button } from '../../components/Button';
import styles from './SettingsView.module.css';

interface AdminSettingsViewProps {
  onBack: () => void;
}

export const AdminSettingsView = ({ onBack }: AdminSettingsViewProps) => {
  const setIsModalOpen = useSetAtom(isWriteNfcModalOpenAtom);

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
      </div>
    </div>
  );
};