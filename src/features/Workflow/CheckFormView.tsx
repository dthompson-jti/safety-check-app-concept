// src/features/Workflow/CheckFormView.tsx
import { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import {
  WorkflowState,
  workflowStateAtom,
  connectionStatusAtom,
  recentlyCompletedCheckIdAtom,
  completingChecksAtom,
  appConfigAtom,
} from '../../data/atoms';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { useSound } from '../../data/useSound';
import { useVisualViewport } from '../../data/useVisualViewport';
import { draftFormsAtom, saveDraftAtom, clearDraftAtom } from '../../data/formAtoms';
import { Button } from '../../components/Button';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ResidentCheckControl } from './ResidentCheckControl';
import styles from './CheckFormView.module.css';

type CheckFormViewProps = {
  checkData: Extract<WorkflowState, { view: 'form' }>;
};

type StatusValue = 'Awake' | 'Sleeping' | 'Refused';
type CheckTypeValue = 'Locked down' | 'Random';

const checkTypeOptions = [
  { value: 'Locked down', label: 'Locked down' },
  { value: 'Random', label: 'Random' },
] as const;

const markMultipleOptions = [
  { value: 'Refused', label: 'Refused' },
  { value: 'Sleeping', label: 'Sleeping' },
  { value: 'Awake', label: 'Awake' },
];

export const CheckFormView = ({ checkData }: CheckFormViewProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const dispatch = useSetAtom(dispatchActionAtom);
  const addToast = useSetAtom(addToastAtom);
  const setRecentlyCompletedCheckId = useSetAtom(recentlyCompletedCheckIdAtom);
  const setCompletingChecks = useSetAtom(completingChecksAtom);
  
  // Draft State Atoms
  const drafts = useAtomValue(draftFormsAtom);
  const saveDraft = useSetAtom(saveDraftAtom);
  const clearDraft = useSetAtom(clearDraftAtom);

  const connectionStatus = useAtomValue(connectionStatusAtom);
  const { 
    isCheckTypeEnabled, 
    manualConfirmationEnabled, 
    markMultipleEnabled, 
    simpleSubmitEnabled 
  } = useAtomValue(appConfigAtom);
  
  const { trigger: triggerHaptic } = useHaptics();
  const { play: playSound } = useSound();
  
  // Hook: Monitors the *Visual* Viewport to handle keyboard resize events correctly
  useVisualViewport();

  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const [showScrollShadow, setShowScrollShadow] = useState(false);

  // Initialize State: Prefer Draft Data, then fall back to initial
  const draft = checkData.type === 'scheduled' ? drafts[checkData.checkId] : undefined;

  const [statuses, setStatuses] = useState<Record<string, StatusValue | ''>>(() =>
    draft?.statuses || checkData.residents.reduce((acc, res) => ({ ...acc, [res.id]: '' }), {})
  );

  const [notes, setNotes] = useState<Record<string, string>>(() =>
    draft?.notes || checkData.residents.reduce((acc, res) => ({ ...acc, [res.id]: '' }), {})
  );

  const [checkType, setCheckType] = useState<CheckTypeValue | ''>(
    (draft?.checkType as CheckTypeValue) || ''
  );
  
  const [isAttested, setIsAttested] = useState(draft?.isAttested || false);
  const isManualCheck = checkData.type === 'scheduled' && checkData.method === 'manual';

  // Draft Logic: Flag to track if we are unmounting due to success (don't save draft) or cancellation/back (save draft)
  const isSubmitted = useRef(false);

  // Architecture: Resilient Form State
  // If the form is unmounting and wasn't submitted, save the user's work to a global atom.
  // This ensures data persists if the user accidentally navigates away or hits back.
  useEffect(() => {
    return () => {
      if (!isSubmitted.current && checkData.type === 'scheduled') {
        saveDraft({
          checkId: checkData.checkId,
          draft: {
            statuses: statuses as Record<string, string>,
            notes,
            checkType,
            isAttested
          }
        });
      }
    };
  }, [checkData, statuses, notes, checkType, isAttested, saveDraft]);


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

  const handleCancel = () => {
    setWorkflowState({ view: 'none' });
  };

  const handleStatusChange = (residentId: string, status: StatusValue) => {
    setStatuses((prev) => ({ ...prev, [residentId]: status }));
  };

  const handleNotesChange = (residentId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [residentId]: value }));
  };

  // Mark Multiple Logic
  const handleApplyAll = (status: string) => {
    if (!status) return;
    const newStatuses = { ...statuses };
    checkData.residents.forEach(r => {
      newStatuses[r.id] = status as StatusValue;
    });
    setStatuses(newStatuses);
  };

  // Derive the current "All set to" value for the segmented control
  const currentMarkAllValue = useMemo(() => {
    const uniqueValues = new Set(Object.values(statuses));
    // If there's only one unique value and it's not empty string, return it.
    if (uniqueValues.size === 1) {
      const val = uniqueValues.values().next().value;
      if (val) return val;
    }
    return '';
  }, [statuses]);

  const canSave = useMemo(() => {
    const allResidentsHaveStatus = checkData.residents.every((res) => statuses[res.id]);
    if (!allResidentsHaveStatus) return false;
    if (isCheckTypeEnabled && !checkType) return false;
    if (isManualCheck && manualConfirmationEnabled && !isAttested) return false;
    return true;
  }, [statuses, checkData.residents, isCheckTypeEnabled, checkType, isManualCheck, isAttested, manualConfirmationEnabled]);

  const handleSave = () => {
    if (!canSave) return;

    // Mark as submitted to prevent draft saving on unmount
    isSubmitted.current = true;

    // Clean up any previous draft for this check
    if (checkData.type === 'scheduled') {
      clearDraft(checkData.checkId);
    }

    triggerHaptic('success');
    playSound('success');
    
    setWorkflowState({ view: 'none' });
    
    const consolidatedNotes = Object.values(notes)
      .filter(note => note.trim() !== '')
      .join('\n---\n');

    if (checkData.type === 'scheduled') {
      const payload = {
        checkId: checkData.checkId,
        statuses: statuses as Record<string, string>,
        notes: consolidatedNotes,
        completionTime: new Date().toISOString(),
      };

      if (connectionStatus === 'offline') {
        dispatch({ type: 'CHECK_SET_QUEUED', payload });
        return;
      }
      
      // Simple submit skips animation delay for faster dev testing
      const PULSE_ANIMATION_DURATION = simpleSubmitEnabled ? 0 : 1200;
      const EXIT_ANIMATION_DURATION = simpleSubmitEnabled ? 0 : 400;

      dispatch({ type: 'CHECK_SET_COMPLETING', payload: { checkId: checkData.checkId } });
      setRecentlyCompletedCheckId(checkData.checkId);

      if (!simpleSubmitEnabled) {
        setTimeout(() => {
          setCompletingChecks((prev) => new Set(prev).add(checkData.checkId));
        }, PULSE_ANIMATION_DURATION);
      }

      const TOTAL_ANIMATION_DURATION = PULSE_ANIMATION_DURATION + EXIT_ANIMATION_DURATION;
      setTimeout(() => {
        dispatch({ type: 'CHECK_COMPLETE', payload });
        
        setCompletingChecks((prev) => {
          const next = new Set(prev);
          next.delete(checkData.checkId);
          return next;
        });
        
        setRecentlyCompletedCheckId(null);
      }, TOTAL_ANIMATION_DURATION);

    } else if (checkData.type === 'supplemental') {
      dispatch({
        type: 'CHECK_SUPPLEMENTAL_ADD',
        payload: {
          roomId: checkData.roomId,
          statuses: statuses as Record<string, string>,
          notes: consolidatedNotes,
        },
      });
      if (connectionStatus !== 'offline') {
        addToast({ message: `Supplemental check for ${checkData.roomName} saved.`, icon: 'task_alt' });
      }
    }
  };
  
  const headerTitle = 'Record Check';

  return (
    <motion.div
      className={styles.checkFormView}
      // The Variable Contract: Using visual-viewport height ensures the footer 
      // remains perfectly docked above the keyboard on all devices.
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
          {isManualCheck && <span className={styles.manualLabel}>Manual</span>}
        </h2>

        {isCheckTypeEnabled && (
          <div className={styles.checkTypeSection}>
            <label htmlFor="check-type-control">Check type</label>
            <SegmentedControl
              id="check-type-control"
              options={checkTypeOptions}
              value={checkType}
              onValueChange={setCheckType}
            />
          </div>
        )}

        {markMultipleEnabled && checkData.residents.length > 1 && (
          <div className={styles.markMultipleContainer}>
             <SegmentedControl
              id="mark-all-control"
              options={markMultipleOptions}
              value={currentMarkAllValue}
              onValueChange={handleApplyAll}
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
        <Button variant="secondary" size="m" onClick={handleCancel}>
          Cancel
        </Button>
      </footer>
    </motion.div>
  );
};