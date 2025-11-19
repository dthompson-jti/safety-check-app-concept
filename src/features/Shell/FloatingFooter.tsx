// src/features/Shell/FloatingFooter.tsx
import { useLayoutEffect, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { workflowStateAtom, appConfigAtom } from '../../data/atoms';
import { useHaptics } from '../../data/useHaptics';
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
  const footerRef = useRef<HTMLElement>(null);
  const { trigger: triggerHaptic } = useHaptics();

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

  const handleScanClick = () => {
    triggerHaptic('heavy');
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  return (
    <footer className={styles.footer} ref={footerRef}>
      {appConfig.scanMode === 'nfc' ? (
        // NFC Mode: Passive feedback indicator
        // The entire container animates to sync the icon and text pulse.
        // PROTOTYPE SHORTCUT: Clicking this container triggers the scan workflow 
        // to simulate an NFC tag read for testing purposes.
        <motion.div 
          className={styles.nfcContainer}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          onClick={handleScanClick}
        >
          <span className={`material-symbols-rounded ${styles.nfcIcon}`}>
            sensors
          </span>
          <span className={styles.nfcText}>Ready to scan</span>
        </motion.div>
      ) : (
        // QR Mode: Active primary action
        <Button variant="primary" className={styles.scanButton} onClick={handleScanClick}>
          <span className="material-symbols-rounded">qr_code_scanner</span>
          <span>Scan</span>
        </Button>
      )}
    </footer>
  );
};