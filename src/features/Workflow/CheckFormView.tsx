// src/features/Workflow/CheckFormView.tsx
import { useState, useMemo } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import {
  WorkflowState,
  workflowStateAtom,
  connectionStatusAtom,
  recentlyCompletedCheckIdAtom,
  completingChecksAtom,
} from '../../data/atoms';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { Button } from '../../components/Button';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import styles from './CheckFormView.module.css';

type CheckFormViewProps = {
  checkData: Extract<WorkflowState, { view: 'form' }>;
};

const statusOptions = [
  { value: 'Awake', label: 'Awake', icon: 'self_improvement' },
  { value: 'Sleeping', label: 'Sleeping', icon: 'sleep' },
] as const;

export const CheckFormView = ({ checkData }: CheckFormViewProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const dispatch = useSetAtom(dispatchActionAtom);
  const addToast = useSetAtom(addToastAtom);
  const setRecentlyCompletedCheckId = useSetAtom(recentlyCompletedCheckIdAtom);
  const setCompletingChecks = useSetAtom(completingChecksAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const { trigger: triggerHaptic } = useHaptics();

  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  const handleBack = () => {
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  const handleCancel = () => {
    setWorkflowState({ view: 'none' });
  };

  const handleSetAll = (status: string) => {
    if (!status) return;
    const newStatuses = checkData.residents.reduce<Record<string, string>>((acc, resident) => {
      acc[resident.id] = status;
      return acc;
    }, {});
    setStatuses(newStatuses);
  };

  const handleSetIndividualStatus = (residentId: string, status: string) => {
    if (!status) return;
    setStatuses((prev) => ({ ...prev, [residentId]: status }));
  };

  const allResidentsHaveStatus = useMemo(() => {
    return (
      checkData.residents.length === Object.keys(statuses).length &&
      checkData.residents.every((res) => statuses[res.id])
    );
  }, [statuses, checkData.residents]);

  const handleSave = () => {
    if (!allResidentsHaveStatus) return;

    // STAGE 1 (IMMEDIATE): Trigger haptics, send the signal for the pulse animation to start,
    // and close the form view. The card remains in the list during this initial phase.
    triggerHaptic('success');
    if (checkData.type === 'scheduled') {
      setRecentlyCompletedCheckId(checkData.checkId);
    }
    setWorkflowState({ view: 'none' });

    // Handle offline queuing immediately.
    if (connectionStatus === 'offline') {
      addToast({ message: `Check for ${checkData.roomName} queued.`, icon: 'cloud_off' });
      // In a real app, the dispatch would go to an offline queue here.
      return;
    }

    if (checkData.type === 'scheduled') {
      // STAGE 2 (DELAYED): After a sufficient delay for the pulse to be visible,
      // update the data model and trigger the exit animation.
      setTimeout(() => {
        // This causes the card to be filtered from the list, triggering AnimatePresence's exit animation.
        setCompletingChecks((prev) => new Set(prev).add(checkData.checkId));
        // This updates the data model, which will update the Status Overview bar.
        dispatch({
          type: 'CHECK_COMPLETE',
          payload: {
            checkId: checkData.checkId,
            statuses,
            notes,
            completionTime: new Date().toISOString(),
          },
        });
      }, 250); // A 250ms delay is enough for the pulse to start before the exit begins.

      // STAGE 3 (FINAL CLEANUP): After ALL animations are complete, remove the check
      // from the temporary 'completing' set so it can reappear in the "Completed" list.
      const ANIMATION_CLEANUP_DURATION = 1500; // Must be > pulse animation (1.2s) + exit (0.3s)
      setTimeout(() => {
        setCompletingChecks((prev) => {
          const next = new Set(prev);
          next.delete(checkData.checkId);
          return next;
        });
        setRecentlyCompletedCheckId(null);
      }, ANIMATION_CLEANUP_DURATION);

    } else if (checkData.type === 'supplemental') {
      // Supplemental checks don't have an item in the list to animate, so we can dispatch immediately.
      dispatch({
        type: 'CHECK_SUPPLEMENTAL_ADD',
        payload: {
          roomId: checkData.roomId,
          statuses,
          notes,
        },
      });
      addToast({ message: `Supplemental check for ${checkData.roomName} saved.`, icon: 'task_alt' });
    }
  };

  const headerTitle = useMemo(() => {
    if (checkData.residents.length > 1) {
      return `${checkData.roomName} - Multiple Residents`;
    }
    return `${checkData.roomName} - ${checkData.residents[0]?.name}`;
  }, [checkData.roomName, checkData.residents]);

  const specialClassification = checkData.type === 'scheduled' ? checkData.specialClassification : undefined;

  return (
    <motion.div
      className={styles.checkFormView}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className={styles.header}>
        <Button variant="quaternary" size="m" iconOnly onClick={handleBack} aria-label="Back to scanner">
          <span className="material-symbols-rounded">arrow_back</span>
        </Button>
        <h3>Record check</h3>
      </header>

      <main className={styles.formContent}>
        <div className={styles.residentInfo}>
          <h2>{headerTitle}</h2>
        </div>

        {checkData.residents.length > 1 && (
          <div className={styles.formGroup}>
            <label>Set all to</label>
            <IconToggleGroup
              id="set-all-status-group"
              options={statusOptions}
              value={''} 
              onValueChange={handleSetAll}
            />
          </div>
        )}

        <div className={styles.residentListContainer}>
          {checkData.residents.map((resident) => {
            const isClassified = specialClassification?.residentId === resident.id;

            if (isClassified) {
              return (
                <div key={resident.id} className={styles.classifiedResidentWrapper}>
                  <div className={styles.classifiedResidentHeader}>
                    <span className={styles.residentName}>{resident.name}</span>
                    <IconToggleGroup
                      id={`status-group-${resident.id}`}
                      options={statusOptions}
                      value={statuses[resident.id] || ''}
                      onValueChange={(val) => handleSetIndividualStatus(resident.id, val)}
                    />
                  </div>
                  <div className={styles.classificationDetails}>
                    <span className="material-symbols-rounded">warning</span>
                    <p>
                      <strong>{specialClassification.type}:</strong> {specialClassification.details}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div key={resident.id} className={styles.residentRow}>
                <span className={styles.residentName}>{resident.name}</span>
                <IconToggleGroup
                  id={`status-group-${resident.id}`}
                  options={statusOptions}
                  value={statuses[resident.id] || ''}
                  onValueChange={(val) => handleSetIndividualStatus(resident.id, val)}
                />
              </div>
            );
          })}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes-input">Notes (optional)</label>
          <textarea
            id="notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any relevant observations..."
            rows={5}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <Button variant="secondary" size="m" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="m" onClick={handleSave} disabled={!allResidentsHaveStatus}>
          Save
        </Button>
      </footer>
    </motion.div>
  );
};