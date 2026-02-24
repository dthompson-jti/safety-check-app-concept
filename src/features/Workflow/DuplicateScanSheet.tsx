// src/features/Workflow/DuplicateScanSheet.tsx
import { useAtom, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import {
    isDuplicateScanSheetOpenAtom,
    pendingDuplicateCheckAtom,
    workflowStateAtom
} from '../../data/atoms';
import { useCompleteCheck } from './useCompleteCheck';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { Button } from '../../components/Button';
import styles from './DuplicateScanSheet.module.css';

export const DuplicateScanSheet = () => {
    const [isOpen, setIsOpen] = useAtom(isDuplicateScanSheetOpenAtom);
    const [pendingCheck, setPendingCheck] = useAtom(pendingDuplicateCheckAtom);
    const setWorkflow = useSetAtom(workflowStateAtom);
    const addToast = useSetAtom(addToastAtom);
    const { trigger: triggerHaptic } = useHaptics();
    const { completeCheck } = useCompleteCheck();

    const handleClose = () => {
        setIsOpen(false);
        setPendingCheck(null);
    };

    const handleConfirm = () => {
        if (!pendingCheck) return;

        triggerHaptic('success');

        const defaultStatuses = pendingCheck.residents.reduce((acc, resident) => {
            acc[resident.id] = 'Awake';
            return acc;
        }, {} as Record<string, string>);

        setWorkflow({ view: 'none' });

        completeCheck({
            checkId: pendingCheck.id,
            statuses: defaultStatuses,
            notes: '',
            onSuccess: () => {
                addToast({
                    message: 'Check completed',
                    icon: 'check_circle',
                    variant: 'success'
                });
            }
        });

        handleClose();
    };

    return (
        <AnimatePresence>
            {isOpen && pendingCheck && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleClose}
                        aria-hidden="true"
                    />

                    {/* Sheet Content */}
                    <motion.div
                        className={styles.content}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="dup-sheet-title"
                    >
                        <div className={styles.handleContainer}>
                            <div className={styles.handle} />
                        </div>

                        <div className={styles.iconContainer}>
                            <span className={`material-symbols-rounded ${styles.heroIcon}`}>
                                schedule
                            </span>
                        </div>

                        <h3 id="dup-sheet-title" className={styles.title}>Recent Check Detected</h3>
                        <p className={styles.roomSubtitle}>{pendingCheck.residents[0].location}</p>

                        <p className={styles.description}>
                            This room was checked recently. Are you sure you want to check now?
                        </p>

                        <footer className={styles.footer}>
                            <Button variant="primary" size="lg" onClick={handleConfirm}>
                                Confirm
                            </Button>
                            <Button variant="secondary" size="lg" onClick={handleClose}>
                                Cancel
                            </Button>
                        </footer>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
