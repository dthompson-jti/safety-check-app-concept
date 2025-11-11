// src/AppShell.tsx
import { useEffect, useRef, useState } from 'react';
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

const viewTransition = {
  type: 'tween',
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
} as const;

export const AppShell = () => {
  const [appView, setAppView] = useAtom(appViewAtom);
  const workflowState = useAtomValue(workflowStateAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);

  const [isHistoryOpen, setIsHistoryOpen] = useAtom(isHistoryModalOpenAtom);
  const [isSettingsOpen, setIsSettingsOpen] = useAtom(isSettingsModalOpenAtom);
  const [isDevToolsOpen, setIsDevToolsOpen] = useAtom(isDevToolsModalOpenAtom);

  const [sideMenuWidth, setSideMenuWidth] = useState(0);
  const sideMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, [setCurrentTime]);

  useEffect(() => {
    if (sideMenuRef.current) {
      setSideMenuWidth(sideMenuRef.current.offsetWidth);
    }
  }, []);

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
    setAppView('dashboardTime');
  };

  return (
    <div className={styles.appContainer}>
      {/* ARCHITECTURE: The side menu is a direct child of the root container. */}
      <motion.div
        ref={sideMenuRef}
        className={styles.sideMenuContainer}
        initial={false}
        animate={{ x: isMenuOpen ? 0 : -sideMenuWidth }}
        transition={viewTransition}
      >
        <AppSideMenu />
      </motion.div>

      {/* 
        ARCHITECTURE REFACTOR: The mainViewWrapper now contains the ENTIRE main view,
        including the Header, Footer, and Banner. This is critical for the "push"
        animation, as this single element is transformed, moving all its children
        (the entire app shell) together.
      */}
      <motion.div
        className={styles.mainViewWrapper}
        initial={false}
        animate={{
          x: isMenuOpen ? sideMenuWidth : 0,
        }}
        transition={viewTransition}
      >
        {/* The main scrollable content area */}
        <MainLayout />

        {/* The backdrop for the side menu, now correctly covers the entire view */}
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

        {/* The persistent UI chrome is now INSIDE the animated wrapper */}
        {connectionStatus !== 'online' && <OfflineBanner />}
        {isChromeVisible && <FloatingHeader />}
        {isChromeVisible && <FloatingFooter />}
      </motion.div>

      {/* Workflow modals appear on top of everything else */}
      <AnimatePresence>
        {workflowState.view === 'scanning' && <ScanView />}
        {workflowState.view === 'form' && <CheckFormView checkData={workflowState} />}
      </AnimatePresence>
      
      {/* Contextual bottom sheet modals */}
      <WriteNfcTagModal />
      <SelectRoomModal />
      
      {/* Full-screen overlay modals */}
      <FullScreenModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="History">
        <HistoryOverlay />
      </FullScreenModal>
      <FullScreenModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
        <SettingsOverlay />
      </FullScreenModal>
      <FullScreenModal isOpen={isDevToolsOpen} onClose={() => setIsDevToolsOpen(false)} title="Developer tools">
        <DeveloperOverlay />
      </FullScreenModal>
    </div>
  );
};