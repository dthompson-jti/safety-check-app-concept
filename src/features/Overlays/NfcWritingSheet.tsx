// src/features/Overlays/NfcWritingSheet.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Drawer } from 'vaul';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  nfcWorkflowStateAtom,
  NfcWorkflowState,
  provisionedRoomIdsAtom,
  NfcSimulationMode,
  nfcSimulationAtom,
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
  const simulationMode = useAtomValue(nfcSimulationAtom);
  const setProvisionedIds = useSetAtom(provisionedRoomIdsAtom);
  const { trigger: triggerHaptic } = useHaptics();

  const isOpen = workflowState.status !== 'idle' && workflowState.status !== 'selecting';
  const context = 'roomId' in workflowState ? workflowState : null;

  useEffect(() => {
    if (workflowState.status === 'ready' && context) {
      const timer = setTimeout(() => {
        setWorkflowState({ status: 'writing', roomId: context.roomId, roomName: context.roomName });
      }, 1500); // Auto-trigger writing after a delay
      return () => clearTimeout(timer);
    }
    
    if (workflowState.status === 'writing' && context) {
      const writeTimer = setTimeout(() => {
        let outcome: 'success' | 'error' = 'success';
        let errorCode: NfcError['code'] = 'WRITE_FAILED';

        if (simulationMode === 'forceSuccess') outcome = 'success';
        else if (simulationMode === 'forceErrorWriteFailed') {
          outcome = 'error'; errorCode = 'WRITE_FAILED';
        } else if (simulationMode === 'forceErrorTagLocked') {
          outcome = 'error'; errorCode = 'TAG_LOCKED';
        } else {
          outcome = Math.random() > 0.2 ? 'success' : 'error';
          errorCode = Math.random() > 0.5 ? 'WRITE_FAILED' : 'TAG_LOCKED';
        }

        if (outcome === 'success') {
          setWorkflowState({ status: 'success', roomId: context.roomId, roomName: context.roomName });
        } else {
          setWorkflowState({
            status: 'error', roomId: context.roomId, roomName: context.roomName,
            error: { code: errorCode, message: errorMessages[errorCode] },
          });
        }
      }, 1500);
      return () => clearTimeout(writeTimer);
    }

    if (workflowState.status === 'success') {
      triggerHaptic('success');
      setProvisionedIds((currentIds: Set<string>) => new Set([...currentIds, workflowState.roomId]));

      const timer = setTimeout(() => {
        setWorkflowState({ status: 'selecting' });
      }, 2000);

      return () => clearTimeout(timer);
    }
    if (workflowState.status === 'error') {
      triggerHaptic('error');
    }
  }, [workflowState, setWorkflowState, setProvisionedIds, triggerHaptic, context, simulationMode]);

  const handleRetry = () => {
    if (context) {
      setWorkflowState({ status: 'writing', roomId: context.roomId, roomName: context.roomName });
    }
  };

  const handleCancel = () => {
    setWorkflowState({ status: 'selecting' });
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
            <div className={styles.buttonRow}>
              <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
            </div>
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
  
  const setSimulationState = (mode: NfcSimulationMode) => {
    if (!context) return;
    const simulationMap: Record<NfcSimulationMode, NfcWorkflowState> = {
        forceSuccess: { status: 'success', roomId: context.roomId, roomName: context.roomName },
        forceErrorWriteFailed: { status: 'error', roomId: context.roomId, roomName: context.roomName, error: { code: 'WRITE_FAILED', message: 'A network error prevented writing the tag.' } },
        forceErrorTagLocked: { status: 'error', roomId: context.roomId, roomName: context.roomName, error: { code: 'TAG_LOCKED', message: 'This tag is locked and cannot be overwritten.' } },
        random: { status: 'writing', roomId: context.roomId, roomName: context.roomName } // No-op
    };
    setWorkflowState(simulationMap[mode]);
  }

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
          {isOpen && (
              <div className={styles.devFooter}>
                  <p>DEV TOOLS</p>
                  <div className={styles.devButtons}>
                      <Button size="xs" variant="tertiary" onClick={() => setSimulationState('forceSuccess')}>Success</Button>
                      <Button size="xs" variant="tertiary" onClick={() => setSimulationState('forceErrorWriteFailed')}>Err: Write</Button>
                      <Button size="xs" variant="tertiary" onClick={() => setSimulationState('forceErrorTagLocked')}>Err: Locked</Button>
                  </div>
              </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};