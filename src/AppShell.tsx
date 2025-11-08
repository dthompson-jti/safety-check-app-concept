// src/AppShell.tsx
import { useEffect } from 'react';
import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import {
  workflowStateAtom,
  currentTimeAtom,
  isHistoryModalOpenAtom,
  isSettingsModalOpenAtom,
  isDevToolsModalOpenAtom,
  connectionStatusAtom,
  appViewAtom,
} from './data/atoms';
import { MainLayout } from './layouts/MainLayout';
import { AppSideMenu } from './features/Shell/AppSideMenu';
import { FloatingHeader } from './features/Shell/FloatingHeader';
import { FloatingFooter } from './features/Shell/FloatingFooter';
import { OfflineBanner } from './features/Shell/OfflineBanner';
import { ScanView } from './features/Workflow/ScanView';
import { CheckFormView } from './features/Workflow/CheckFormView';
import { WriteNfcTagModal } from './features/Overlays/WriteNfcTagModal';
import { SelectRoomModal } from './features/Overlays/SelectRoomModal';
import { FullScreenModal } from './components/FullScreenModal';
import { HistoryOverlay } from './features/Overlays/HistoryOverlay';
import { SettingsOverlay } from './features/Overlays/SettingsOverlay';
import { DeveloperOverlay } from './features/Overlays/DeveloperOverlay';
import styles from './AppShell.module.css';

// DEFINITIVE FIX: Use 'as const' to give TypeScript the specific literal
// types that Framer Motion's 'transition' prop expects.
const viewTransition = {
  type: 'tween',
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
} as const;

/**
 * AppShell is the top-level component that orchestrates the entire UI.
 * It manages the root layout animation (side menu vs. main content) and
 * conditionally displays overlay views based on global state.
 */
export const AppShell = () => {
  const [appView, setAppView] = useAtom(appViewAtom);
  const workflowState = useAtomValue(workflowStateAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);

  const [isHistoryOpen, setIsHistoryOpen] = useAtom(isHistoryModalOpenAtom);
  const [isSettingsOpen, setIsSettingsOpen] = useAtom(isSettingsModalOpenAtom);
  const [isDevToolsOpen, setIsDevToolsOpen] = useAtom(isDevToolsModalOpenAtom);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, [setCurrentTime]);

  useEffect(() => {
    if (workflowState.view === 'form' && workflowState.residents && workflowState.residents.length > 0) {
      document.title = `Safety Check - ${workflowState.residents[0].location}`;
    } else {
      document.title = 'Safety Check App';
    }
  }, [workflowState]);

  const isMenuOpen = appView === 'sideMenu';
  const isChromeVisible = workflowState.view !== 'scanning' && workflowState.view !== 'form';

  const closeMenu = () => {
    setAppView('dashboardTime'); // Default back to time view
  };

  return (
    <div className={styles.appContainer}>
      <motion.div
        className={styles.sideMenuContainer}
        initial={false}
        animate={{ x: isMenuOpen ? '0%' : '-100%' }}
        transition={viewTransition}
      >
        <AppSideMenu />
      </motion.div>

      <motion.div
        className={styles.mainViewWrapper}
        initial={false}
        animate={{
          x: isMenuOpen ? '85%' : '0%',
        }}
        transition={viewTransition}
      >
        {connectionStatus !== 'online' && <OfflineBanner />}
        {isChromeVisible && <FloatingHeader />}

        <MainLayout />

        {isChromeVisible && <FloatingFooter />}

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {workflowState.view === 'scanning' && <ScanView />}
        {workflowState.view === 'form' && <CheckFormView checkData={workflowState} />}
      </AnimatePresence>

      <WriteNfcTagModal />
      <SelectRoomModal />

      <FullScreenModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="History">
        <HistoryOverlay />
      </FullScreenModal>
      <FullScreenModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
        <SettingsOverlay />
      </FullScreenModal>
      <FullScreenModal isOpen={isDevToolsOpen} onClose={() => setIsDevToolsOpen(false)} title="Developer Tools">
        <DeveloperOverlay />
      </FullScreenModal>
    </div>
  );
};