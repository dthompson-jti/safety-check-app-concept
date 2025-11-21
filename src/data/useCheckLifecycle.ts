// src/data/useCheckLifecycle.ts
import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { 
  slowTickerAtom, 
  selectedFacilityGroupAtom, 
  selectedFacilityUnitAtom 
} from './atoms';
import { safetyChecksAtom, dispatchActionAtom } from './appDataAtoms';
import { addToastAtom } from './toastAtoms';
import { getFacilityContextForLocation } from './mock/facilityUtils';

/**
 * The Lifecycle Engine.
 * 
 * This hook subscribes to the "Slow Ticker" (1s) and monitors active checks.
 * If a check's due date + base interval has passed, it marks the check as 'missed'
 * and triggers the regeneration of the next check in the series.
 * 
 * Architecture Note:
 * To prevent "Notification Storms" (e.g., waking a device after 30 mins), this hook
 * implements Tick-Based Aggregation. All checks expiring in a single 1s tick are
 * grouped into a single toast.
 *
 * It also enforces Context Awareness: Toasts are suppressed if the check belongs
 * to a facility/unit the user is not currently viewing.
 */
export const useCheckLifecycle = () => {
  const now = useAtomValue(slowTickerAtom);
  const checks = useAtomValue(safetyChecksAtom);
  
  // Context awareness
  const currentGroupId = useAtomValue(selectedFacilityGroupAtom);
  const currentUnitId = useAtomValue(selectedFacilityUnitAtom);

  const dispatch = useSetAtom(dispatchActionAtom);
  const addToast = useSetAtom(addToastAtom);

  useEffect(() => {
    const missedChecksInThisTick: string[] = [];

    checks.forEach(check => {
      // Ignore checks that are already in a terminal state or supplemental
      if (['complete', 'missed', 'queued', 'completing'].includes(check.status) || check.type === 'supplemental') {
        return;
      }

      const dueDate = new Date(check.dueDate).getTime();
      const intervalMs = check.baseInterval * 60 * 1000;
      const missedThreshold = dueDate + intervalMs;

      if (now >= missedThreshold) {
        // 1. Dispatch Action (Update State)
        dispatch({ type: 'CHECK_MISSED', payload: { checkId: check.id } });
        
        // 2. Context Filter for Notifications
        // We only notify if the check belongs to the user's currently active view.
        if (check.residents[0]?.location) {
           const context = getFacilityContextForLocation(check.residents[0].location);
           if (context && context.groupId === currentGroupId && context.unitId === currentUnitId) {
             missedChecksInThisTick.push(check.residents[0].location);
           }
        }
      }
    });

    // 3. Batch Notifications
    if (missedChecksInThisTick.length === 1) {
       addToast({
            message: `Check for ${missedChecksInThisTick[0]} was missed.`,
            icon: 'history'
        });
    } else if (missedChecksInThisTick.length > 1) {
        addToast({
            message: `${missedChecksInThisTick.length} checks were missed.`,
            icon: 'history'
        });
    }

  }, [now, checks, dispatch, addToast, currentGroupId, currentUnitId]);
};