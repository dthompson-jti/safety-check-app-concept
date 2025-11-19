// src/features/Shell/FloatingFooter.tsx
import { useLayoutEffect, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { 
  workflowStateAtom, 
  appConfigAtom, 
  appViewAtom 
} from '../../data/atoms';
import { 
  timeSortedChecksAtom, 
  routeSortedChecksAtom 
} from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { useSound } from '../../data/useSound';
import { Button } from '../../components/Button';
import styles from './FloatingFooter.module.css';

/**
 * The main, persistent footer for the application.
 * 
 * Contracts Implemented:
 * 1. Component Variable Contract: It measures its own height and sets `--footer-height`.
 *    This ensures the scrolling content area always has the exact correct padding-bottom.
 */
export const FloatingFooter = () => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const appConfig = useAtomValue(appConfigAtom);
  
  // State needed for Smart NFC Simulation
  const appView = useAtomValue(appViewAtom);
  const timeSortedChecks = useAtomValue(timeSortedChecksAtom);
  const routeSortedChecks = useAtomValue(routeSortedChecksAtom);
  const addToast = useSetAtom(addToastAtom);

  const footerRef = useRef<HTMLElement>(null);
  const { trigger: triggerHaptic } = useHaptics();
  const { play: playSound } = useSound();

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (footerRef.current) {
        const height = footerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--footer-height', `${height}px`);
      }
    };
    updateHeight();
    
    const observer = new ResizeObserver(updateHeight);
    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--footer-height');
      window.removeEventListener('resize', updateHeight);
    };
  }, [appConfig.scanMode]); // Re-measure if layout changes due to mode switch

  // Handler for standard QR Code mode (opens Camera View)
  const handleQrClick = () => {
    triggerHaptic('heavy');
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  // Handler for NFC Simulation Shortcut
  // Simulates an instant tag read of the top-most relevant check.
  const handleNfcClick = () => {
    // 1. Determine context based on current dashboard view
    const candidateList = appView === 'dashboardRoute' ? routeSortedChecks : timeSortedChecks;
    
    // 2. Find the first actionable check (not complete/missed)
    const targetCheck = candidateList.find(c => 
      c.status !== 'complete' && c.status !== 'missed' && c.status !== 'supplemental'
    );

    if (targetCheck) {
      // 3. Provide immediate Success Feedback
      triggerHaptic('success');
      playSound('success');

      // 4. Navigate directly to the Check Form (bypassing camera view)
      setWorkflowState({
        view: 'form',
        type: 'scheduled',
        method: 'scan', // Count this as a scan for attestation purposes
        checkId: targetCheck.id,
        roomName: targetCheck.residents[0].location,
        residents: targetCheck.residents,
        specialClassifications: targetCheck.specialClassifications,
      });
    } else {
      // Fallback if list is empty/done
      triggerHaptic('warning');
      addToast({ message: 'No incomplete checks found in current list.', icon: 'info' });
    }
  };

  return (
    <footer className={styles.footer} ref={footerRef}>
      {appConfig.scanMode === 'nfc' ? (
        // NFC Mode: Passive feedback indicator
        // PROTOTYPE SHORTCUT: Clicking this triggers the "Instant Scan" logic
        <motion.div 
          className={styles.nfcContainer}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          onClick={handleNfcClick}
        >
          <span className={`material-symbols-rounded ${styles.nfcIcon}`}>
            sensors
          </span>
          <span className={styles.nfcText}>Ready to scan</span>
        </motion.div>
      ) : (
        // QR Mode: Active primary action
        <Button variant="primary" className={styles.scanButton} onClick={handleQrClick}>
          <span className="material-symbols-rounded">qr_code_scanner</span>
          <span>Scan</span>
        </Button>
      )}
    </footer>
  );
};