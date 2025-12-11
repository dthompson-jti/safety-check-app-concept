// src/features/Shell/AppSideMenu.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import { useCallback } from 'react';
import {
  sessionAtom,
  isSettingsModalOpenAtom,
  isDevToolsModalOpenAtom,
  isContextSelectionModalOpenAtom,
  selectedFacilityGroupAtom,
  selectedFacilityUnitAtom,
  isFutureIdeasModalOpenAtom,
  workflowStateAtom,
} from '../../data/atoms';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { useAppSound } from '../../data/useAppSound';
import { useFutureIdeas } from './../../data/featureFlags';
import { useTapCounter } from '../../hooks/useTapCounter';
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
  const setIsFutureIdeasOpen = useSetAtom(isFutureIdeasModalOpenAtom);
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const setIsContextModalOpen = useSetAtom(isContextSelectionModalOpenAtom);
  const setSession = useSetAtom(sessionAtom);

  const facilityGroupId = useAtomValue(selectedFacilityGroupAtom);
  const facilityUnitId = useAtomValue(selectedFacilityUnitAtom);

  const { toggle: toggleFutureIdeas, isUnlocked: futureIdeasUnlocked } = useFutureIdeas();
  const addToast = useSetAtom(addToastAtom);
  const { trigger: triggerHaptic } = useHaptics();
  const { play: playSound } = useAppSound();

  // Tap counter with feedback
  const toggleFutureIdeasWithFeedback = useCallback(() => {
    const willBeUnlocked = !futureIdeasUnlocked;
    toggleFutureIdeas();

    // Haptic + Sound + Toast feedback
    triggerHaptic(willBeUnlocked ? 'success' : 'light');
    if (willBeUnlocked) playSound('success');
    addToast({
      message: willBeUnlocked ? 'Future Ideas Unlocked' : 'Future Ideas Hidden',
      icon: willBeUnlocked ? 'lightbulb' : 'lightbulb_outline',
      variant: 'neutral',
    });
  }, [toggleFutureIdeas, futureIdeasUnlocked, addToast, triggerHaptic, playSound]);

  const { onTap: handleFutureIdeasTap } = useTapCounter(toggleFutureIdeasWithFeedback, 7, 3000);

  const handleLogout = () => {
    setSession({ isAuthenticated: false, userName: null });
  };

  return (
    <aside className={styles.sideMenu}>
      <header className={styles.header}>
        {/* Tap 7 times on logo to toggle Future Ideas */}
        <h1 className={styles.title} onClick={handleFutureIdeasTap}>Safeguard</h1>
        <div className={styles.headerSeparator} />
      </header>

      <main className={styles.content}>
        <ContextSwitcherCard
          groupId={facilityGroupId}
          unitId={facilityUnitId}
          onClick={() => setIsContextModalOpen(true)}
        />
        <div className={styles.separator} />

        <MenuItem icon="nfc" label="Write NFC tags" onClick={() => setWorkflowState({ view: 'provisioning' })} />
        <MenuItem icon="code" label="Developer tools" onClick={() => setIsDevToolsOpen(true)} />
        {futureIdeasUnlocked && <MenuItem icon="lightbulb" label="Future Ideas" onClick={() => setIsFutureIdeasOpen(true)} />}

      </main>

      <footer className={styles.footer}>
        <MenuItem icon="logout" label="Log out" onClick={handleLogout} />

        <div className={styles.separator} />

        <button className={styles.userProfileCard} onClick={() => setIsSettingsOpen(true)}>
          <span className={styles.userName}>Jane Doe</span>
          <span className="material-symbols-rounded">settings</span>
        </button>
      </footer>
    </aside>
  );
};