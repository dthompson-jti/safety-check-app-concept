// src/features/Workflow/ScanView.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  workflowStateAtom,
  isManualCheckModalOpenAtom,
  appViewAtom,
  hardwareSimulationAtom,
} from '../../data/atoms';
import {
  safetyChecksAtom,
  timeSortedChecksAtom,
  routeSortedChecksAtom
} from '../../data/appDataAtoms';
import { mockResidents } from '../../data/mock/residentData';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { useAppSound } from '../../data/useAppSound';
import { Button } from '../../components/Button';
import { appConfigAtom } from '../../data/atoms';
import { useCompleteCheck } from './useCompleteCheck';
import styles from './ScanView.module.css';

interface PreScanAlertInfo {
  residentName: string;
  classificationType: string;
}

type ScanViewState = 'scanning' | 'processing' | 'success' | 'fail';

export const ScanView = () => {
  const [workflow, setWorkflow] = useAtom(workflowStateAtom);
  const allChecks = useAtomValue(safetyChecksAtom);
  const appConfig = useAtomValue(appConfigAtom);

  const appView = useAtomValue(appViewAtom);
  const timeSortedChecks = useAtomValue(timeSortedChecksAtom);
  const routeSortedChecks = useAtomValue(routeSortedChecksAtom);
  const simulation = useAtomValue(hardwareSimulationAtom);

  const addToast = useSetAtom(addToastAtom);
  const setIsManualCheckModalOpen = useSetAtom(isManualCheckModalOpenAtom);

  const { trigger: triggerHaptic } = useHaptics();
  const { play: playSound } = useAppSound();
  const { completeCheck } = useCompleteCheck();

  const [scanViewState, setScanViewState] = useState<ScanViewState>('scanning');
  const [preScanAlert, setPreScanAlert] = useState<PreScanAlertInfo | null>(null);

  const lastScanned = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);

  // Show pre-scan alerts if coming from a specific check intent (e.g. manual list)
  useEffect(() => {
    if (workflow.view === 'scanning') {
      setScanViewState('scanning');
    }

    if (workflow.view === 'scanning' && workflow.targetCheckId) {
      const targetCheck = allChecks.find(c => c.id === workflow.targetCheckId);
      const firstClassification = targetCheck?.specialClassifications?.[0];
      if (firstClassification) {
        const resident = mockResidents.find(r => r.id === firstClassification.residentId);
        if (resident) {
          setPreScanAlert({
            residentName: resident.name,
            classificationType: firstClassification.type,
          });
        }
      }
    } else {
      setPreScanAlert(null);
    }
  }, [workflow, allChecks]);

  const failScan = useCallback(() => {
    // STRATEGY UPDATE: Removed redundant toast. 
    // The viewfinder's fail state overlay provides sufficient immediate feedback.
    triggerHaptic('error');
    playSound('error');
    setScanViewState('fail');
    setTimeout(() => {
      setScanViewState('scanning');
    }, 1500);
  }, [triggerHaptic, playSound]);

  const handleDecode = (result: string) => {
    if (scanViewState !== 'scanning') return;

    // Debounce duplicate scans
    if (lastScanned.current === result && (Date.now() - lastScanTime.current < 2000)) {
      return;
    }
    lastScanned.current = result;
    lastScanTime.current = Date.now();

    setScanViewState('processing');

    setTimeout(() => {
      const checkId = result.startsWith('room:') ? result.split(':')[1] : result;

      const check = allChecks.find(c => c.id === checkId && c.status !== 'complete' && c.status !== 'missed');

      if (check) {
        triggerHaptic('success');
        playSound('success');
        setScanViewState('success');

        if (appConfig.simpleSubmitEnabled) {
          const defaultStatuses = check.residents.reduce((acc, resident) => {
            acc[resident.id] = 'Awake';
            return acc;
          }, {} as Record<string, string>);

          completeCheck({
            checkId: check.id,
            statuses: defaultStatuses,
            notes: '',
            onSuccess: () => {
              addToast({ message: 'Check completed (Simple Submit)', icon: 'check_circle', variant: 'success' });
              setWorkflow({ view: 'none' });
            }
          });
          return;
        }

        setTimeout(() => {
          setWorkflow({
            view: 'form',
            type: 'scheduled',
            method: 'scan',
            checkId: check.id,
            roomName: check.residents[0].location,
            residents: check.residents,
            specialClassifications: check.specialClassifications,
          });
        }, 800);
      } else {
        failScan();
      }
    }, 300);
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) console.log('QR Scanner Error:', error.message);
    else console.log('An unknown QR scanner error occurred:', error);
  };

  const handleClose = () => setWorkflow({ view: 'none' });

  const handleOpenManualSelection = () => {
    setIsManualCheckModalOpen(true);
  };

  const handleSimulateSuccess = () => {
    if (workflow.view === 'scanning' && workflow.targetCheckId) {
      handleDecode(workflow.targetCheckId);
      return;
    }
    const candidateList = appView === 'dashboardRoute' ? routeSortedChecks : timeSortedChecks;
    const actionableCandidate = candidateList.find(c =>
      c.status !== 'complete' && c.status !== 'missed' && c.type !== 'supplemental'
    );

    if (actionableCandidate) {
      handleDecode(actionableCandidate.id);
    } else {
      const anyIncomplete = allChecks.find(c => c.status !== 'complete');
      if (anyIncomplete) {
        handleDecode(anyIncomplete.id);
      } else {
        addToast({ message: 'No incomplete checks found to simulate.', icon: 'info', variant: 'neutral' });
      }
    }
  };

  const handleSimulateFail = () => handleDecode('invalid-qr-code-id');

  const renderViewfinderContent = () => {
    if (simulation.cameraFails) {
      return (
        <div className={`${styles.statusOverlay} ${styles.failState}`}>
          <span className="material-symbols-rounded">no_photography</span>
          Camera Error
        </div>
      );
    }

    switch (scanViewState) {
      case 'scanning':
        return (
          <Scanner
            onDecode={handleDecode}
            onError={handleError}
            constraints={{ facingMode: 'environment' }}
            scanDelay={500}
          />
        );
      case 'processing':
        return (
          <div className={`${styles.statusOverlay} ${styles.processingState}`}>
            <span className={`material-symbols-rounded ${styles.spinner}`}>progress_activity</span>
            Processing...
          </div>
        );
      case 'success':
        return (
          <div className={`${styles.statusOverlay} ${styles.successState}`}>
            <span className="material-symbols-rounded">check_circle</span>
            Success!
          </div>
        );
      case 'fail':
        return (
          <div className={`${styles.statusOverlay} ${styles.failState}`}>
            <span className="material-symbols-rounded">error</span>
            Scan Failed
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={styles.scanView}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className={styles.header}>
        <h3>Scan Room QR Code</h3>
        <Button variant="on-solid" size="m" iconOnly onClick={handleClose} aria-label="Close scanner">
          <span className="material-symbols-rounded">close</span>
        </Button>
      </header>

      <AnimatePresence>
        {preScanAlert && (
          <motion.div
            className={styles.preScanAlert}
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
          >
            <span className="material-symbols-rounded">warning</span>
            <p>
              <span>{preScanAlert.residentName}</span>
              <span className={styles.alertSeparator}>|</span>
              <span>{preScanAlert.classificationType}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={styles.cameraContainer}>
        <div className={styles.viewfinder} data-scan-state={scanViewState}>
          {renderViewfinderContent()}
        </div>
        <p className={styles.helperText}>
          {simulation.cameraFails
            ? "Camera hardware is not responding."
            : "Point your camera at the room's QR code"}
        </p>
      </main>
      <footer className={styles.footer}>
        <p className={styles.subtlePrompt}>Can't scan?</p>
        <Button variant="on-solid" size="m" onClick={handleOpenManualSelection}>
          <span className="material-symbols-rounded">touch_app</span>
          Select manually
        </Button>
        <div className={styles.devControlsContainer}>
          <p className={styles.devControlsHeader}>Dev controls</p>
          <div className={styles.devControls}>
            <Button variant="on-solid" size="s" onClick={handleSimulateSuccess} disabled={simulation.cameraFails}>
              <span className="material-symbols-rounded">check_circle</span>
              Simulate success
            </Button>
            <Button variant="on-solid" size="s" onClick={handleSimulateFail} disabled={simulation.cameraFails}>
              <span className="material-symbols-rounded">error</span>
              Simulate fail
            </Button>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};