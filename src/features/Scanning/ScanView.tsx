// src/features/Scanning/ScanView.tsx
import { useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import { workflowStateAtom } from '../../data/atoms';
import { safetyChecksAtom } from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { Button } from '../../components/Button';
import { ManualSelectionView } from '../ManualSelection/ManualSelectionView';
import { SafetyCheck } from '../../types';
import styles from './ScanView.module.css';

export const ScanView = () => {
  const [workflow, setWorkflow] = useAtom(workflowStateAtom);
  const allChecks = useAtomValue(safetyChecksAtom);
  const addToast = useSetAtom(addToastAtom);
  
  const [isScanning, setIsScanning] = useState(true);
  const [scannedCheck, setScannedCheck] = useState<SafetyCheck | null>(null);

  const handleDecode = (result: string) => {
    setIsScanning(false);
    const check = allChecks.find(c => c.id === result && c.status !== 'complete' && c.status !== 'missed');

    if (check) {
      addToast({ message: `Room ${check.residents[0].location} found.`, icon: 'qr_code_scanner' });
      setScannedCheck(check);

      // Automatically transition to the form after a delay to allow user to see info
      setTimeout(() => {
        setWorkflow({
          view: 'form',
          type: 'scheduled',
          checkId: check.id,
          roomName: check.residents[0].location,
          residents: check.residents,
          specialClassification: check.specialClassification,
        });
      }, check.specialClassification ? 2500 : 500); // Longer delay if there's info to read

    } else {
      addToast({ message: 'QR Code not recognized or check already complete.', icon: 'error' });
      // Reset to allow scanning again
      setTimeout(() => {
        setIsScanning(true);
        setScannedCheck(null);
      }, 2000);
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      console.log('QR Scanner Error:', error.message);
    } else {
      console.log('An unknown QR scanner error occurred:', error);
    }
  };

  const handleClose = () => {
    setWorkflow({ view: 'none' });
  };

  const handleOpenManualSelection = () => {
    if (workflow.view === 'scanning') {
      setWorkflow({ ...workflow, isManualSelectionOpen: true });
    }
  };

  const handleSimulateSuccess = () => {
    const incompleteChecks = allChecks.filter(c => c.status !== 'complete' && c.status !== 'missed');
    if (incompleteChecks.length > 0) {
      const randomCheck = incompleteChecks[Math.floor(Math.random() * incompleteChecks.length)];
      handleDecode(randomCheck.id);
    } else {
      addToast({ message: 'No incomplete checks to simulate.', icon: 'info' });
    }
  };

  const handleSimulateFail = () => {
    handleDecode('invalid-qr-code-id');
  };

  const isManualSelectionOpen = workflow.view === 'scanning' && workflow.isManualSelectionOpen;

  return (
    <>
      <motion.div
        className={styles.scanView}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
      >
        <header className={styles.header}>
          <h3>Scan Room QR Code</h3>
          <Button variant="on-solid" size="m" iconOnly onClick={handleClose} aria-label="Close scanner">
            <span className="material-symbols-rounded">close</span>
          </Button>
        </header>
        <main className={styles.cameraContainer}>
          <div className={styles.viewfinder}>
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div key="scanner" style={{ width: '100%', height: '100%' }}>
                  <Scanner
                    onDecode={handleDecode}
                    onError={handleError}
                    constraints={{ facingMode: 'environment' }}
                    scanDelay={500}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="post-scan"
                  className={styles.postScanInfo}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <span className={`material-symbols-rounded ${styles.successIcon}`}>check_circle</span>
                  <h4>{scannedCheck?.residents[0].location}</h4>
                  {scannedCheck?.specialClassification && (
                    <div className={styles.classificationNotice}>
                      <span className="material-symbols-rounded">warning</span>
                      <p>
                        <strong>{scannedCheck.specialClassification.type}:</strong> {scannedCheck.specialClassification.details}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className={styles.helperText}>Point your camera at the room's QR code</p>
        </main>
        <footer className={styles.footer}>
          <p className={styles.subtlePrompt}>Can't scan?</p>
          <Button variant="on-solid" size="m" onClick={handleOpenManualSelection}>
            Select Manually
          </Button>
          <div className={styles.devControlsContainer}>
            <p className={styles.devControlsHeader}>--- DEV CONTROLS ---</p>
            <div className={styles.devControls}>
              {/* REFINED: Dev buttons are now on-solid variant */}
              <Button variant="on-solid" size="s" onClick={handleSimulateSuccess}>
                <span className="material-symbols-rounded">check_circle</span>
                Simulate Success
              </Button>
              <Button variant="on-solid" size="s" onClick={handleSimulateFail}>
                <span className="material-symbols-rounded">error</span>
                Simulate Fail
              </Button>
            </div>
          </div>
        </footer>
      </motion.div>
      <ManualSelectionView isOpen={isManualSelectionOpen} />
    </>
  );
};