// src/features/Footer/FloatingFooter.tsx
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

  const handleScanClick = () => {
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  return (
    <footer className={styles.footer}>
      <Button
        variant="primary" /* Ensures primary states are applied */
        className={styles.scanButton}
        onClick={handleScanClick}
      >
        <span className="material-symbols-rounded">qr_code_scanner</span>
        <span>Scan</span>
      </Button>
    </footer>
  );
};