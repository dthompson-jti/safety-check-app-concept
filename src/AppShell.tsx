// src/AppShell.tsx
import { useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { activeViewAtom, AppView, currentTimeAtom, layoutModeAtom, workflowStateAtom } from './data/atoms';
import { safetyChecksAtom } from './data/appDataAtoms';
import { addToastAtom } from './data/toastAtoms';

// Features
import { DashboardView } from './features/Dashboard/DashboardView';
import { SettingsView } from './features/Settings/SettingsView';
import { ScanView } from './features/Scanning/ScanView';
import { CheckFormView } from './features/CheckForm/CheckFormView';
import { WriteNfcTagModal } from './features/Admin/WriteNfcTagModal';
import { SelectRoomModal } from './features/Admin/SelectRoomModal';

// Layouts
import { ClassicLayout } from './layouts/ClassicLayout';
import { NotchedLayout } from './layouts/NotchedLayout';
import { OverlappingLayout } from './layouts/OverlappingLayout';
import { MinimalistLayout } from './layouts/MinimalistLayout';

// Data and Hooks
import { useUrlSync } from './data/useUrlSync';

export function AppShell() {
  const activeView = useAtomValue(activeViewAtom);
  const layoutMode = useAtomValue(layoutModeAtom);
  const workflow = useAtomValue(workflowStateAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);
  const addToast = useSetAtom(addToastAtom);
  const checks = useAtomValue(safetyChecksAtom);
  const alertedChecks = useRef(new Set<string>());

  // Synchronize the `view` URL parameter with our state
  useUrlSync();

  // Set up the single global timer for live countdowns
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for high-fidelity timers
    return () => clearInterval(timerId);
  }, [setCurrentTime]);

  // Effect for triggering time-sensitive alerts
  useEffect(() => {
    const now = new Date().getTime();
    const dueSoonThreshold = now + 15 * 60 * 1000;

    checks.forEach(check => {
      const dueTime = new Date(check.dueDate).getTime();
      const alertId_dueSoon = `${check.id}-due-soon`;
      const alertId_late = `${check.id}-late`;

      // Due Soon Alert
      if (dueTime < dueSoonThreshold && dueTime > now && !alertedChecks.current.has(alertId_dueSoon)) {
        addToast({ message: `${check.resident.location} is due soon`, icon: 'warning' });
        alertedChecks.current.add(alertId_dueSoon);
      }

      // Late Alert
      if (check.status === 'late' && !alertedChecks.current.has(alertId_late)) {
        addToast({ message: `${check.resident.location} is LATE`, icon: 'error' });
        alertedChecks.current.add(alertId_late);
      }
    });
  }, [checks, addToast]);


  const renderMainContent = (view: AppView) => {
    switch (view) {
      case 'dashboard':
        return <DashboardView />;
      case 'checks':
        // Placeholder for the "Checks" view
        return <div>Checks View</div>;
      case 'history':
        // Placeholder for the "History" view
        return <div>History View</div>;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const mainContent = renderMainContent(activeView);

  const renderAppShell = () => {
    switch (layoutMode) {
      case 'classic':
        return <ClassicLayout>{mainContent}</ClassicLayout>;
      case 'notched':
        return <NotchedLayout>{mainContent}</NotchedLayout>;
      case 'overlapping':
        return <OverlappingLayout>{mainContent}</OverlappingLayout>;
      case 'minimalist':
        return <MinimalistLayout>{mainContent}</MinimalistLayout>;
      default:
        return <ClassicLayout>{mainContent}</ClassicLayout>;
    }
  };

  return (
    <>
      <motion.div
        key="app-shell"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderAppShell()}
      </motion.div>

      {/* Render global modal overlays outside the layout */}
      <WriteNfcTagModal />
      <SelectRoomModal />

      <AnimatePresence>
        {workflow.view === 'scanning' && <ScanView key="scan-view" />}
        {workflow.view === 'form' && <CheckFormView key="form-view" checkData={workflow} />}
      </AnimatePresence>
    </>
  );
}