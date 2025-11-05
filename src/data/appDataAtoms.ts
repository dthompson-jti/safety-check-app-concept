// src/data/appDataAtoms.ts
import { atom } from 'jotai';
import { produce, Draft } from 'immer';
import { nanoid } from 'nanoid';
import { SafetyCheck, Resident, SafetyCheckStatus } from '../types';
import { sortModeAtom, currentTimeAtom, historyFilterAtom } from './atoms';

// =================================================================
//                 Mock Data Store
// =================================================================

// Exporting for use in Admin tools
export const mockResidents: Resident[] = [
  { id: 'res1', name: 'Eleanor Vance', location: 'Room 101' },
  { id: 'res2', name: 'Marcus Holloway', location: 'Room 102' },
  { id: 'res3', name: 'Clara Oswald', location: 'Room 103' },
  { id: 'res4', name: 'Arthur Pendelton', location: 'Room 201' },
  { id: 'res5', name: 'Beatrix Kiddo', location: 'Room 202' },
  { id: 'res6', name: 'James Holden', location: 'Room 203' },
  { id: 'res7', name: 'Naomi Nagata', location: 'Room 204' },
  { id: 'res8', name: 'Alex Kamal', location: 'Room 205' },
  { id: 'res9', name: 'Amos Burton', location: 'Room 206' },
  { id: 'res10', name: 'Chrisjen Avasarala', location: 'Room 301' },
];

const now = new Date();
const inNMinutes = (n: number) => new Date(now.getTime() + n * 60 * 1000).toISOString();

const mockChecks: SafetyCheck[] = [
  // Late check (will become overdue)
  { id: 'chk1', resident: mockResidents[0], status: 'pending', dueDate: inNMinutes(-2), walkingOrderIndex: 1, specialClassification: { type: 'SR', details: 'Fall Risk' } },
  // Due soon
  { id: 'chk2', resident: mockResidents[1], status: 'pending', dueDate: inNMinutes(10), walkingOrderIndex: 2 },
  // Upcoming
  { id: 'chk3', resident: mockResidents[2], status: 'pending', dueDate: inNMinutes(30), walkingOrderIndex: 3 },
  { id: 'chk4', resident: mockResidents[3], status: 'pending', dueDate: inNMinutes(90), walkingOrderIndex: 4 },
  // Completed
  { id: 'chk5', resident: mockResidents[4], status: 'complete', dueDate: inNMinutes(-120), walkingOrderIndex: 0, lastChecked: inNMinutes(-125), completionStatus: 'Awake', notes: 'Resident was watching TV.', specialClassification: { type: 'SR', details: 'Medical Alert' } },
  // Missed check (well past due)
  { id: 'chk6', resident: mockResidents[5], status: 'pending', dueDate: inNMinutes(-180), walkingOrderIndex: 6 },
  { id: 'chk7', resident: mockResidents[6], status: 'pending', dueDate: inNMinutes(240), walkingOrderIndex: 7 },
  { id: 'chk8', resident: mockResidents[7], status: 'pending', dueDate: inNMinutes(270), walkingOrderIndex: 8 },
  { id: 'chk9', resident: mockResidents[8], status: 'pending', dueDate: inNMinutes(300), walkingOrderIndex: 9 },
  { id: 'chk10', resident: mockResidents[9], status: 'pending', dueDate: inNMinutes(360), walkingOrderIndex: 10 },
];

// =================================================================
//                Core Application Data & Reducer
// =================================================================

interface AppData {
  checks: SafetyCheck[];
}

type CheckCompletePayload = {
  checkId: string;
  notes: string;
  status: string;
  completionTime: string;
};

type SupplementalCheckPayload = {
  roomId: string;
  notes: string;
  status: string;
};

export type AppAction =
  | { type: 'CHECK_UPDATE_STATUS'; payload: { id: string; status: SafetyCheckStatus } }
  | { type: 'CHECK_COMPLETE'; payload: CheckCompletePayload }
  | { type: 'CHECK_SUPPLEMENTAL_ADD'; payload: SupplementalCheckPayload };

const appDataAtom = atom<AppData>({
  checks: mockChecks,
});

export const dispatchActionAtom = atom(
  null,
  (get, set, action: AppAction) => {
    const nextState = produce(get(appDataAtom), (draft: Draft<AppData>) => {
      switch (action.type) {
        case 'CHECK_UPDATE_STATUS': {
          const check = draft.checks.find(c => c.id === action.payload.id);
          if (check) {
            check.status = action.payload.status;
          }
          break;
        }
        case 'CHECK_COMPLETE': {
          const check = draft.checks.find(c => c.id === action.payload.checkId);
          if (check) {
            check.status = 'complete';
            check.lastChecked = action.payload.completionTime;
            check.completionStatus = action.payload.status;
            check.notes = action.payload.notes;
          }
          break;
        }
        case 'CHECK_SUPPLEMENTAL_ADD': {
          const { roomId, notes, status } = action.payload;
          const resident = mockResidents.find(r => r.id === roomId);
          if (resident) {
            const newCheck: SafetyCheck = {
              id: `sup_${nanoid()}`,
              resident,
              status: 'supplemental',
              dueDate: new Date().toISOString(),
              walkingOrderIndex: 999, // High index to sort last
              lastChecked: new Date().toISOString(),
              notes,
              completionStatus: status,
            };
            draft.checks.push(newCheck);
          }
          break;
        }
      }
    });
    set(appDataAtom, nextState);
  }
);

// =================================================================
//                Derived, Read-Only Atoms for UI
// =================================================================

export const safetyChecksAtom = atom<SafetyCheck[]>((get) => {
  const checks = get(appDataAtom).checks;
  const timeNow = get(currentTimeAtom).getTime();
  const fifteenMinutesFromNow = timeNow + 15 * 60 * 1000;
  const sixtyMinutesAgo = timeNow - 60 * 60 * 1000;

  // Update status based on current time for live updates
  return checks.map(check => {
    if (check.status === 'complete' || check.status === 'supplemental') {
      return check;
    }
    const dueTime = new Date(check.dueDate).getTime();
    let newStatus: SafetyCheckStatus = 'pending';

    if (dueTime < sixtyMinutesAgo) {
      newStatus = 'missed';
    } else if (dueTime < timeNow) {
      newStatus = 'late';
    } else if (dueTime < fifteenMinutesFromNow) {
      newStatus = 'pending'; // Treat "due-soon" as a pending state for data, let UI handle presentation
    }
    return { ...check, status: newStatus };
  });
});

export const sortedChecksAtom = atom((get) => {
  const checks = get(safetyChecksAtom);
  const mode = get(sortModeAtom);
  const sorted = [...checks];

  const statusOrder: Record<SafetyCheckStatus, number> = {
    late: 0,
    missed: 1,
    pending: 2,
    complete: 3,
    supplemental: 4,
  };

  if (mode === 'dueTime') {
    sorted.sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  } else { // 'walkingOrder'
    sorted.sort((a, b) => a.walkingOrderIndex - b.walkingOrderIndex);
  }
  return sorted;
});

export const groupedChecksAtom = atom((get) => {
  const checks = get(sortedChecksAtom);
  const groups = {
    late: [] as SafetyCheck[],
    missed: [] as SafetyCheck[],
    pending: [] as SafetyCheck[],
    complete: [] as SafetyCheck[],
    supplemental: [] as SafetyCheck[],
  };

  for (const check of checks) {
    if (groups[check.status]) {
      groups[check.status].push(check);
    }
  }
  return groups;
});


// =================================================================
//                Derived Atoms for History View
// =================================================================

const formatDateGroup = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (targetDate.getTime() === today.getTime()) {
      return 'Today';
  }
  if (targetDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
  }
  return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
  });
};

export const groupedHistoryAtom = atom((get) => {
  const allChecks = get(safetyChecksAtom);
  const filter = get(historyFilterAtom);

  // 1. Filter for historical checks
  let historicalChecks = allChecks.filter(c => c.status !== 'pending');

  // 2. Apply toggle group filter
  if (filter === 'lateOrMissed') {
    historicalChecks = historicalChecks.filter(c => c.status === 'late' || c.status === 'missed');
  } else if (filter === 'supplemental') {
    historicalChecks = historicalChecks.filter(c => c.status === 'supplemental');
  }

  // 3. Sort chronologically descending
  historicalChecks.sort((a, b) => {
    const dateA = new Date(a.lastChecked || a.dueDate).getTime();
    const dateB = new Date(b.lastChecked || b.dueDate).getTime();
    return dateB - dateA;
  });

  if (historicalChecks.length === 0) {
    return { groupCounts: [], groups: [], flattenedChecks: [] };
  }

  // 4. Group by date
  const grouped = historicalChecks.reduce((acc, check) => {
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