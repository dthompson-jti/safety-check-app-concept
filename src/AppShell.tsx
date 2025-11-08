// src/AppShell.tsx
import { useEffect } from 'react';
import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import {
  workflowStateAtom,
  currentTimeAtom,
  isHistoryModalOpenAtom,
  isSettingsModalOpenAtom,
  isDevToolsModalOpenAtom,
  connectionStatusAtom,
} from './data/atoms';
import { MainLayout } from './layouts/MainLayout';
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

/**
 * AppShell is the top-level component that orchestrates the entire UI.
 * It renders the main layout and conditionally displays overlay views
 * like the scanner or check form based on the global workflow state.
 */
export const AppShell = () => {
  const workflowState = useAtomValue(workflowStateAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);

  const [isHistoryOpen, setIsHistoryOpen] = useAtom(isHistoryModalOpenAtom);
  const [isSettingsOpen, setIsSettingsOpen] = useAtom(isSettingsModalOpenAtom);
  const [isDevToolsOpen, setIsDevToolsOpen] = useAtom(isDevToolsModalOpenAtom);

  // This effect starts a global timer to update the `currentTimeAtom`
  // every second. This drives all countdown timers in the application.
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup the interval when the component unmounts.
    return () => clearInterval(intervalId);
  }, [setCurrentTime]);

  useEffect(() => {
    if (workflowState.view === 'form' && workflowState.residents && workflowState.residents.length > 0) {
      const location = workflowState.residents[0].location;
      document.title = `Safety Check - ${location}`;
    } else {
      document.title = 'Safety Check App';
    }
  }, [workflowState]);

  const isChromeVisible = workflowState.view !== 'scanning' && workflowState.view !== 'form';

  return (
    // This div is now the master layout container
    <div style={{ display: 'flex', flexDirection: 'column', height: '100svh' }}>
      {connectionStatus !== 'online' && <OfflineBanner />}
      {isChromeVisible && <FloatingHeader />}

      <MainLayout />

      {isChromeVisible && <FloatingFooter />}

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