// src/data/useCheckLifecycle.ts
import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  slowTickerAtom,
  selectedFacilityGroupAtom,
  selectedFacilityUnitAtom,
  appConfigAtom
} from './atoms';
import { safetyChecksAtom, dispatchActionAtom } from './appDataAtoms';
import { addToastAtom, toastsAtom } from './toastAtoms';
import { getFacilityContextForLocation } from './mock/facilityUtils';

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
  const { missedCheckToastsEnabled } = useAtomValue(appConfigAtom);
  const activeToasts = useAtomValue(toastsAtom);

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

      // Missed Threshold: Due Date (15m mark - no grace period)
      // Checks become missed as soon as they pass their due time
      const missedThreshold = dueDate;

      if (now >= missedThreshold) {
        // 1. Dispatch Action (Update State)
        dispatch({
          type: 'CHECK_MISSED',
          payload: {
            checkId: check.id,
            missedTime: new Date(now).toISOString()
          }
        });

        // 2. Context Filter for Notifications
        if (check.residents[0]?.location) {
          const context = getFacilityContextForLocation(check.residents[0].location);
          if (context && context.groupId === currentGroupId && context.unitId === currentUnitId) {
            missedChecksInThisTick.push(check.residents[0].location);
          }
        }
      }
    });

    // 3. Batch Notifications with Counter Logic
    if (missedChecksInThisTick.length > 0 && missedCheckToastsEnabled) {
      const stableId = 'lifecycle-missed-check';

      // Check if we already have a missed check toast visible
      const existingToast = activeToasts.find(t => t.stableId === stableId);

      let totalCount = missedChecksInThisTick.length;

      if (existingToast) {
        // UPDATED: Robust Regex to catch "2 checks missed", "10 checks missed", etc.
        // We use case-insensitive flag 'i' and allow flexible whitespace.
        const countMatch = existingToast.message.match(/^(\d+)\s+checks\s+missed/i);

        if (countMatch) {
          // If we found a number (e.g. "2"), parse it and add the new batch.
          totalCount += parseInt(countMatch[1], 10);
        } else {
          // Fallback: If the message exists but isn't in the "X checks missed" format
          // (e.g. "Check for Room 101 was missed"), it represents exactly 1 previous miss.
          totalCount += 1;
        }
      }

      let message = '';

      // If the total count is 1 (and it's a fresh toast), show specific details.
      // Otherwise, show the aggregate counter.
      if (totalCount === 1) {
        message = `Check for ${missedChecksInThisTick[0]} was missed`;
      } else {
        message = `${totalCount} checks missed`;
      }

      addToast({
        message,
        icon: 'history',
        variant: 'warning',
        stableId
      });
    }

  }, [now, checks, dispatch, addToast, currentGroupId, currentUnitId, missedCheckToastsEnabled, activeToasts]);
};