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
import { AppHeader } from './features/Shell/AppHeader';
import { AppFooter } from './features/Shell/AppFooter';
import { OfflineBanner } from './features/Shell/OfflineBanner';
import { ScanView } from './features/Workflow/ScanView';
import { CheckEntryView } from './features/Workflow/CheckEntryView';
import { NfcWriteView } from './features/Workflow/NfcWriteView';
import { ManualCheckSelectorSheet } from './features/Overlays/ManualCheckSelectorSheet';
import { FullScreenModal } from './components/FullScreenModal';
import { SettingsModal } from './features/Overlays/SettingsModal';
import { DeveloperModal } from './features/Overlays/DeveloperModal';
import { FacilitySelectionModal } from './features/Overlays/FacilitySelectionModal';
import { GestureProvider } from './data/GestureProvider';
import { useGestureContext } from './data/GestureContext';
import styles from './AppShell.module.css';

const viewTransition = {
  type: 'tween',
  duration: 0.25,
  ease: [0.25, 1, 0.5, 1],
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
  const startY = useRef(0);

  const initialFilmStripProgress = useRef(0);

  useEffect(() => {
    if (sideMenuRef.current) {
      setSideMenuWidth(sideMenuRef.current.offsetWidth);
    }
  }, []);

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

  const closeMenu = () => {
    setAppView('dashboardTime');
  };

  // --- Intent-Based Gesture Logic ---
  // This logic distinguishes between vertical scrolling and horizontal navigation swipes.
  // It ensures native scrolling performance is preserved while enabling full-screen gestures.

  const handlePointerDown = (e: React.PointerEvent) => {
    if (workflowState.view !== 'none') return;

    startX.current = e.clientX;
    startY.current = e.clientY;
    initialFilmStripProgress.current = filmStripProgress.get();
    isDragging.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      const deltaX = e.clientX - startX.current;
      const viewportWidth = window.innerWidth;
      const deltaProgress = deltaX / viewportWidth;

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

      if (sideMenuProgress.get() === 0) {
        const newProgress = Math.max(0, Math.min(1, initialFilmStripProgress.current - deltaProgress));
        filmStripProgress.set(newProgress);
      }
      return;
    }

    if (e.buttons > 0 || e.pointerType === 'touch') {
      const deltaX = Math.abs(e.clientX - startX.current);
      const deltaY = Math.abs(e.clientY - startY.current);
      const DRAG_THRESHOLD = 10;

      // Only capture if horizontal movement exceeds threshold AND is dominant (Intent Detection)
      if (deltaX > DRAG_THRESHOLD && deltaX > deltaY) {
        isDragging.current = true;
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;

    isDragging.current = false;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);

    const deltaX = e.clientX - startX.current;
    const SWIPE_THRESHOLD = 50; 
    const PROGRESS_THRESHOLD = 0.4;

    if (appView === 'sideMenu') {
      if (deltaX < -SWIPE_THRESHOLD || sideMenuProgress.get() < (1 - PROGRESS_THRESHOLD)) {
        setAppView('dashboardTime');
      } else {
        animate(sideMenuProgress, 1, viewTransition);
      }
      return;
    }

    if (appView === 'dashboardTime' && deltaX > SWIPE_THRESHOLD) {
      if (deltaX > sideMenuWidth * PROGRESS_THRESHOLD) {
        setAppView('sideMenu');
      } else {
        animate(sideMenuProgress, 0, viewTransition);
      }
      return;
    }

    if (sideMenuProgress.get() === 0) {
      const currentProgress = filmStripProgress.get();
      if (appView === 'dashboardTime') {
        if (currentProgress > PROGRESS_THRESHOLD) {
          setAppView('dashboardRoute');
        } else {
          animate(filmStripProgress, 0, viewTransition);
        }
      } else if (appView === 'dashboardRoute') {
        if (currentProgress < (1 - PROGRESS_THRESHOLD)) {
          setAppView('dashboardTime');
        } else {
          animate(filmStripProgress, 1, viewTransition);
        }
      }
    }
  };

  const mainViewX = useTransform(sideMenuProgress, [0, 1], [0, sideMenuWidth]);
  const sideMenuX = useTransform(sideMenuProgress, [0, 1], [-sideMenuWidth, 0]);
  const backdropOpacity = useTransform(sideMenuProgress, [0, 1], [0, 1]);
  const backdropPointerEvents = useTransform(sideMenuProgress, (v: number) => v > 0 ? 'auto' : 'none');

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
          <AppHeader />
        </div>

        <AppFooter />
      </motion.div>

      <AnimatePresence>
        {workflowState.view === 'scanning' && <ScanView />}
        {workflowState.view === 'form' && <CheckEntryView checkData={workflowState} />}
        {workflowState.view === 'provisioning' && <NfcWriteView />}
      </AnimatePresence>

      <ManualCheckSelectorSheet />
      <FacilitySelectionModal />

      <FullScreenModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
        transitionType="slide-horizontal"
        exitDirection="right"
      >
        <SettingsModal />
      </FullScreenModal>

      <FullScreenModal
        isOpen={isDevToolsOpen}
        onClose={() => setIsDevToolsOpen(false)}
        title="Developer Tools"
        transitionType="slide-horizontal"
        exitDirection="right"
      >
        <DeveloperModal />
      </FullScreenModal>
    </div>
  );
};

export const AppShell = () => {
  return (
    <GestureProvider>
      <AppShellContent />
    </GestureProvider>
  );
};