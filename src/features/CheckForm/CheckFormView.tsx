// src/features/CheckForm/CheckFormView.tsx
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { WorkflowState, workflowStateAtom } from '../../data/atoms';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { Button } from '../../components/Button';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import { Tooltip } from '../../components/Tooltip';
import styles from './CheckFormView.module.css';

type CheckFormViewProps = {
  // FIX: Accept the new, more explicit workflow state union type.
  checkData: Extract<WorkflowState, { view: 'form' }>;
};

const statusOptions = [
  { value: 'Awake', label: 'Awake', icon: 'self_improvement' },
  { value: 'Sleeping', label: 'Sleeping', icon: 'sleep' },
];

export const CheckFormView = ({ checkData }: CheckFormViewProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const dispatch = useSetAtom(dispatchActionAtom);
  const addToast = useSetAtom(addToastAtom);

  const [status, setStatus] = useState('Awake');
  const [notes, setNotes] = useState('');

  const handleBack = () => {
    // Go back to the scanner view
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  const handleCancel = () => {
    // Exit the entire workflow
    setWorkflowState({ view: 'none' });
  };

  const handleSave = () => {
    // FIX: Check the type of the workflow to dispatch the correct action.
    if (checkData.type === 'scheduled') {
      dispatch({
        type: 'CHECK_COMPLETE',
        payload: {
          checkId: checkData.checkId,
          status,
          notes,
          completionTime: new Date().toISOString(),
        },
      });
      addToast({ message: `Check for ${checkData.roomName} saved.`, icon: 'task_alt' });
    } else if (checkData.type === 'supplemental') {
      dispatch({
        type: 'CHECK_SUPPLEMENTAL_ADD',
        payload: {
          roomId: checkData.roomId,
          status,
          notes,
        },
      });
      addToast({ message: `Supplemental check for ${checkData.roomName} saved.`, icon: 'task_alt' });
    }
    
    setWorkflowState({ view: 'none' });
  };

  const specialClassification = checkData.type === 'scheduled' ? checkData.specialClassification : undefined;

  return (
    <motion.div
      className={styles.checkFormView}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
    >
      <header className={styles.header}>
        <Button variant="quaternary" size="m" iconOnly onClick={handleBack} aria-label="Back to scanner">
          <span className="material-symbols-rounded">arrow_back</span>
        </Button>
        <h3>Record Check</h3>
      </header>

      <main className={styles.formContent}>
        <div className={styles.residentInfo}>
          <h2>{checkData.roomName} - {checkData.residentName}</h2>
          {specialClassification && (
            <Tooltip content={specialClassification.details}>
              <div className={styles.srBadge}>
                <span className="material-symbols-rounded">shield_person</span>
                <span>{specialClassification.type}</span>
              </div>
            </Tooltip>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="status-group">STATUS</label>
          <IconToggleGroup
            id="status-group"
            options={statusOptions}
            value={status}
            onValueChange={(val) => setStatus(val)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes-input">NOTES (OPTIONAL)</label>
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
        <Button variant="primary" size="m" onClick={handleSave}>
          Save
        </Button>
      </footer>
    </motion.div>
  );
};