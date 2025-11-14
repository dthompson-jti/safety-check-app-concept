import { Resident, SafetyCheck } from '../../types';
import { SegmentedControl } from '../../components/SegmentedControl';
import styles from './ResidentCheckControl.module.css';

// Remove icons from the options, they will now be text-only.
const statusOptions = [
  { value: 'Awake', label: 'Awake' },
  { value: 'Sleeping', label: 'Sleeping' },
  { value: 'Refused', label: 'Refused' },
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

      {/* REPOSITION: Classification details are now directly under the name for better proximity. */}
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

      {/* REFINED: The label is removed to save vertical space. */}
      <textarea
        id={`notes-${resident.id}`}
        value={notes}
        onChange={(e) => onNotesChange(resident.id, e.target.value)}
        placeholder="Enter optional notes"
        rows={3}
        className={styles.notesInput}
      />
    </div>
  );
};