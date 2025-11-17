// src/features/Overlays/NfcWritingSheet.tsx
import { useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Drawer } from 'vaul';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  nfcWorkflowStateAtom,
  provisionedRoomIdsAtom,
  NfcError,
} from '../../data/nfcAtoms';
import { useHaptics } from '../../data/useHaptics';
import { Button } from '../../components/Button';
import styles from './NfcWritingSheet.module.css';

const iconVariants: Variants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 15 },
  },
};

const errorMessages: Record<NfcError['code'], string> = {
  WRITE_FAILED: 'A network error prevented writing the tag.',
  TAG_LOCKED: 'This tag is locked and cannot be overwritten.',
};

type SimulationOutcome = 'success' | 'write_fail' | 'tag_locked';

const ContentWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="hidden"
    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
    transition={{ duration: 0.2 }}
    className={styles.animationContainer}
  >
    {children}
  </motion.div>
);

export const NfcWritingSheet = () => {
  const [workflowState, setWorkflowState] = useAtom(nfcWorkflowStateAtom);
  const setProvisionedIds = useSetAtom(provisionedRoomIdsAtom);
  const { trigger: triggerHaptic } = useHaptics();
  // Stores the selected simulation outcome from the 'ready' sheet's dev tools.
  const simulationOutcomeRef = useRef<SimulationOutcome>('success');

  const isOpen = workflowState.status !== 'idle' && workflowState.status !== 'selecting';
  const context = 'roomId' in workflowState ? workflowState : null;

  useEffect(() => {
    // This effect runs the final step of the simulation after the 'writing' state begins.
    if (workflowState.status === 'writing' && context) {
      const writeTimer = setTimeout(() => {
        const outcome = simulationOutcomeRef.current;
        if (outcome === 'success') {
          setWorkflowState({ status: 'success', roomId: context.roomId, roomName: context.roomName });
        } else if (outcome === 'write_fail') {
          setWorkflowState({
            status: 'error', roomId: context.roomId, roomName: context.roomName,
            error: { code: 'WRITE_FAILED', message: errorMessages.WRITE_FAILED },
          });
        } else {
          setWorkflowState({
            status: 'error', roomId: context.roomId, roomName: context.roomName,
            error: { code: 'TAG_LOCKED', message: errorMessages.TAG_LOCKED },
          });
        }
      }, 1500); // This delay simulates the actual time it takes to write a tag.
      return () => clearTimeout(writeTimer);
    }
    
    if (workflowState.status === 'success') {
      triggerHaptic('success');
      setProvisionedIds((currentIds: Set<string>) => new Set([...currentIds, workflowState.roomId]));
      const timer = setTimeout(() => setWorkflowState({ status: 'selecting' }), 2000);
      return () => clearTimeout(timer);
    }
    if (workflowState.status === 'error') {
      triggerHaptic('error');
    }
  }, [workflowState, setWorkflowState, setProvisionedIds, triggerHaptic, context]);

  const handleRetry = () => {
    if (context) {
      // Retrying will re-use the last selected simulation outcome.
      setWorkflowState({ status: 'writing', roomId: context.roomId, roomName: context.roomName });
    }
  };

  const handleCancel = () => {
    setWorkflowState({ status: 'selecting' });
  };

  // This handler, called from the dev tools, sets the desired simulation outcome
  // and then transitions the state machine to the 'writing' phase.
  const handleDevSimulate = (outcome: SimulationOutcome) => {
    if (!context || workflowState.status !== 'ready') return;
    simulationOutcomeRef.current = outcome;
    setWorkflowState({ status: 'writing', roomId: context.roomId, roomName: context.roomName });
  };

  const renderContent = () => {
    if (!context) return null;
    switch (workflowState.status) {
      case 'ready':
        return (
          <ContentWrapper>
            <motion.span variants={iconVariants} className={`material-symbols-rounded ${styles.largeIcon}`}>contactless</motion.span>
            <h2>Ready to Scan</h2>
            <p>Hold device near NFC tag for '{context.roomName}'</p>
          </ContentWrapper>
        );
      case 'writing':
        return (
          <ContentWrapper>
            <motion.span variants={iconVariants} className={`material-symbols-rounded ${styles.spinner}`}>nfc</motion.span>
            <p>Writing tag for '{context.roomName}'...</p>
          </ContentWrapper>
        );
      case 'success':
        return (
          <ContentWrapper>
            <motion.span variants={iconVariants} className={`material-symbols-rounded ${styles.success}`}>check_circle</motion.span>
            <h2>Tag Written Successfully</h2>
            <p>The tag for '{context.roomName}' is now synced.</p>
          </ContentWrapper>
        );
      case 'error':
        return (
          <ContentWrapper>
            <motion.span variants={iconVariants} className={`material-symbols-rounded ${styles.error}`}>error</motion.span>
            <h2>Write Failed</h2>
            <p>{workflowState.error.message}</p>
            <div className={styles.buttonRow}>
              <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
              <Button variant="primary" onClick={handleRetry}>Retry</Button>
            </div>
          </ContentWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <Drawer.Root open={isOpen} onClose={handleCancel}>
      <Drawer.Portal>
        <Drawer.Overlay className={styles.overlay} />
        <Drawer.Content className={styles.sheetContent}>
          <div className={styles.handleContainer}>
            <div className={styles.handle} />
          </div>
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
          {/* The dev tools are only shown on the 'ready' screen, allowing the developer
              to choose the outcome before the simulation starts. */}
          {workflowState.status === 'ready' && (
              <div className={styles.devFooter}>
                  <p>DEV TOOLS</p>
                  <div className={styles.devButtons}>
                      <Button size="xs" variant="tertiary" onClick={() => handleDevSimulate('success')}>Simulate Success</Button>
                      <Button size="xs" variant="tertiary" onClick={() => handleDevSimulate('write_fail')}>Simulate Write Fail</Button>
                      <Button size="xs" variant="tertiary" onClick={() => handleDevSimulate('tag_locked')}>Simulate Tag Locked</Button>
                  </div>
              </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};