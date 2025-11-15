// src/features/Shell/AppSideMenu.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import {
  isSettingsModalOpenAtom,
  isDevToolsModalOpenAtom,
  isManualCheckModalOpenAtom,
  isContextSelectionModalOpenAtom,
  selectedFacilityGroupAtom,
  selectedFacilityUnitAtom,
  workflowStateAtom,
} from '../../data/atoms';
import { ContextSwitcherCard } from './ContextSwitcherCard';
import styles from './AppSideMenu.module.css';

const MenuItem = ({ icon, label, onClick, disabled = false }: { icon: string; label: string; onClick: () => void; disabled?: boolean }) => (
  <button className={styles.menuItem} onClick={onClick} disabled={disabled}>
    <span className="material-symbols-rounded">{icon}</span>
    {label}
  </button>
);

export const AppSideMenu = () => {
  const setIsSettingsOpen = useSetAtom(isSettingsModalOpenAtom);
  const setIsDevToolsOpen = useSetAtom(isDevToolsModalOpenAtom);
  const setIsManualCheckModalOpen = useSetAtom(isManualCheckModalOpenAtom);
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const setIsContextModalOpen = useSetAtom(isContextSelectionModalOpenAtom);

  const facilityGroupId = useAtomValue(selectedFacilityGroupAtom);
  const facilityUnitId = useAtomValue(selectedFacilityUnitAtom);

  return (
    <aside className={styles.sideMenu}>
      <header className={styles.header}>
        <h1 className={styles.title}>eSupervision</h1>
        <h2 className={styles.subtitle}>Room Check</h2>
        <div className={styles.headerSeparator} />
      </header>

      <main className={styles.content}>
        <ContextSwitcherCard
          groupId={facilityGroupId}
          unitId={facilityUnitId}
          onClick={() => setIsContextModalOpen(true)}
        />
        <div className={styles.separator} />
        
        <MenuItem icon="add_comment" label="Manual check" onClick={() => setIsManualCheckModalOpen(true)} />
        <MenuItem icon="nfc" label="Write NFC tag" onClick={() => setWorkflowState({ view: 'provisioning' })} />
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