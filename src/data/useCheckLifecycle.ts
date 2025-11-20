// src/data/useCheckLifecycle.ts
import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { slowTickerAtom } from './atoms';
import { safetyChecksAtom, dispatchActionAtom } from './appDataAtoms';
import { addToastAtom } from './toastAtoms';

/**
 * The Lifecycle Engine.
 * 
 * This hook subscribes to the "Slow Ticker" (1s) and monitors active checks.
 * If a check's due date + base interval has passed, it marks the check as 'missed'
 * and triggers the regeneration of the next check in the series.
 */
export const useCheckLifecycle = () => {
  const now = useAtomValue(slowTickerAtom);
  // We read all checks, but the logic only acts on actionable ones.
  const checks = useAtomValue(safetyChecksAtom);
  const dispatch = useSetAtom(dispatchActionAtom);
  const addToast = useSetAtom(addToastAtom);

  useEffect(() => {
    // 1. Filter for potential missed checks
    // Logic: If current time > due time + interval, it is missed.
    // Note: checks atom already calculates status 'late', but 'missed' 
    // involves archival, so we handle it here explicitly.
    
    checks.forEach(check => {
      // Ignore checks that are already in a terminal state or supplemental
      if (['complete', 'missed', 'queued', 'completing'].includes(check.status) || check.type === 'supplemental') {
        return;
      }

      const dueDate = new Date(check.dueDate).getTime();
      const intervalMs = check.baseInterval * 60 * 1000;
      const missedThreshold = dueDate + intervalMs;

      if (now >= missedThreshold) {
        // 2. Dispatch Action
        dispatch({ type: 'CHECK_MISSED', payload: { checkId: check.id } });
        
        // 3. Notify User
        addToast({
            message: `Check for ${check.residents[0]?.location} was missed.`,
            icon: 'history'
        });
      }
    });
  }, [now, checks, dispatch, addToast]);
};