// src/features/Shell/AppSideMenu.tsx
import { useSetAtom } from 'jotai';
import {
  isHistoryModalOpenAtom,
  isSettingsModalOpenAtom,
  isDevToolsModalOpenAtom,
  isSelectRoomModalOpenAtom,
  isWriteNfcModalOpenAtom,
} from '../../data/atoms';
import styles from './AppSideMenu.module.css';

const NavButton = ({ icon, label, onClick, disabled = false }: { icon: string; label: string; onClick: () => void; disabled?: boolean }) => (
  <button className={styles.navButton} onClick={onClick} disabled={disabled}>
    <span className="material-symbols-rounded">{icon}</span>
    {label}
  </button>
);

const units = [
  { id: 'unit1', name: 'Unit 1' },
  { id: 'unit2', name: 'Unit 2' },
  { id: 'unit3', name: 'Unit 3' },
  { id: 'unit4', name: 'Unit 4' },
  { id: 'death-star', name: 'Star Wars: Death Star' },
  { id: 'rocinante', name: 'The Expanse: Rocinante' },
  { id: 'hogwarts', name: 'Harry Potter: Hogwarts' },
  { id: 'lv-426', name: 'Aliens: LV-426' },
  { id: 'cyberdyne', name: 'Terminator: Cyberdyne' },
];

export const AppSideMenu = () => {
  const setIsHistoryOpen = useSetAtom(isHistoryModalOpenAtom);
  const setIsSettingsOpen = useSetAtom(isSettingsModalOpenAtom);
  const setIsDevToolsOpen = useSetAtom(isDevToolsModalOpenAtom);
  const setIsSelectRoomModalOpen = useSetAtom(isSelectRoomModalOpenAtom);
  const setIsWriteNfcModalOpen = useSetAtom(isWriteNfcModalOpenAtom);

  return (
    <aside className={styles.sideMenu}>
      <header className={styles.header}>
        <h1 className={styles.title}>eSupervision</h1>
        <h2 className={styles.subtitle}>Room Check</h2>
        <div className={styles.headerSeparator} />
      </header>

      <main className={styles.content}>
        <NavButton icon="add_comment" label="Supplemental Check" onClick={() => setIsSelectRoomModalOpen(true)} />
        <NavButton icon="nfc" label="Write NFC Tag" onClick={() => setIsWriteNfcModalOpen(true)} />
        <NavButton icon="history" label="History" onClick={() => setIsHistoryOpen(true)} />
        <NavButton icon="code" label="Developer settings" onClick={() => setIsDevToolsOpen(true)} />
        
        {/* DEFINITIVE FIX: Separator is moved to group the actions above. */}
        <div className={styles.separator} />

        {units.map(unit => (
          <NavButton 
            key={unit.id}
            icon="apps" 
            label={unit.name} 
            onClick={() => {}} 
            disabled 
          />
        ))}
      </main>

      <footer className={styles.footer}>
        <button className={styles.userSettingsButton} onClick={() => setIsSettingsOpen(true)}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Jane Doe</span>
            <span className={styles.userRole}>Officier #12344</span>
          </div>
          <span className="material-symbols-rounded">settings</span>
        </button>
      </footer>
    </aside>
  );
};