// src/features/Workflow/ScanView.tsx
import { useState, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import { workflowStateAtom } from '../../data/atoms';
import { safetyChecksAtom, mockResidents } from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { Button } from '../../components/Button';
import { ManualSelectionView } from './ManualSelectionView';
import styles from './ScanView.module.css';

interface PreScanAlertInfo {
  residentName: string;
  classificationType: string;
}

export const ScanView = () => {
  const [workflow, setWorkflow] = useAtom(workflowStateAtom);
  const allChecks = useAtomValue(safetyChecksAtom);
  const addToast = useSetAtom(addToastAtom);
  
  const [isScanning, setIsScanning] = useState(true);
  const [preScanAlert, setPreScanAlert] = useState<PreScanAlertInfo | null>(null);

  useEffect(() => {
    if (workflow.view === 'scanning' && workflow.targetCheckId) {
      const targetCheck = allChecks.find(c => c.id === workflow.targetCheckId);
      if (targetCheck?.specialClassification) {
        const resident = mockResidents.find(r => r.id === targetCheck.specialClassification!.residentId);
        if (resident) {
          setPreScanAlert({
            residentName: resident.name,
            classificationType: targetCheck.specialClassification.type,
          });
        }
      }
    }
  }, [workflow, allChecks]);

  const handleDecode = (result: string) => {
    if (!isScanning) return; 
    setIsScanning(false);
    
    const check = allChecks.find(c => c.id === result && c.status !== 'complete' && c.status !== 'missed');

    if (check) {
      setWorkflow({
        view: 'form',
        type: 'scheduled',
        checkId: check.id,
        roomName: check.residents[0].location,
        residents: check.residents,
        specialClassification: check.specialClassification,
      });
    } else {
      addToast({ message: 'QR Code not recognized or check already complete.', icon: 'error' });
      setTimeout(() => setIsScanning(true), 2000);
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) console.log('QR Scanner Error:', error.message);
    else console.log('An unknown QR scanner error occurred:', error);
  };

  const handleClose = () => setWorkflow({ view: 'none' });

  const handleOpenManualSelection = () => {
    if (workflow.view === 'scanning') {
      setWorkflow({ ...workflow, isManualSelectionOpen: true });
    }
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

  const isManualSelectionOpen = workflow.view === 'scanning' && workflow.isManualSelectionOpen;

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
          <div className={styles.viewfinder}>
            {isScanning ? (
              <Scanner
                onDecode={handleDecode}
                onError={handleError}
                constraints={{ facingMode: 'environment' }}
                scanDelay={500}
              />
            ) : (
              <div className={styles.scanPaused}>
                <span className="material-symbols-rounded">check_circle</span>
                Processing...
              </div>
            )}
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
      <ManualSelectionView isOpen={isManualSelectionOpen} />
    </>
  );
};