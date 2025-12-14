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
import { ActionListItem } from '../../components/ActionListItem';
import { APP_VERSION } from '../../config';
import styles from './AppSideMenu.module.css';

export const AppSideMenu = () => {
  const setIsSettingsOpen = useSetAtom(isSettingsModalOpenAtom);
  const setIsDevToolsOpen = useSetAtom(isDevToolsModalOpenAtom);
  const setIsFutureIdeasOpen = useSetAtom(isFutureIdeasModalOpenAtom);
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const setIsContextModalOpen = useSetAtom(isContextSelectionModalOpenAtom);
  const setSession = useSetAtom(sessionAtom);

  const session = useAtomValue(sessionAtom);
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
    setSession({ isAuthenticated: false, user: null });
  };

  return (
    <aside className={styles.sideMenu}>
      <header className={styles.header}>
        {/* Tap 7 times on logo to toggle Future Ideas */}
        <div className={styles.titleRow}>
          <h1 className={styles.title} onClick={handleFutureIdeasTap}>Safeguard</h1>
          <span className={styles.version}>{APP_VERSION}</span>
        </div>
        <div className={styles.headerSeparator} />
      </header>

      <main className={styles.content}>
        <ContextSwitcherCard
          groupId={facilityGroupId}
          unitId={facilityUnitId}
          onClick={() => setIsContextModalOpen(true)}
        />
        <div className={styles.separator} />

        <div className={styles.menuList}>
          <ActionListItem
            label="Write NFC tags"
            leadingIcon="nfc"
            onClick={() => setWorkflowState({ view: 'provisioning' })}
            showChevron={false}
          />
          <ActionListItem
            label="Developer tools"
            leadingIcon="code"
            onClick={() => setIsDevToolsOpen(true)}
            showChevron={false}
          />
          {futureIdeasUnlocked && (
            <ActionListItem
              label="Future Ideas"
              leadingIcon="lightbulb"
              onClick={() => setIsFutureIdeasOpen(true)}
              showChevron={false}
            />
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.menuList}>
          <ActionListItem
            label="Log out"
            leadingIcon="logout"
            onClick={handleLogout}
            showChevron={false}
          />
        </div>

        <div className={styles.separator} />

        <button className={styles.userProfileCard} onClick={() => setIsSettingsOpen(true)}>
          <span className={styles.userName}>{session.user?.displayName || 'Unknown User'}</span>
          <span className="material-symbols-rounded">settings</span>
        </button>
      </footer>
    </aside>
  );
};