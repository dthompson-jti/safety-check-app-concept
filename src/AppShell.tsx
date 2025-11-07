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
} from './data/atoms';
import { MainLayout } from './layouts/MainLayout';
import { ScanView } from './features/Scanning/ScanView';
import { CheckFormView } from './features/CheckForm/CheckFormView';
import { WriteNfcTagModal } from './features/Admin/WriteNfcTagModal';
import { SelectRoomModal } from './features/Admin/SelectRoomModal';
import { FullScreenModal } from './components/FullScreenModal';
import { HistoryView } from './features/History/HistoryView';
import { SettingsView } from './features/Settings/SettingsView';
import { DeveloperToolsView } from './features/Developer/DeveloperToolsView';

/**
 * AppShell is the top-level component that orchestrates the entire UI.
 * It renders the main layout and conditionally displays overlay views
 * like the scanner or check form based on the global workflow state.
 */
export const AppShell = () => {
  const workflowState = useAtomValue(workflowStateAtom);
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

  return (
    <>
      <MainLayout />

      <AnimatePresence>
        {workflowState.view === 'scanning' && <ScanView />}
        {workflowState.view === 'form' && <CheckFormView checkData={workflowState} />}
      </AnimatePresence>

      <WriteNfcTagModal />
      <SelectRoomModal />

      {/* Render the new full-screen modals at the top level */}
      <FullScreenModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="History">
        <HistoryView />
      </FullScreenModal>
      <FullScreenModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
        <SettingsView />
      </FullScreenModal>
      <FullScreenModal isOpen={isDevToolsOpen} onClose={() => setIsDevToolsOpen(false)} title="Developer Tools">
        <DeveloperToolsView />
      </FullScreenModal>
    </>
  );
};