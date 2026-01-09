// src/desktop/components/SupervisorNoteModal.tsx

import { useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import * as Dialog from '@radix-ui/react-dialog';
import {
    supervisorNoteModalAtom,
    historicalChecksAtom,
    selectedHistoryRowsAtom,
} from '../atoms';
import { SUPERVISOR_NOTE_REASONS, SupervisorNoteReason } from '../types';
import { addToastAtom } from '../../data/toastAtoms';
import styles from './SupervisorNoteModal.module.css';

export const SupervisorNoteModal = () => {
    const [modalState, setModalState] = useAtom(supervisorNoteModalAtom);
    const setHistoricalChecks = useSetAtom(historicalChecksAtom);
    const setSelectedRows = useSetAtom(selectedHistoryRowsAtom);
    const addToast = useSetAtom(addToastAtom);

    const [reason, setReason] = useState<SupervisorNoteReason>('Unit Lockdown');
    const [additionalNotes, setAdditionalNotes] = useState('');

    const handleClose = () => {
        setModalState({ isOpen: false, selectedIds: [] });
        setReason('Unit Lockdown');
        setAdditionalNotes('');
    };

    const handleSave = () => {
        const note = additionalNotes
            ? `${reason} - ${additionalNotes}`
            : reason;

        // Update historical checks
        setHistoricalChecks((checks) =>
            checks.map((check) =>
                modalState.selectedIds.includes(check.id)
                    ? { ...check, supervisorNote: note, reviewStatus: 'verified' as const }
                    : check
            )
        );

        // Clear selection
        setSelectedRows(new Set());

        // Show confirmation
        addToast({
            message: `Note saved for ${modalState.selectedIds.length} check${modalState.selectedIds.length !== 1 ? 's' : ''}`,
            icon: 'check_circle',
            variant: 'success',
        });

        handleClose();
    };

    return (
        <Dialog.Root open={modalState.isOpen} onOpenChange={(open) => !open && handleClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content} data-platform="desktop">
                    <div className={styles.header}>
                        <Dialog.Title className={styles.title}>Add Supervisor Note</Dialog.Title>
                        <Dialog.Close asChild>
                            <button className={styles.closeButton} aria-label="Close">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className={styles.body}>
                        <div className={styles.field}>
                            <label className={styles.label}>Reason for missed check(s)</label>
                            <select
                                className={styles.select}
                                value={reason}
                                onChange={(e) => setReason(e.target.value as SupervisorNoteReason)}
                            >
                                {SUPERVISOR_NOTE_REASONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Additional notes {reason !== 'Other' && '(optional)'}
                            </label>
                            <textarea
                                className={styles.textarea}
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                placeholder="Enter additional context..."
                                rows={3}
                            />
                        </div>

                        <p className={styles.hint}>
                            This note will be applied to {modalState.selectedIds.length} selected check
                            {modalState.selectedIds.length !== 1 ? 's' : ''}.
                        </p>
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.cancelButton} onClick={handleClose}>
                            Cancel
                        </button>
                        <button
                            className={styles.saveButton}
                            onClick={handleSave}
                            disabled={reason === 'Other' && !additionalNotes.trim()}
                        >
                            Save Note
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
