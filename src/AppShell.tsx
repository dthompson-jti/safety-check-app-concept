// src/AppShell.tsx
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { motion, AnimatePresence, useTransform, animate } from 'framer-motion';
import {
  workflowStateAtom,
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
import { ProvisionNfcView } from './features/Workflow/ProvisionNfcView';
import { ManualSelectionView } from './features/Overlays/ManualSelectionView';
import { FullScreenModal } from './components/FullScreenModal';
import { SettingsOverlay } from './features/Overlays/SettingsOverlay';
import { DeveloperOverlay } from './features/Overlays/DeveloperOverlay';
import { FacilitySelectionModal } from './features/Overlays/FacilitySelectionModal';
import { GestureProvider, useGestureContext } from './context/GestureContext';
import styles from './AppShell.module.css';

const viewTransition = {
  type: 'tween',
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
} as const;

const AppShellContent = () => {
  const [appView, setAppView] = useAtom(appViewAtom);
  const workflowState = useAtomValue(workflowStateAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);

  const [isSettingsOpen, setIsSettingsOpen] = useAtom(isSettingsModalOpenAtom);
  const [isDevToolsOpen, setIsDevToolsOpen] = useAtom(isDevToolsModalOpenAtom);

  const [sideMenuWidth, setSideMenuWidth] = useState(0);
  const sideMenuRef = useRef<HTMLDivElement>(null);
  const appChromeRef = useRef<HTMLDivElement>(null);

  // Gesture State
  const { filmStripProgress, sideMenuProgress } = useGestureContext();
  const isDragging = useRef(false);
  const startX = useRef(0);

  // We track the "base" progress for the film strip (0 or 1) to add the drag delta to it.
  const initialFilmStripProgress = useRef(0);

  useEffect(() => {
    if (sideMenuRef.current) {
      setSideMenuWidth(sideMenuRef.current.offsetWidth);
    }
  }, []);

  // Sync motion values with atom state when not dragging
  useEffect(() => {
    if (isDragging.current) return;

    if (appView === 'sideMenu') {
      animate(sideMenuProgress, 1, viewTransition);
    } else {
      animate(sideMenuProgress, 0, viewTransition);
    }

    if (appView === 'dashboardRoute') {
      animate(filmStripProgress, 1, viewTransition);
    } else if (appView === 'dashboardTime' || appView === 'sideMenu') {
      animate(filmStripProgress, 0, viewTransition);
    }
  }, [appView, filmStripProgress, sideMenuProgress]);


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
    if (workflowState.view === 'form' && 'residents' in workflowState && workflowState.residents.length > 0) {
      document.title = `Safety Check - ${workflowState.residents[0].location}`;
    } else {
      document.title = 'Safety Check App';
    }
  }, [workflowState]);

  const isChromeVisible = workflowState.view === 'none';

  const closeMenu = () => {
    setAppView('dashboardTime');
  };

  // --- Gesture Logic ---

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only enable gestures if we are in the main "none" workflow view
    if (workflowState.view !== 'none') return;

    // Just track the start position, don't capture yet
    startX.current = e.clientX;
    initialFilmStripProgress.current = filmStripProgress.get();
    isDragging.current = false; // Reset dragging state
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // If we are already dragging, continue logic
    if (isDragging.current) {
      const deltaX = e.clientX - startX.current;
      const viewportWidth = window.innerWidth;
      const deltaProgress = deltaX / viewportWidth;

      // Scenario 1: Handling Side Menu Drag
      if (appView === 'sideMenu') {
        const newProgress = Math.max(0, Math.min(1, 1 + (deltaX / sideMenuWidth)));
        sideMenuProgress.set(newProgress);
        return;
      }

      if (appView === 'dashboardTime' && deltaX > 0) {
        const newProgress = Math.max(0, Math.min(1, deltaX / sideMenuWidth));
        sideMenuProgress.set(newProgress);
        return;
      }

      // Scenario 2: Handling Film Strip Drag
      if (sideMenuProgress.get() === 0) {
        const newProgress = Math.max(0, Math.min(1, initialFilmStripProgress.current - deltaProgress));
        filmStripProgress.set(newProgress);
      }
      return;
    }

    // If not dragging yet, check threshold
    if (e.buttons > 0 || e.pointerType === 'touch') {
      const deltaX = Math.abs(e.clientX - startX.current);
      if (deltaX > 10) {
        isDragging.current = true;
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) {
      // It was a tap (or very small drag), let click events propagate
      return;
    }

    isDragging.current = false;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);

    const deltaX = e.clientX - startX.current;

    // Thresholds
    const SWIPE_THRESHOLD = 50; // px
    const PROGRESS_THRESHOLD = 0.4; // 40%

    // 1. Side Menu Logic
    if (appView === 'sideMenu') {
      // Closing
      if (deltaX < -SWIPE_THRESHOLD || sideMenuProgress.get() < (1 - PROGRESS_THRESHOLD)) {
        setAppView('dashboardTime');
      } else {
        // Snap back to open
        animate(sideMenuProgress, 1, viewTransition);
      }
      return;
    }

    if (appView === 'dashboardTime' && deltaX > SWIPE_THRESHOLD) {
      // Opening Side Menu
      if (deltaX > sideMenuWidth * PROGRESS_THRESHOLD) {
        setAppView('sideMenu');
      } else {
        // Snap back to closed
        animate(sideMenuProgress, 0, viewTransition);
      }
      return;
    }

    // 2. Film Strip Logic
    if (sideMenuProgress.get() === 0) {
      const currentProgress = filmStripProgress.get();

      if (appView === 'dashboardTime') {
        // Trying to go to Route (drag left, positive progress)
        if (currentProgress > PROGRESS_THRESHOLD) {
          setAppView('dashboardRoute');
        } else {
          animate(filmStripProgress, 0, viewTransition);
        }
      } else if (appView === 'dashboardRoute') {
        // Trying to go to Time (drag right, negative progress)
        if (currentProgress < (1 - PROGRESS_THRESHOLD)) {
          setAppView('dashboardTime');
        } else {
          animate(filmStripProgress, 1, viewTransition);
        }
      }
    }
  };

  // Derived transforms for layout
  const mainViewX = useTransform(sideMenuProgress, [0, 1], [0, sideMenuWidth]);
  const sideMenuX = useTransform(sideMenuProgress, [0, 1], [-sideMenuWidth, 0]);
  const backdropOpacity = useTransform(sideMenuProgress, [0, 1], [0, 1]);
  const backdropPointerEvents = useTransform(sideMenuProgress, (v) => v > 0 ? 'auto' : 'none');

  return (
    <div
      className={styles.appContainer}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ touchAction: 'pan-y' }}
    >
      <motion.div
        ref={sideMenuRef}
        className={styles.sideMenuContainer}
        style={{ x: sideMenuX }}
      >
        <AppSideMenu />
      </motion.div>

      <motion.div
        className={styles.mainViewWrapper}
        style={{ x: mainViewX }}
      >
        <MainLayout />

        <motion.div
          className={styles.backdrop}
          style={{ opacity: backdropOpacity, pointerEvents: backdropPointerEvents }}
          onClick={closeMenu}
        />

        <div ref={appChromeRef} className={styles.chromeContainer}>
          {connectionStatus !== 'online' && <OfflineBanner />}
          {isChromeVisible && <FloatingHeader />}
        </div>

        {isChromeVisible && <FloatingFooter />}
      </motion.div>

      <AnimatePresence>
        {workflowState.view === 'scanning' && <ScanView />}
        {workflowState.view === 'form' && <CheckFormView checkData={workflowState} />}
        {workflowState.view === 'provisioning' && <ProvisionNfcView />}
      </AnimatePresence>

      <FacilitySelectionModal />
      <ManualSelectionView />

      <FullScreenModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
        <SettingsOverlay />
      </FullScreenModal>
      <FullScreenModal isOpen={isDevToolsOpen} onClose={() => setIsDevToolsOpen(false)} title="Developer tools">
        <DeveloperOverlay />
      </FullScreenModal>
    </div>
  );
};

export const AppShell = () => (
  <GestureProvider>
    <AppShellContent />
  </GestureProvider>
);