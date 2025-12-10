// src/data/appDataAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { produce, Draft } from 'immer';
import { nanoid } from 'nanoid';
import { SafetyCheck, SafetyCheckStatus } from '../types';
import {
  slowTickerAtom,
  historyFilterAtom,
  scheduleSearchQueryAtom,
  scheduleFilterAtom,
  selectedFacilityGroupAtom,
  selectedFacilityUnitAtom,
  manualSearchQueryAtom,
  isGlobalSearchActiveAtom,
  completingChecksAtom,
  recentlyCompletedCheckIdAtom
} from './atoms';
import { draftFormsAtom } from './formAtoms';
import { initialChecks, generateInitialChecks } from './mock/checkData';
import { mockResidents } from './mock/residentData';
import { getFacilityContextForLocation } from './mock/facilityUtils';

// =================================================================
//                 Smart Storage with Debounce & Pruning
// =================================================================

const STORAGE_KEY = 'sc_checks_v1';

// Debounce Utility to prevent UI freezing on write
const debounce = (fn: (key: string, value: string) => void, ms: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (key: string, value: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(key, value), ms);
  };
};

// Emergency Pruning Logic
const attemptPruneAndSave = (key: string, value: string, attempt = 1) => {
  try {
    const data = JSON.parse(value) as SafetyCheck[];

    // Strategy: Remove 'complete' and 'supplemental' checks, oldest first.
    const pruneCount = 50 * attempt; // Aggressively increase prune count

    let prunedCount = 0;
    const prunedData = data.filter((check) => {
      // Always keep actionable items
      if (['early', 'pending', 'due-soon', 'due', 'late', 'completing', 'queued'].includes(check.status)) {
        return true;
      }
      // Remove historical items if we haven't met the quota
      if (prunedCount < pruneCount) {
        prunedCount++;
        return false;
      }
      return true;
    });

    // If we couldn't prune anything, we are in trouble.
    if (prunedData.length === data.length) {
      console.error('CRITICAL: Storage full and cannot prune actionable data.');
      return;
    }

    console.warn(`Storage quota exceeded. Auto-pruned ${prunedCount} old records.`);

    // Try saving again
    localStorage.setItem(key, JSON.stringify(prunedData));

  } catch (e) {
    console.error('Failed to parse or prune data during emergency save.', e);
  }
};

const debouncedSetItem = debounce((key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Check if it's a QuotaExceededError
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      attemptPruneAndSave(key, value);
    } else {
      console.error('Storage Error:', error);
    }
  }
}, 1000); // 1 second delay

const safeStorage = createJSONStorage<SafetyCheck[]>(() => ({
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => debouncedSetItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
}));

const baseChecksAtom = atomWithStorage<SafetyCheck[]>(STORAGE_KEY, initialChecks, safeStorage);


// =================================================================
//                Core Application Data & Reducer
// =================================================================

interface AppData {
  checks: SafetyCheck[];
}

type CheckCompletePayload = {
  checkId: string;
  notes: string;
  statuses: Record<string, string>;
  completionTime: string;
};

type SupplementalCheckPayload = {
  roomId: string;
  notes: string;
  statuses: Record<string, string>;
  incidentType?: string;
};

export type AppAction =
  | { type: 'CHECK_SET_COMPLETING'; payload: { checkId: string } }
  | { type: 'CHECK_COMPLETE'; payload: CheckCompletePayload }
  | { type: 'CHECK_MISSED'; payload: { checkId: string; missedTime: string } }
  | { type: 'CHECK_SUPPLEMENTAL_ADD'; payload: SupplementalCheckPayload }
  | { type: 'CHECK_SET_QUEUED'; payload: CheckCompletePayload }
  | { type: 'SYNC_QUEUED_CHECKS'; payload: { syncTime: string } }
  | { type: 'RESET_DATA' };

// UPDATED: Legal Compliance Anchor Logic.
// Per requirements: If a check is completed/missed AFTER the Max Time (15m),
// the next check must anchor to the Max Time (previous due date), NOT the completion time.
// This prevents schedule drift and maintains legal compliance.
const generateNextCheck = (previousCheck: SafetyCheck, originTime: string): SafetyCheck => {
  const originTimestamp = new Date(originTime).getTime();
  const maxTimeTimestamp = new Date(previousCheck.dueDate).getTime();

  // If the check was completed/missed after the max time, anchor to max time
  // Otherwise, anchor to the actual completion time (allows flexibility for early/on-time checks)
  const anchorTimestamp = Math.min(originTimestamp, maxTimeTimestamp);

  const intervalMs = previousCheck.baseInterval * 60 * 1000;
  const nextDueDate = new Date(anchorTimestamp + intervalMs);

  return {
    ...previousCheck,
    id: `chk_${nanoid()}`,
    status: 'early', // New checks start in the early window
    dueDate: nextDueDate.toISOString(),
    generationId: previousCheck.generationId + 1,
    lastChecked: undefined,
    completionStatus: undefined,
    notes: undefined,
  };
};

const appDataAtom = atom<AppData, [AppAction], void>(
  (get) => ({ checks: get(baseChecksAtom) }),
  (get, set, action) => {
    const currentChecks = get(baseChecksAtom);

    if (action.type === 'RESET_DATA') {
      // Use factory function to generate fresh timestamps
      set(baseChecksAtom, generateInitialChecks());
      set(completingChecksAtom, new Set());
      set(recentlyCompletedCheckIdAtom, null);
      set(draftFormsAtom, {});
      return;
    }

    const nextState = produce({ checks: currentChecks }, (draft: Draft<AppData>) => {
      switch (action.type) {
        case 'CHECK_SET_COMPLETING': {
          const check = draft.checks.find(c => c.id === action.payload.checkId);
          if (check) {
            check.status = 'completing';
          }
          break;
        }
        case 'CHECK_COMPLETE': {
          const check = draft.checks.find(c => c.id === action.payload.checkId);
          if (check) {
            check.status = 'complete';
            check.lastChecked = action.payload.completionTime;
            check.completionStatus = Object.values(action.payload.statuses)[0] || 'Complete';
            check.notes = action.payload.notes;

            // Anchor: Completion Time
            const nextCheck = generateNextCheck(check as unknown as SafetyCheck, action.payload.completionTime);
            draft.checks.push(nextCheck as Draft<SafetyCheck>);
          }
          break;
        }
        case 'CHECK_MISSED': {
          const check = draft.checks.find(c => c.id === action.payload.checkId);
          if (check) {
            check.status = 'missed';
            // Anchor: Missed Time (passed from lifecycle hook)
            const nextCheck = generateNextCheck(check as unknown as SafetyCheck, action.payload.missedTime);
            draft.checks.push(nextCheck as Draft<SafetyCheck>);
          }
          break;
        }
        case 'CHECK_SET_QUEUED': {
          const check = draft.checks.find(c => c.id === action.payload.checkId);
          if (check) {
            check.status = 'queued';
            check.lastChecked = action.payload.completionTime;
            check.completionStatus = Object.values(action.payload.statuses)[0] || 'Complete';
            check.notes = action.payload.notes;

            // Anchor: Completion Time (even if queued)
            const nextCheck = generateNextCheck(check as unknown as SafetyCheck, action.payload.completionTime);
            draft.checks.push(nextCheck as Draft<SafetyCheck>);
          }
          break;
        }
        case 'SYNC_QUEUED_CHECKS': {
          draft.checks.forEach(check => {
            if (check.status === 'queued') {
              check.status = 'complete';
            }
          });
          break;
        }
        case 'CHECK_SUPPLEMENTAL_ADD': {
          const { roomId, notes, statuses, incidentType } = action.payload;
          const residentsInRoom = mockResidents.filter(r => r.id === roomId || r.location === mockResidents.find(res => res.id === roomId)?.location);

          if (residentsInRoom.length > 0) {
            const newCheck: SafetyCheck = {
              id: `sup_${nanoid()}`,
              type: 'supplemental',
              residents: residentsInRoom,
              status: 'complete',
              dueDate: new Date().toISOString(),
              walkingOrderIndex: 999,
              lastChecked: new Date().toISOString(),
              notes,
              completionStatus: Object.values(statuses)[0] || 'Complete',
              incidentType,
              generationId: 0,
              baseInterval: 0,
            };
            draft.checks.push(newCheck);
          }
          break;
        }
      }
    });
    set(baseChecksAtom, nextState.checks);
  }
);

export const dispatchActionAtom = atom(null, (_get, set, action: AppAction) => {
  set(appDataAtom, action);
});


// =================================================================
//                Derived, Read-Only Atoms for UI
// =================================================================

export const safetyChecksAtom = atom<SafetyCheck[]>((get) => {
  const { checks } = get(appDataAtom);
  const timeNow = get(slowTickerAtom);

  let hasChanges = false;

  const updatedChecks = checks.map(check => {
    // Skip terminal states
    if (['complete', 'completing', 'queued', 'missed'].includes(check.status)) {
      return check;
    }

    if (check.type === 'supplemental') return check;

    // --- WINDOW LOGIC (Simplified 3-state model) ---
    // Anchor: Due Date - Interval
    // Upcoming (early/pending): 0-13m
    // Due: 13-15m (warning/yellow)
    // Missed: 15m+ (handled by lifecycle hook)

    const intervalMs = check.baseInterval * 60 * 1000;
    const dueTime = new Date(check.dueDate).getTime();
    const windowStartTime = dueTime - intervalMs;
    const elapsedMs = timeNow - windowStartTime;
    const elapsedMinutes = elapsedMs / (60 * 1000);

    let newStatus: SafetyCheckStatus = 'pending';

    if (elapsedMinutes < 7) {
      newStatus = 'early'; // Internal: for form warning
    } else if (elapsedMinutes < 13) {
      newStatus = 'pending';
    } else if (elapsedMinutes < 15) {
      newStatus = 'due';
    } else {
      // 15m+ stays as 'pending' until lifecycle hook marks it 'missed'
      // This prevents flash of wrong status
      newStatus = 'pending';
    }

    if (check.status === newStatus) {
      return check;
    }

    hasChanges = true;
    return { ...check, status: newStatus };
  });

  return hasChanges ? updatedChecks : checks;
});

const contextFilteredChecksAtom = atom((get) => {
  const allChecks = get(safetyChecksAtom);
  const selectedGroupId = get(selectedFacilityGroupAtom);
  const selectedUnitId = get(selectedFacilityUnitAtom);

  if (!selectedGroupId || !selectedUnitId) {
    return [];
  }

  // Keep missed checks visible in schedule (they are actionable)
  const incompleteChecks = allChecks.filter(c =>
    c.status !== 'complete' &&
    c.type !== 'supplemental'
  );

  return incompleteChecks.filter(check => {
    if (!check.residents[0]) return false;
    const location = check.residents[0].location;
    const context = getFacilityContextForLocation(location);

    return context?.groupId === selectedGroupId && context?.unitId === selectedUnitId;
  });
});

const searchFilteredChecksAtom = atom((get) => {
  const allChecks = get(contextFilteredChecksAtom);
  const query = get(scheduleSearchQueryAtom).toLowerCase().trim();

  if (!query) {
    return allChecks;
  }

  return allChecks.filter((check) => {
    const roomName = check.residents[0]?.location || '';
    if (roomName.toLowerCase().includes(query)) {
      return true;
    }
    return check.residents.some((resident) =>
      resident.name.toLowerCase().includes(query)
    );
  });
});

const scheduleFilteredChecksAtom = atom((get) => {
  const checks = get(searchFilteredChecksAtom);
  const filter = get(scheduleFilterAtom);

  if (filter === 'all') {
    return checks;
  }

  return checks.filter(check => check.status === filter);
});

export const timeSortedChecksAtom = atom((get) => {
  const checks = get(scheduleFilteredChecksAtom);
  const sorted = [...checks];

  // Sort strictly by Due Date (ascending).
  sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return sorted;
});

export const routeSortedChecksAtom = atom((get) => {
  const checks = get(scheduleFilteredChecksAtom);
  // Keep 'completing' items in the actionable list so they don't jump sections
  const actionable = checks.filter(c => !['complete', 'queued', 'missed'].includes(c.status) && c.type !== 'supplemental');
  const nonActionable = checks.filter(c => ['complete', 'queued', 'missed'].includes(c.status) || c.type === 'supplemental');

  actionable.sort((a, b) => a.walkingOrderIndex - b.walkingOrderIndex);
  nonActionable.sort((a, b) => {
    const timeB = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
    const timeA = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
    return timeB - timeA;
  });

  return [...actionable, ...nonActionable];
});

// Simplified status counts: missed, due, pending (upcoming)
export const statusCountsAtom = atom((get) => {
  const checks = get(searchFilteredChecksAtom);
  const counts = { missed: 0, due: 0, pending: 0, completed: 0, queued: 0 };
  for (const check of checks) {
    switch (check.status) {
      case 'missed': counts.missed++; break;
      case 'due': counts.due++; break;
      case 'pending': counts.pending++; break;
      case 'early': counts.pending++; break; // Early counted as pending
      case 'complete': counts.completed++; break;
      case 'queued': counts.queued++; break;
    }
  }
  return counts;
});

export const queuedChecksCountAtom = atom((get) => {
  const { checks } = get(appDataAtom);
  return checks.filter(c => c.status === 'queued').length;
});

// ... (Manual Search and History atoms remain unchanged below)
const filterChecksByQuery = (checks: SafetyCheck[], query: string) => {
  if (!query) return checks;
  const lowerCaseQuery = query.toLowerCase();
  return checks.filter(c =>
    c.residents.some(
      r =>
        r.name.toLowerCase().includes(lowerCaseQuery) ||
        r.location.toLowerCase().includes(lowerCaseQuery)
    )
  );
};

export const contextualManualSearchResultsAtom = atom((get) => {
  const query = get(manualSearchQueryAtom);
  const contextualChecks = get(contextFilteredChecksAtom);
  return filterChecksByQuery(contextualChecks, query);
});

export const globalManualSearchResultsAtom = atom((get) => {
  const query = get(manualSearchQueryAtom);
  const allChecks = get(safetyChecksAtom);
  const incompleteChecks = allChecks.filter(c =>
    c.status !== 'complete' &&
    c.status !== 'missed' &&
    c.type !== 'supplemental'
  );
  const results = filterChecksByQuery(incompleteChecks, query);
  return { results, count: results.length };
});

export const manualSelectionResultsAtom = atom((get) => {
  const query = get(manualSearchQueryAtom);
  if (!query) {
    return get(contextFilteredChecksAtom);
  }

  const contextualResults = get(contextualManualSearchResultsAtom);
  if (contextualResults.length > 0) {
    return contextualResults;
  }

  if (get(isGlobalSearchActiveAtom)) {
    return get(globalManualSearchResultsAtom).results;
  }

  return [];
});

const baseHistoricalChecksAtom = atom((get) => {
  const { checks } = get(appDataAtom);
  // Exclude active checks from history
  return checks.filter(c => c.status !== 'pending' && c.status !== 'early' && c.status !== 'due' && c.status !== 'completing');
});

export const historyCountsAtom = atom((get) => {
  const historicalChecks = get(baseHistoricalChecksAtom);
  return {
    all: historicalChecks.length,
    missed: historicalChecks.filter(c => c.status === 'missed').length,
    supplemental: historicalChecks.filter(c => c.type === 'supplemental').length,
  };
});

const formatDateGroup = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (targetDate.getTime() === today.getTime()) return 'Today';
  if (targetDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export const groupedHistoryAtom = atom((get) => {
  const historicalChecksBase = get(baseHistoricalChecksAtom);
  const filter = get(historyFilterAtom);

  let filteredChecks = historicalChecksBase;
  if (filter === 'missed') {
    filteredChecks = historicalChecksBase.filter(c => c.status === 'missed');
  } else if (filter === 'supplemental') {
    filteredChecks = historicalChecksBase.filter(c => c.type === 'supplemental');
  }

  filteredChecks.sort((a, b) => {
    const dateA = new Date(a.lastChecked || a.dueDate).getTime();
    const dateB = new Date(b.lastChecked || b.dueDate).getTime();
    return dateB - dateA;
  });

  if (filteredChecks.length === 0) {
    return { groupCounts: [], groups: [], flattenedChecks: [] };
  }

  const grouped = filteredChecks.reduce((acc, check) => {
    const checkDate = new Date(check.lastChecked || check.dueDate);
    const groupName = formatDateGroup(checkDate);
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(check);
    return acc;
  }, {} as Record<string, SafetyCheck[]>);

  const groups = Object.keys(grouped);
  const groupCounts = groups.map(groupName => grouped[groupName].length);
  const flattenedChecks = groups.flatMap(groupName => grouped[groupName]);

  return { groupCounts, groups, flattenedChecks };
});