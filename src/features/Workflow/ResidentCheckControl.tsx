// src/features/Workflow/ResidentCheckControl.tsx
import { useRef } from 'react';
import { useAtomValue } from 'jotai';
// DEFINITIVE FIX: Import SpecialClassification type for decoupled props.
import { Resident, SpecialClassification } from '../../types';
import { appConfigAtom } from '../../data/atoms';
import { SegmentedControl } from '../../components/SegmentedControl';
import { useAutosizeTextArea } from '../../data/useAutosizeTextArea';
import styles from './ResidentCheckControl.module.css';

// PRD-02: Define all status option sets
const statusOptionsSet2 = [
  { value: 'Awake', label: 'Awake' },
  { value: 'Sleeping', label: 'Sleeping' },
] as const;

const statusOptionsSet3 = [
  { value: 'Refused', label: 'Refused' },
  { value: 'Sleeping', label: 'Sleeping' },
  { value: 'Awake', label: 'Awake' },
] as const;

const statusOptionsSet4 = [
  { value: 'Awake', label: 'Awake' },
  { value: 'Sleeping', label: 'Sleeping' },
  { value: 'Refused', label: 'Refused' },
  { value: 'Out', label: 'Out' },
] as const;

// Union type of all possible status values
type StatusValue = 'Awake' | 'Sleeping' | 'Refused' | 'Out';

interface ResidentCheckControlProps {
  resident: Resident;
  status: StatusValue | '';
  notes: string;
  onStatusChange: (residentId: string, status: StatusValue) => void;
  onNotesChange: (residentId: string, notes: string) => void;
  /**
   * DEFINITIVE FIX: The `classification` prop is now explicitly typed as `SpecialClassification`.
   * This decouples the component from the `SafetyCheck` type and makes it more reusable.
   */
  classification?: SpecialClassification;
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

  // PRD-02: Read config to determine which status options to show
  const { residentStatusSet } = useAtomValue(appConfigAtom);

  // Auto-sizing logic for the textarea.
  useAutosizeTextArea(textAreaRef.current, notes);

  // PRD-02: Select appropriate options based on config
  let statusOptions: readonly { value: string; label: string }[];
  let layout: 'row' | 'grid' = 'row';

  switch (residentStatusSet) {
    case 'set-2':
      statusOptions = statusOptionsSet2;
      break;
    case 'set-4':
      statusOptions = statusOptionsSet4;
      layout = 'grid'; // PRD-02: 4 options use 2x2 grid
      break;
    case 'set-3':
    default:
      statusOptions = statusOptionsSet3;
      break;
  }

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
          onValueChange={(val) => onStatusChange(resident.id, val as StatusValue)}
          layout={layout}
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