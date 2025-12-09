// src/features/Shell/AppFooter.tsx
import { useLayoutEffect, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import {
  workflowStateAtom,
  appConfigAtom,
  hardwareSimulationAtom
} from '../../data/atoms';
import {
  timeSortedChecksAtom
} from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { useAppSound } from '../../data/useAppSound';
import { Button } from '../../components/Button';
import { useCompleteCheck } from '../Workflow/useCompleteCheck';
import styles from './AppFooter.module.css';

/**
 * The main, persistent footer for the application.
 * 
 * Contracts Implemented:
 * 1. Component Variable Contract: It measures its own height and sets `--footer-height`.
 *    This ensures the scrolling content area always has the exact correct padding-bottom.
 */
export const AppFooter = () => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const appConfig = useAtomValue(appConfigAtom);

  // State needed for Smart NFC Simulation
  const timeSortedChecks = useAtomValue(timeSortedChecksAtom);
  const simulation = useAtomValue(hardwareSimulationAtom);
  const addToast = useSetAtom(addToastAtom);

  const footerRef = useRef<HTMLElement>(null);
  const { trigger: triggerHaptic } = useHaptics();
  const { play: playSound } = useAppSound();
  const { completeCheck } = useCompleteCheck();

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
  }, [appConfig.scanMode]);

  // Handler for standard QR Code mode (opens Camera View)
  const handleQrClick = () => {
    triggerHaptic('heavy');
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  // Handler for NFC Simulation Shortcut
  // Simulates an instant tag read of the top-most relevant check.
  const handleNfcClick = () => {
    // Check if NFC failure simulation is active
    if (simulation.nfcFails) {
      triggerHaptic('error');
      playSound('error');
      addToast({
        message: 'Tag not read.\nHold phone steady against the tag.',
        icon: 'wifi_tethering_error',
        variant: 'alert'
      });
      return;
    }

    // Always use timeSortedChecks since we only have one view now
    const targetCheck = timeSortedChecks.find(c =>
      c.status !== 'complete' && c.status !== 'missed' && c.type !== 'supplemental'
    );

    if (targetCheck) {
      triggerHaptic('success');
      playSound('success');

      if (appConfig.simpleSubmitEnabled) {
        const defaultStatuses = targetCheck.residents.reduce((acc, resident) => {
          acc[resident.id] = 'Awake';
          return acc;
        }, {} as Record<string, string>);

        completeCheck({
          checkId: targetCheck.id,
          statuses: defaultStatuses,
          notes: '',
          onSuccess: () => {
            addToast({ message: 'Check completed', icon: 'check_circle', variant: 'success' });
          }
        });
        return;
      }

      setWorkflowState({
        view: 'form',
        type: 'scheduled',
        method: 'scan',
        checkId: targetCheck.id,
        roomName: targetCheck.residents[0].location,
        residents: targetCheck.residents,
        specialClassifications: targetCheck.specialClassifications,
      });
    } else {
      triggerHaptic('warning');
      addToast({ message: 'No incomplete checks found in current list.', icon: 'info', variant: 'neutral' });
    }
  };

  return (
    <footer className={styles.footer} ref={footerRef}>
      {appConfig.scanMode === 'nfc' ? (
        <motion.div
          className={styles.nfcContainer}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          onClick={handleNfcClick}
        >
          <span className={`material-symbols-rounded ${styles.nfcIcon}`}>
            sensors
          </span>
          <span className={styles.nfcText}>Ready to scan</span>
        </motion.div>
      ) : (
        <Button variant="primary" className={styles.scanButton} onClick={handleQrClick}>
          <span className="material-symbols-rounded">qr_code_scanner</span>
          <span>Scan</span>
        </Button>
      )}
    </footer>
  );
};