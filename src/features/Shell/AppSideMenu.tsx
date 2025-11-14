// src/features/Shell/AppSideMenu.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import {
  isSettingsModalOpenAtom,
  isDevToolsModalOpenAtom,
  isManualCheckModalOpenAtom,
  isWriteNfcModalOpenAtom,
  isContextSelectionModalOpenAtom,
  selectedFacilityGroupAtom,
  selectedFacilityUnitAtom,
} from '../../data/atoms';
import { facilityData } from '../../data/mock/facilityData';
import styles from './AppSideMenu.module.css';

const MenuItem = ({ icon, label, onClick, disabled = false }: { icon: string; label: string; onClick: () => void; disabled?: boolean }) => (
  <button className={styles.menuItem} onClick={onClick} disabled={disabled}>
    <span className="material-symbols-rounded">{icon}</span>
    {label}
  </button>
);

/**
 * A card component in the side menu that displays the current operational
 * context (Group and Unit) and allows the user to change it.
 */
const ContextSwitcherCard = () => {
  const setIsContextModalOpen = useSetAtom(isContextSelectionModalOpenAtom);
  const facilityGroupId = useAtomValue(selectedFacilityGroupAtom);
  const facilityUnitId = useAtomValue(selectedFacilityUnitAtom);

  const group = facilityData.find(g => g.id === facilityGroupId);
  const unit = group?.units.find(u => u.id === facilityUnitId);

  const groupDisplayName = group?.name || '—';
  const unitDisplayName = unit?.name || '—';

  return (
    <button className={styles.contextCard} onClick={() => setIsContextModalOpen(true)}>
      <div className={styles.contextInfo}>
        <span className={styles.contextLabel}>Group</span>
        <span className={styles.contextValue}>{groupDisplayName}</span>
        <span className={styles.contextLabel}>Unit</span>
        <span className={styles.contextValue}>{unitDisplayName}</span>
      </div>
      <span className="material-symbols-rounded">swap_horiz</span>
    </button>
  );
};

export const AppSideMenu = () => {
  const setIsSettingsOpen = useSetAtom(isSettingsModalOpenAtom);
  const setIsDevToolsOpen = useSetAtom(isDevToolsModalOpenAtom);
  const setIsManualCheckModalOpen = useSetAtom(isManualCheckModalOpenAtom);
  const setIsWriteNfcModalOpen = useSetAtom(isWriteNfcModalOpenAtom);

  return (
    <aside className={styles.sideMenu}>
      <header className={styles.header}>
        <h1 className={styles.title}>eSupervision</h1>
        <h2 className={styles.subtitle}>Room Check</h2>
        <div className={styles.headerSeparator} />
      </header>

      <main className={styles.content}>
        <ContextSwitcherCard />
        <div className={styles.separator} />
        
        <MenuItem icon="add_comment" label="Manual check" onClick={() => setIsManualCheckModalOpen(true)} />
        <MenuItem icon="nfc" label="Write NFC tag" onClick={() => setIsWriteNfcModalOpen(true)} />
        <MenuItem icon="code" label="Developer settings" onClick={() => setIsDevToolsOpen(true)} />
      </main>

      <footer className={styles.footer}>
        <button className={styles.userProfileCard} onClick={() => setIsSettingsOpen(true)}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Jane Doe</span>
            <span className={styles.userRole}>Officer #12344</span>
          </div>
          <span className="material-symbols-rounded">settings</span>
        </button>
      </footer>
    </aside>
  );
};