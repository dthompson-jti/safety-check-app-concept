// src/features/Workflow/CheckFormView.tsx
import { useState, useMemo, useRef, useLayoutEffect } from 'react';
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
import { ResidentCheckControl } from './ResidentCheckControl';
import styles from './CheckFormView.module.css';

type CheckFormViewProps = {
  checkData: Extract<WorkflowState, { view: 'form' }>;
};

type StatusValue = 'Awake' | 'Sleeping' | 'Refused';

export const CheckFormView = ({ checkData }: CheckFormViewProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const dispatch = useSetAtom(dispatchActionAtom);
  const addToast = useSetAtom(addToastAtom);
  const setRecentlyCompletedCheckId = useSetAtom(recentlyCompletedCheckIdAtom);
  const setCompletingChecks = useSetAtom(completingChecksAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const { trigger: triggerHaptic } = useHaptics();

  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const [showScrollShadow, setShowScrollShadow] = useState(false);

  const [statuses, setStatuses] = useState<Record<string, StatusValue | ''>>(() =>
    checkData.residents.reduce((acc, res) => ({ ...acc, [res.id]: '' }), {})
  );

  const [notes, setNotes] = useState<Record<string, string>>(() =>
    checkData.residents.reduce((acc, res) => ({ ...acc, [res.id]: '' }), {})
  );

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

  const allResidentsHaveStatus = useMemo(() => {
    return checkData.residents.every((res) => statuses[res.id]);
  }, [statuses, checkData.residents]);

  const handleSave = () => {
    if (!allResidentsHaveStatus) return;

    triggerHaptic('success');
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
        addToast({ message: `Check for ${checkData.roomName} queued.`, icon: 'cloud_off' });
        return;
      }
      
      const PULSE_ANIMATION_DURATION = 1200;
      const EXIT_ANIMATION_DURATION = 400;

      dispatch({ type: 'CHECK_SET_COMPLETING', payload: { checkId: checkData.checkId } });
      setRecentlyCompletedCheckId(checkData.checkId);

      setTimeout(() => {
        setCompletingChecks((prev) => new Set(prev).add(checkData.checkId));
      }, PULSE_ANIMATION_DURATION);

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
      addToast({ message: `Supplemental check for ${checkData.roomName} saved.`, icon: 'task_alt' });
    }
  };

  return (
    <motion.div
      className={styles.checkFormView}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className={styles.header}>
        <Button variant="tertiary" size="m" iconOnly onClick={handleBack} aria-label="Back">
          <span className="material-symbols-rounded">arrow_back</span>
        </Button>
        <h3>Record check</h3>
      </header>

      <main className={styles.formContent} ref={contentRef}>
        <h2 className={styles.roomHeader}>{checkData.roomName}</h2>

        <div className={styles.residentListContainer}>
          {checkData.residents.map((resident) => {
            // DEFINITIVE FIX: Use the `find` method on the `specialClassifications` array
            // to locate the correct classification object for this specific resident.
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
      </main>

      <footer className={styles.footer} ref={footerRef} data-scrolled={showScrollShadow}>
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