// src/features/Scanning/ScanView.tsx
import { useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import { workflowStateAtom } from '../../data/atoms';
import { safetyChecksAtom } from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { Button } from '../../components/Button';
import { ManualSelectionView } from '../ManualSelection/ManualSelectionView';
import styles from './ScanView.module.css';

export const ScanView = () => {
  const [workflow, setWorkflow] = useAtom(workflowStateAtom);
  const allChecks = useAtomValue(safetyChecksAtom);
  const addToast = useSetAtom(addToastAtom);
  
  const [isScanning, setIsScanning] = useState(true);

  const handleDecode = (result: string) => {
    // Prevent multiple decodes while processing
    if (!isScanning) return;
    
    setIsScanning(false);
    const check = allChecks.find(c => c.id === result && c.status !== 'complete' && c.status !== 'missed');

    if (check) {
      addToast({ message: `Room ${check.residents[0].location} found.`, icon: 'qr_code_scanner' });
      
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
      // Reset to allow scanning again
      setTimeout(() => {
        setIsScanning(true);
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
    // REFINED: Make simulation context-aware.
    if (workflow.view === 'scanning') {
      // If a specific check was targeted (by clicking a card), use it.
      if (workflow.targetCheckId) {
        handleDecode(workflow.targetCheckId);
        return;
      }
    }

    // Otherwise, fall back to the random simulation for generic testing.
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
            Select Manually
          </Button>
          <div className={styles.devControlsContainer}>
            <p className={styles.devControlsHeader}>--- DEV CONTROLS ---</p>
            <div className={styles.devControls}>
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