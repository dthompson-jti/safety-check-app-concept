// src/features/Workflow/CheckEntryView.tsx
import { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import {
  WorkflowState,
  workflowStateAtom,
  connectionStatusAtom,
  appConfigAtom,
} from '../../data/atoms';
import { dispatchActionAtom, safetyChecksAtom } from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { useAppSound } from '../../data/useAppSound';
import { useVisualViewport } from '../../data/useVisualViewport';
import { useScrollToFocused } from '../../data/useScrollToFocused';
import { draftFormsAtom, saveDraftAtom, clearDraftAtom } from '../../data/formAtoms';
import { Button } from '../../components/Button';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ResidentCheckControl } from './ResidentCheckControl';
import { useCompleteCheck } from './useCompleteCheck';
import styles from './CheckEntryView.module.css';

type CheckEntryViewProps = {
  checkData: Extract<WorkflowState, { view: 'form' }>;
};

type StatusValue = 'Awake' | 'Sleeping' | 'Refused' | 'Out';
type SecurityCheckTypeValue = 'Locked down' | 'Random';

const securityCheckTypeOptions = [
  { value: 'Locked down', label: 'Locked down' },
  { value: 'Random', label: 'Random' },
] as const;

const incidentTypeOptions = [
  { value: 'Noise Complaint', label: 'Noise Complaint' },
  { value: 'Resident Request', label: 'Resident Request' },
  { value: 'Medical Alert', label: 'Medical Alert' },
  { value: 'Security Concern', label: 'Security Concern' },
  { value: 'Other', label: 'Other' },
];

// PRD-02: Define all mark multiple option sets (mirroring ResidentCheckControl)
const markMultipleOptionsSet2 = [
  { value: 'Awake', label: 'Awake' },
  { value: 'Sleeping', label: 'Sleeping' },
] as const;

const markMultipleOptionsSet3 = [
  { value: 'Refused', label: 'Refused' },
  { value: 'Sleeping', label: 'Sleeping' },
  { value: 'Awake', label: 'Awake' },
] as const;

const markMultipleOptionsSet4 = [
  { value: 'Awake', label: 'Awake' },
  { value: 'Sleeping', label: 'Sleeping' },
  { value: 'Refused', label: 'Refused' },
  { value: 'Out', label: 'Out' },
] as const;

export const CheckEntryView = ({ checkData }: CheckEntryViewProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const dispatch = useSetAtom(dispatchActionAtom);
  const addToast = useSetAtom(addToastAtom);

  const drafts = useAtomValue(draftFormsAtom);
  const saveDraft = useSetAtom(saveDraftAtom);
  const clearDraft = useSetAtom(clearDraftAtom);

  // Need access to all checks to find status of current check
  const allChecks = useAtomValue(safetyChecksAtom);

  const connectionStatus = useAtomValue(connectionStatusAtom);
  const {
    isCheckTypeEnabled,
    manualConfirmationEnabled,
    markMultipleEnabled,
    residentStatusSet, // PRD-02: Add for dynamic mark multiple options
  } = useAtomValue(appConfigAtom);

  const { trigger: triggerHaptic } = useHaptics();
  const { play: playSound } = useAppSound();
  const { completeCheck } = useCompleteCheck();

  // PRD-02: Select appropriate mark multiple options based on config
  let markMultipleOptions: readonly { value: string; label: string }[];
  let markMultipleLayout: 'row' | 'grid' = 'row';

  switch (residentStatusSet) {
    case 'set-2':
      markMultipleOptions = markMultipleOptionsSet2;
      break;
    case 'set-4':
      markMultipleOptions = markMultipleOptionsSet4;
      markMultipleLayout = 'grid';
      break;
    case 'set-3':
    default:
      markMultipleOptions = markMultipleOptionsSet3;
      break;
  }

  // Layout Stability: Sync height with visual viewport
  useVisualViewport();

  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const [showScrollShadow, setShowScrollShadow] = useState(false);

  // Layout Stability: Ensure focused inputs are not hidden by the sticky footer
  useScrollToFocused({
    containerRef: contentRef,
    footerOffsetVar: '--form-footer-height'
  });

  // Initialize State: Prefer Draft Data, then fall back to initial
  const draft = checkData.type === 'scheduled' ? drafts[checkData.checkId] : undefined;

  const [statuses, setStatuses] = useState<Record<string, StatusValue | ''>>(() =>
    draft?.statuses || checkData.residents.reduce((acc, res) => ({ ...acc, [res.id]: '' }), {})
  );

  const [notes, setNotes] = useState<Record<string, string>>(() =>
    draft?.notes || checkData.residents.reduce((acc, res) => ({ ...acc, [res.id]: '' }), {})
  );

  const [securityCheckType, setSecurityCheckType] = useState<SecurityCheckTypeValue | ''>(
    (draft?.checkType as SecurityCheckTypeValue) || ''
  );

  const [incidentType, setIncidentType] = useState<string>('');

  const [isAttested, setIsAttested] = useState(draft?.isAttested || false);

  // Determine Flags
  const isManualCheck = checkData.type === 'scheduled' && checkData.method === 'manual';
  const isSupplementalCheck = checkData.type === 'supplemental';

  // Determine Status for Badge
  const currentCheckStatus = useMemo(() => {
    if (isSupplementalCheck) return 'supplemental';
    // Type guard: checkData.type === 'scheduled' guarantees checkId exists
    if (checkData.type === 'scheduled') {
      const check = allChecks.find(c => c.id === checkData.checkId);
      return check?.status || 'pending';
    }
    return 'pending';
  }, [allChecks, checkData, isSupplementalCheck]);


  // Draft Logic: Track if we are unmounting due to success (don't save draft) or cancellation (save draft)
  const isSubmitted = useRef(false);

  useEffect(() => {
    return () => {
      if (!isSubmitted.current && checkData.type === 'scheduled') {
        saveDraft({
          checkId: checkData.checkId,
          draft: {
            statuses: statuses as Record<string, string>,
            notes,
            checkType: securityCheckType,
            isAttested
          }
        });
      }
    };
  }, [checkData, statuses, notes, securityCheckType, isAttested, saveDraft]);


  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (footer) {
      const height = footer.offsetHeight;
      document.documentElement.style.setProperty('--form-footer-height', `${height}px`);
    }
    return () => {
      document.documentElement.style.removeProperty('--form-footer-height');
    };
  }, []);

  useLayoutEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const checkShadowState = () => {
      const { scrollTop, scrollHeight, clientHeight } = contentElement;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 1;
      const isScrollable = scrollHeight > clientHeight;

      setShowScrollShadow(isScrollable && !isAtBottom);
    };

    const observer = new ResizeObserver(checkShadowState);
    observer.observe(contentElement);
    contentElement.addEventListener('scroll', checkShadowState, { passive: true });

    checkShadowState();

    return () => {
      observer.disconnect();
      contentElement.removeEventListener('scroll', checkShadowState);
    };
  }, []);

  const handleBack = () => {
    setWorkflowState({ view: 'none' });
  };

  const handleStatusChange = (residentId: string, status: StatusValue) => {
    setStatuses((prev) => ({ ...prev, [residentId]: status }));
  };

  const handleNotesChange = (residentId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [residentId]: value }));
  };

  const handleApplyAll = (status: string) => {
    if (!status) return;
    const newStatuses = { ...statuses };
    checkData.residents.forEach(r => {
      newStatuses[r.id] = status as StatusValue;
    });
    setStatuses(newStatuses);
  };

  const currentMarkAllValue = useMemo(() => {
    const uniqueValues = new Set(Object.values(statuses));
    if (uniqueValues.size === 1) {
      const val = uniqueValues.values().next().value;
      if (val) return val;
    }
    return '';
  }, [statuses]);

  const canSave = useMemo(() => {
    const allResidentsHaveStatus = checkData.residents.every((res) => statuses[res.id]);
    if (!allResidentsHaveStatus) return false;
    if (isCheckTypeEnabled && !securityCheckType) return false;
    if (isManualCheck && manualConfirmationEnabled && !isAttested) return false;
    if (isSupplementalCheck && !incidentType) return false;
    return true;
  }, [statuses, checkData.residents, isCheckTypeEnabled, securityCheckType, isManualCheck, isAttested, manualConfirmationEnabled, isSupplementalCheck, incidentType]);

  const handleSave = () => {
    if (!canSave) return;

    isSubmitted.current = true;

    if (checkData.type === 'scheduled') {
      clearDraft(checkData.checkId);
    }

    triggerHaptic('success');
    playSound('success');

    const consolidatedNotes = Object.values(notes)
      .filter(note => note.trim() !== '')
      .join('\n---\n');

    if (checkData.type === 'scheduled') {
      completeCheck({
        checkId: checkData.checkId,
        statuses: statuses as Record<string, string>,
        notes: consolidatedNotes,
      });
      setWorkflowState({ view: 'none' });

    } else if (checkData.type === 'supplemental') {
      dispatch({
        type: 'CHECK_SUPPLEMENTAL_ADD',
        payload: {
          roomId: checkData.roomId,
          statuses: statuses as Record<string, string>,
          notes: consolidatedNotes,
          incidentType,
        },
      });
      setWorkflowState({ view: 'none' });
      if (connectionStatus !== 'offline') {
        addToast({ message: `Supplemental check for ${checkData.roomName} saved.`, icon: 'task_alt', variant: 'success' });
      }
    }
  };

  const headerTitle = 'Record Check';

  return (
    <motion.div
      className={styles.checkFormView}
      // Viewport Contract: Bind height to visual viewport
      style={{ height: 'var(--visual-viewport-height, 100dvh)' }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className={styles.header}>
        <Button variant="tertiary" size="m" iconOnly onClick={handleBack} aria-label="Back">
          <span className="material-symbols-rounded">arrow_back</span>
        </Button>
        <h3 className={styles.headerTitle}>
          {headerTitle}
        </h3>
      </header>

      <main className={styles.formContent} ref={contentRef}>
        <h2 className={styles.roomHeader}>
          {checkData.roomName}

          <div className={styles.badgeWrapper}>
            {/* 1. Manual Check Badge (No Icon) */}
            {isManualCheck && (
              <span className={styles.statusLabel} data-variant="info">
                Manual
              </span>
            )}

            {/* 2. Supplemental Badge (No Icon) */}
            {isSupplementalCheck && (
              <span className={styles.statusLabel} data-variant="info">
                Supplemental
              </span>
            )}
          </div>
        </h2>

        {/* Early Check Warning Block */}
        {!isSupplementalCheck && currentCheckStatus === 'early' && (
          <div className={styles.warningBlock}>
            <span className="material-symbols-rounded" aria-hidden="true">
              warning
            </span>
            <span>This room was checked recently. Are you sure you want to check now?</span>
          </div>
        )}

        {isSupplementalCheck && (
          <div className={styles.incidentTypeSection}>
            <label htmlFor="incident-type-select" className={styles.sectionLabel}>Reason for Check</label>
            <select
              id="incident-type-select"
              className={styles.selectInput}
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
            >
              <option value="" disabled>Select a reason...</option>
              {incidentTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        )}

        {isCheckTypeEnabled && (
          <div className={styles.checkTypeSection}>
            <label htmlFor="check-type-control" className={styles.sectionHeader}>Check type</label>
            <SegmentedControl
              id="check-type-control"
              options={securityCheckTypeOptions}
              value={securityCheckType}
              onValueChange={setSecurityCheckType}
            />
          </div>
        )}

        {markMultipleEnabled && checkData.residents.length > 1 && (
          <div className={styles.markMultipleContainer}>
            <label htmlFor="mark-all-control" className={styles.sectionHeader}>Mark all residents</label>
            <SegmentedControl
              id="mark-all-control"
              options={markMultipleOptions}
              value={currentMarkAllValue}
              onValueChange={handleApplyAll}
              layout={markMultipleLayout}
            />
          </div>
        )}

        <div className={styles.residentListContainer}>
          {checkData.residents.map((resident) => {
            const classification =
              checkData.type === 'scheduled'
                ? checkData.specialClassifications?.find(sc => sc.residentId === resident.id)
                : undefined;

            return (
              <ResidentCheckControl
                key={resident.id}
                resident={resident}
                status={statuses[resident.id]}
                notes={notes[resident.id]}
                onStatusChange={handleStatusChange}
                onNotesChange={handleNotesChange}
                classification={classification}
              />
            );
          })}
        </div>

        {isManualCheck && manualConfirmationEnabled && (
          <div className={styles.attestationContainer}>
            <input
              type="checkbox"
              id="attestation-checkbox"
              checked={isAttested}
              onChange={(e) => setIsAttested(e.target.checked)}
            />
            <label htmlFor="attestation-checkbox" className={styles.attestationLabel}>
              I verify that I am present at this room at the time of check.
            </label>
          </div>
        )}
      </main>

      <footer className={styles.footer} ref={footerRef} data-scrolled={showScrollShadow}>
        <Button variant="primary" size="m" onClick={handleSave} disabled={!canSave}>
          Save
        </Button>
      </footer>
    </motion.div>
  );
};