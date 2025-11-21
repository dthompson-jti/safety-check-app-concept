// src/features/Shell/AppFooter.tsx
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
import { useAppSound } from '../../data/useAppSound'; // NEW
import { Button } from '../../components/Button';
import { useCompleteCheck } from '../Workflow/useCompleteCheck';
import styles from './AppFooter.module.css';

export const AppFooter = () => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const appConfig = useAtomValue(appConfigAtom);

  const appView = useAtomValue(appViewAtom);
  const timeSortedChecks = useAtomValue(timeSortedChecksAtom);
  const routeSortedChecks = useAtomValue(routeSortedChecksAtom);
  const addToast = useSetAtom(addToastAtom);

  const footerRef = useRef<HTMLElement>(null);
  const { trigger: triggerHaptic } = useHaptics();
  const { play: playSound } = useAppSound(); // NEW
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

  const handleQrClick = () => {
    triggerHaptic('heavy');
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  const handleNfcClick = () => {
    const candidateList = appView === 'dashboardRoute' ? routeSortedChecks : timeSortedChecks;
    const targetCheck = candidateList.find(c =>
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
            addToast({ message: 'Check completed (Simple Submit)', icon: 'check_circle' });
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
      addToast({ message: 'No incomplete checks found in current list.', icon: 'info' });
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