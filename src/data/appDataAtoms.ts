// src/data/appDataAtoms.ts
import { atom } from 'jotai';
import { produce, Draft } from 'immer';
import { nanoid } from 'nanoid';
import { SafetyCheck, SafetyCheckStatus } from '../types';
import {
  currentTimeAtom,
  historyFilterAtom,
  scheduleSearchQueryAtom,
  scheduleFilterAtom,
  selectedFacilityGroupAtom,
  selectedFacilityUnitAtom,
  manualSearchQueryAtom,
  isGlobalSearchActiveAtom,
} from './atoms';
import { initialChecks } from './mock/checkData';
import { mockResidents } from './mock/residentData';
import { getFacilityContextForLocation } from './mock/facilityUtils';

// =================================================================
//                 Mock Data Store
// =================================================================

const baseChecksAtom = atom(initialChecks, (_get, set, update: SafetyCheck[]) => {
    set(baseChecksAtom, update);
});


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
};

export type AppAction =
  | { type: 'CHECK_SET_COMPLETING'; payload: { checkId: string } }
  | { type: 'CHECK_COMPLETE'; payload: CheckCompletePayload }
  | { type: 'CHECK_SUPPLEMENTAL_ADD'; payload: SupplementalCheckPayload }
  | { type: 'CHECK_SET_QUEUED'; payload: CheckCompletePayload }
  | { type: 'SYNC_QUEUED_CHECKS'; payload: { syncTime: string } };

const appDataAtom = atom<AppData, [AppAction], void>(
  (get) => ({ checks: get(baseChecksAtom) }),
  (get, set, action) => {
    const currentChecks = get(baseChecksAtom);
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
          const { roomId, notes, statuses } = action.payload;
          const residentsInRoom = mockResidents.filter(r => r.id === roomId || r.location === mockResidents.find(res => res.id === roomId)?.location);

          if (residentsInRoom.length > 0) {
            const newCheck: SafetyCheck = {
              id: `sup_${nanoid()}`,
              residents: residentsInRoom,
              status: 'supplemental',
              dueDate: new Date().toISOString(),
              walkingOrderIndex: 999,
              lastChecked: new Date().toISOString(),
              notes,
              completionStatus: Object.values(statuses)[0] || 'Complete',
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
  const timeNow = get(currentTimeAtom).getTime();
  const threeMinutesFromNow = timeNow + 3 * 60 * 1000;

  return checks.map(check => {
      if (['complete', 'supplemental', 'completing', 'queued'].includes(check.status)) {
        return check;
      }
      const dueTime = new Date(check.dueDate).getTime();

      let newStatus: SafetyCheckStatus = 'pending';
      if (dueTime < timeNow) {
        newStatus = 'late';
      } else if (dueTime < threeMinutesFromNow) {
        newStatus = 'due-soon';
      } else {
        newStatus = 'pending';
      }

      if (check.status === newStatus) {
        return check;
      }

      return { ...check, status: newStatus };
    });
});

const contextFilteredChecksAtom = atom((get) => {
    const allChecks = get(safetyChecksAtom);
    const selectedGroupId = get(selectedFacilityGroupAtom);
    const selectedUnitId = get(selectedFacilityUnitAtom);

    if (!selectedGroupId || !selectedUnitId) {
        return [];
    }

    const incompleteChecks = allChecks.filter(c => c.status !== 'complete' && c.status !== 'missed' && c.status !== 'supplemental');

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
  
  const filterKey = filter === 'due-soon' ? 'due-soon' : filter;
  return checks.filter(check => check.status === filterKey);
});

const statusOrder: Record<SafetyCheckStatus, number> = {
  late: 0,
  'due-soon': 1,
  pending: 2,
  completing: 2, 
  queued: 3,
  missed: 4,
  complete: 5,
  supplemental: 6,
};

export const timeSortedChecksAtom = atom((get) => {
  const checks = get(scheduleFilteredChecksAtom);
  const sorted = [...checks];
  sorted.sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  return sorted;
});

export const routeSortedChecksAtom = atom((get) => {
  const checks = get(scheduleFilteredChecksAtom);
  const actionable = checks.filter(c => !['complete', 'supplemental', 'queued'].includes(c.status));
  const nonActionable = checks.filter(c => ['complete', 'supplemental', 'queued'].includes(c.status));

  actionable.sort((a, b) => a.walkingOrderIndex - b.walkingOrderIndex);
  nonActionable.sort((a, b) => {
    const timeB = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
    const timeA = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
    return timeB - timeA;
  });

  return [...actionable, ...nonActionable];
});

export const statusCountsAtom = atom((get) => {
  const checks = get(searchFilteredChecksAtom);
  const counts = { late: 0, dueSoon: 0, pending: 0, completed: 0, queued: 0 };
  for (const check of checks) {
    switch (check.status) {
      case 'late': counts.late++; break;
      case 'due-soon': counts.dueSoon++; break;
      case 'pending': counts.pending++; break;
      case 'complete': counts.completed++; break;
      case 'queued': counts.queued++; break;
    }
  }
  return counts;
});

// =================================================================
//           Derived Atoms for Manual Selection View
// =================================================================
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
  const incompleteChecks = allChecks.filter(c => c.status !== 'complete' && c.status !== 'missed' && c.status !== 'supplemental');
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
  
  return []; // Return empty if contextual search fails and global isn't active
});


// =================================================================
//                Derived Atoms for History View
// =================================================================

const baseHistoricalChecksAtom = atom((get) => {
  const { checks } = get(appDataAtom);
  return checks.filter(c => c.status !== 'pending' && c.status !== 'due-soon' && c.status !== 'completing');
});

export const historyCountsAtom = atom((get) => {
  const historicalChecks = get(baseHistoricalChecksAtom);
  return {
    all: historicalChecks.length,
    lateOrMissed: historicalChecks.filter(c => c.status === 'late' || c.status === 'missed').length,
    supplemental: historicalChecks.filter(c => c.status === 'supplemental').length,
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
  if (filter === 'lateOrMissed') {
    filteredChecks = historicalChecksBase.filter(c => c.status === 'late' || c.status === 'missed');
  } else if (filter === 'supplemental') {
    filteredChecks = historicalChecksBase.filter(c => c.status === 'supplemental');
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