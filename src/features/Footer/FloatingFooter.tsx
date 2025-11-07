// src/features/Footer/FloatingFooter.tsx
import { useLayoutEffect, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { workflowStateAtom } from '../../data/atoms';
import { Button } from '../../components/Button';
import styles from './FloatingFooter.module.css';

/**
 * The main, persistent footer for the application.
 * It is fixed to the bottom of the viewport and provides the primary
 * "Scan" action to initiate the check workflow.
 */
export const FloatingFooter = () => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const footerRef = useRef<HTMLElement>(null);

  // FIX: Use a layout effect to measure the footer's height after it renders
  // and set a CSS variable on the root element. This allows other components,
  // like the Toast container, to position themselves relative to the footer.
  useLayoutEffect(() => {
    if (footerRef.current) {
      const height = footerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--footer-height', `${height}px`);
    }
  }, []);

  const handleScanClick = () => {
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  return (
    <footer className={styles.footer} ref={footerRef}>
      <Button
        variant="primary"
        className={styles.scanButton}
        onClick={handleScanClick}
      >
        <span className="material-symbols-rounded">qr_code_scanner</span>
        <span>Scan</span>
      </Button>
    </footer>
  );
};