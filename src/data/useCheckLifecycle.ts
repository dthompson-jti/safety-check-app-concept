import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  slowTickerAtom,
  selectedFacilityGroupAtom,
  selectedFacilityUnitAtom
} from './atoms';
import { safetyChecksAtom, dispatchActionAtom } from './appDataAtoms';

/**
 * The Lifecycle Engine.
 * 
 * This hook subscribes to the "Slow Ticker" (1s) and monitors active checks.
 * If a check's due date + base interval has passed, it marks the check as 'missed'
 * and triggers the regeneration of the next check in the series.
 */
export const useCheckLifecycle = () => {
  const now = useAtomValue(slowTickerAtom);
  const checks = useAtomValue(safetyChecksAtom);

  // Context awareness
  const currentGroupId = useAtomValue(selectedFacilityGroupAtom);
  const currentUnitId = useAtomValue(selectedFacilityUnitAtom);

  const dispatch = useSetAtom(dispatchActionAtom);

  useEffect(() => {
    checks.forEach(check => {
      // Ignore checks that are already in a terminal state or supplemental
      if (['complete', 'missed', 'queued', 'completing'].includes(check.status) || check.type === 'supplemental') {
        return;
      }

      const dueDate = new Date(check.dueDate).getTime();

      // Missed Threshold: Due Date (15m mark - no grace period)
      // Checks become missed as soon as they pass their due time
      const missedThreshold = dueDate;

      if (now >= missedThreshold) {
        // Dispatch Action (Update State)
        dispatch({
          type: 'CHECK_MISSED',
          payload: {
            checkId: check.id,
            missedTime: new Date(now).toISOString()
          }
        });
      }
    });

  }, [now, checks, dispatch, currentGroupId, currentUnitId]);
};