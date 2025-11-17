// src/features/Workflow/ScanView.tsx
import { useState, useEffect, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import { workflowStateAtom, isManualCheckModalOpenAtom } from '../../data/atoms';
import { safetyChecksAtom } from '../../data/appDataAtoms';
import { mockResidents } from '../../data/mock/residentData';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { Button } from '../../components/Button';
import styles from './ScanView.module.css';

interface PreScanAlertInfo {
  residentName: string;
  classificationType: string;
}

// A more robust state machine for the scanner's UI
type ScanViewState = 'scanning' | 'processing' | 'success' | 'fail';

export const ScanView = () => {
  const [workflow, setWorkflow] = useAtom(workflowStateAtom);
  const allChecks = useAtomValue(safetyChecksAtom);
  const addToast = useSetAtom(addToastAtom);
  const setIsManualCheckModalOpen = useSetAtom(isManualCheckModalOpenAtom);
  const { trigger: triggerHaptic } = useHaptics();

  const [scanViewState, setScanViewState] = useState<ScanViewState>('scanning');
  const [preScanAlert, setPreScanAlert] = useState<PreScanAlertInfo | null>(null);

  useEffect(() => {
    // Reset scan state if the view is re-opened
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

  const failScan = useCallback((message: string) => {
    addToast({ message, icon: 'error' });
    triggerHaptic('error');
    setScanViewState('fail');
    setTimeout(() => {
      setScanViewState('scanning');
    }, 1500);
  }, [addToast, triggerHaptic]);

  const handleDecode = (result: string) => {
    if (scanViewState !== 'scanning') return;
    setScanViewState('processing');

    setTimeout(() => {
      const check = allChecks.find(c => c.id === result && c.status !== 'complete' && c.status !== 'missed');

      if (check) {
        triggerHaptic('success');
        setScanViewState('success');
        setTimeout(() => {
          // A successful scan sets the method to 'scan', bypassing the attestation requirement.
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
        failScan('QR Code not recognized or check already complete.');
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
    const incompleteChecks = allChecks.filter(c => c.status !== 'complete' && c.status !== 'missed');
    if (incompleteChecks.length > 0) {
      const randomCheck = incompleteChecks[Math.floor(Math.random() * incompleteChecks.length)];
      handleDecode(randomCheck.id);
    } else {
      addToast({ message: 'No incomplete checks to simulate.', icon: 'info' });
    }
  };

  const handleSimulateFail = () => handleDecode('invalid-qr-code-id');

  const renderViewfinderContent = () => {
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
    <>
      <motion.div
        className={styles.scanView}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className={styles.header}>
          <h3>Scan room QR code</h3>
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
          <p className={styles.helperText}>Point your camera at the room's QR code</p>
        </main>
        <footer className={styles.footer}>
          <p className={styles.subtlePrompt}>Can't scan?</p>
          <Button variant="on-solid" size="m" onClick={handleOpenManualSelection}>
            Select manually
          </Button>
          <div className={styles.devControlsContainer}>
            <p className={styles.devControlsHeader}>Dev controls</p>
            <div className={styles.devControls}>
              <Button variant="on-solid" size="s" onClick={handleSimulateSuccess}>
                <span className="material-symbols-rounded">check_circle</span>
                Simulate success
              </Button>
              <Button variant="on-solid" size="s" onClick={handleSimulateFail}>
                <span className="material-symbols-rounded">error</span>
                Simulate fail
              </Button>
            </div>
          </div>
        </footer>
      </motion.div>
    </>
  );
};