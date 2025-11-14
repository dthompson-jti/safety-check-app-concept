// src/AppShell.tsx
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import {
  workflowStateAtom,
  currentTimeAtom,
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
import { SettingsOverlay } from './features/Overlays/SettingsOverlay';
import { DeveloperOverlay } from './features/Overlays/DeveloperOverlay';
import { FacilitySelectionModal } from './features/Overlays/FacilitySelectionModal';
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

  const [isSettingsOpen, setIsSettingsOpen] = useAtom(isSettingsModalOpenAtom);
  const [isDevToolsOpen, setIsDevToolsOpen] = useAtom(isDevToolsModalOpenAtom);

  const [sideMenuWidth, setSideMenuWidth] = useState(0);
  const sideMenuRef = useRef<HTMLDivElement>(null);
  const appChromeRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    const chromeElement = appChromeRef.current;
    if (!chromeElement) return;

    const observer = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        const height = entries[0].target.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      });
    });

    observer.observe(chromeElement);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-height');
    };
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

  // BUG FIX: The AppShell now ALWAYS renders its main structure.
  // The FacilitySelectionModal is rendered as a proper overlay, which
  // prevents the state bug that caused the menu to be "stuck open".
  return (
    <div className={styles.appContainer}>
      <motion.div
        ref={sideMenuRef}
        className={styles.sideMenuContainer}
        initial={false}
        animate={{ x: isMenuOpen ? 0 : -sideMenuWidth }}
        transition={viewTransition}
      >
        <AppSideMenu />
      </motion.div>

      <motion.div
        className={styles.mainViewWrapper}
        initial={false}
        animate={{
          x: isMenuOpen ? sideMenuWidth : 0,
        }}
        transition={viewTransition}
      >
        <MainLayout />

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
        
        <div ref={appChromeRef} className={styles.chromeContainer}>
          {connectionStatus !== 'online' && <OfflineBanner />}
          {isChromeVisible && <FloatingHeader />}
        </div>

        {isChromeVisible && <FloatingFooter />}
      </motion.div>

      <AnimatePresence>
        {workflowState.view === 'scanning' && <ScanView />}
        {workflowState.view === 'form' && <CheckFormView checkData={workflowState} />}
      </AnimatePresence>
      
      <FacilitySelectionModal />
      <WriteNfcTagModal />
      <SelectRoomModal />
      
      <FullScreenModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
        <SettingsOverlay />
      </FullScreenModal>
      <FullScreenModal isOpen={isDevToolsOpen} onClose={() => setIsDevToolsOpen(false)} title="Developer tools">
        <DeveloperOverlay />
      </FullScreenModal>
    </div>
  );
};