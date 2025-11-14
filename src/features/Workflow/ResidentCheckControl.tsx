// src/features/Workflow/ResidentCheckControl.tsx
import { useRef } from 'react';
import { Resident, SafetyCheck } from '../../types';
import { SegmentedControl } from '../../components/SegmentedControl';
// RE-ROUTED: Import path is updated to the new location.
import { useAutosizeTextArea } from '../../data/useAutosizeTextArea';
import styles from './ResidentCheckControl.module.css';

const statusOptions = [
  { value: 'Refused', label: 'Refused' },
  { value: 'Sleeping', label: 'Sleeping' },
  { value: 'Awake', label: 'Awake' },
] as const;

type StatusValue = typeof statusOptions[number]['value'];

interface ResidentCheckControlProps {
  resident: Resident;
  status: StatusValue | '';
  notes: string;
  onStatusChange: (residentId: string, status: StatusValue) => void;
  onNotesChange: (residentId: string, notes: string) => void;
  classification?: SafetyCheck['specialClassification'];
}

export const ResidentCheckControl = ({
  resident,
  status,
  notes,
  onStatusChange,
  onNotesChange,
  classification,
}: ResidentCheckControlProps) => {
  const isClassified = !!classification;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-sizing logic for the textarea.
  useAutosizeTextArea(textAreaRef.current, notes);

  return (
    <div className={styles.container} data-classified={isClassified}>
      <div className={styles.header}>
        <h4 className={styles.residentName}>
          {isClassified && (
            <span
              className={`material-symbols-rounded ${styles.warningIcon}`}
              aria-label="Special Classification"
            >
              warning
            </span>
          )}
          {resident.name}
        </h4>
      </div>

      {isClassified && (
        <div className={styles.classificationDetails}>
          <p>
            <strong>{classification.type}:</strong> {classification.details}
          </p>
        </div>
      )}

      <div className={styles.controlSection}>
        <SegmentedControl
          id={`status-group-${resident.id}`}
          options={statusOptions}
          value={status}
          onValueChange={(val) => onStatusChange(resident.id, val)}
        />
      </div>

      <textarea
        ref={textAreaRef}
        id={`notes-${resident.id}`}
        value={notes}
        onChange={(e) => onNotesChange(resident.id, e.target.value)}
        placeholder="Enter optional notes"
        rows={1} // Start as a single line
        className={styles.notesInput}
      />
    </div>
  );
};