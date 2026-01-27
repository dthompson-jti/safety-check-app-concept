// src/features/Shell/AppFooter.tsx
import { useLayoutEffect, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import {
  workflowStateAtom,
  appConfigAtom,
} from '../../data/atoms';
import { lateCheckCountAtom } from '../../data/appDataAtoms';
import { useHaptics } from '../../data/useHaptics';
import { useWaapiSync } from '../../hooks/useWaapiSync';
import { Button } from '../../components/Button';
import { Popover } from '../../components/Popover';
import { NfcScanButton } from './NfcScanButton';
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
  const lateCount = useAtomValue(lateCheckCountAtom);

  const footerRef = useRef<HTMLElement>(null);
  const { trigger: triggerHaptic } = useHaptics();

  // Sync pulse animations when late checks exist
  useWaapiSync(footerRef, { isEnabled: lateCount > 0 });

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

    // Note: ResizeObserver handles all resize cases, window listener removed
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--footer-height');
    };
  }, [appConfig.scanMode]);

  // Handler for standard QR Code mode (opens Camera View)
  const handleQrClick = () => {
    triggerHaptic('heavy');
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  return (
    <footer className={styles.footer} ref={footerRef} data-footer-style={appConfig.headerStyle} data-shadow={appConfig.showChromeShadow} data-view-only={appConfig.isViewOnlyMode}>
      {appConfig.isViewOnlyMode ? (
        <Popover
          trigger={
            <div className={styles.viewOnlyBar}>
              <span>Read only</span>
            </div>
          }
          variant="tooltip"
        >
          <div style={{ padding: 'var(--spacing-2) var(--spacing-3)' }}>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>You do not have permissions to perform room checks</p>
          </div>
        </Popover>
      ) : appConfig.scanMode === 'nfc' ? (
        <NfcScanButton />
      ) : (
        <Button variant="primary" className={styles.scanButton} onClick={handleQrClick}>
          <span className="material-symbols-rounded">qr_code_scanner</span>
          <span>Scan</span>
        </Button>
      )}
    </footer>
  );
};

