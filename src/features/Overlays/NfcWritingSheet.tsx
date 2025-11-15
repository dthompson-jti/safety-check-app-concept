// src/features/Overlays/NfcWritingSheet.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Drawer } from 'vaul';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  nfcWorkflowStateAtom,
  NfcWorkflowState,
  provisionedRoomIdsAtom,
  NfcSimulationMode,
} from '../../data/nfcAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { BottomSheet } from '../../components/BottomSheet';
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
  const addToast = useSetAtom(addToastAtom);
  const { trigger: triggerHaptic } = useHaptics();

  const isOpen = workflowState.status === 'writing' || workflowState.status === 'success' || workflowState.status === 'error';
  const context = 'roomId' in workflowState ? workflowState : null;

  useEffect(() => {
    if (workflowState.status === 'success') {
      triggerHaptic('success');
      addToast({ message: `Tag for '${workflowState.roomName}' written`, icon: 'check_circle' });
      // DEFINITIVE FIX: Explicitly type the `currentIds` parameter to `Set<string>`.
      // This resolves the "unsafe spread" error by ensuring TypeScript knows the type.
      setProvisionedIds((currentIds: Set<string>) => new Set([...currentIds, workflowState.roomId]));

      const timer = setTimeout(() => {
        setWorkflowState({ status: 'selecting' });
      }, 2000);

      return () => clearTimeout(timer);
    }
    if (workflowState.status === 'error') {
      triggerHaptic('error');
    }
  }, [workflowState, setWorkflowState, setProvisionedIds, addToast, triggerHaptic]);

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
    <Drawer.NestedRoot open={isOpen}>
      <BottomSheet.Content className={styles.sheetContent}>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
        {import.meta.env.DEV && isOpen && (
            <div className={styles.devFooter}>
                <p>DEV TOOLS</p>
                <div className={styles.devButtons}>
                    <Button size="xs" variant="tertiary" onClick={() => setSimulationState('forceSuccess')}>Success</Button>
                    <Button size="xs" variant="tertiary" onClick={() => setSimulationState('forceErrorWriteFailed')}>Err: Write</Button>
                    <Button size="xs" variant="tertiary" onClick={() => setSimulationState('forceErrorTagLocked')}>Err: Locked</Button>
                </div>
            </div>
        )}
      </BottomSheet.Content>
    </Drawer.NestedRoot>
  );
};