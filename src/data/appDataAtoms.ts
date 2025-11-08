// src/data/appDataAtoms.ts
import { atom } from 'jotai';
import { produce, Draft } from 'immer';
import { nanoid } from 'nanoid';
import { SafetyCheck, Resident, SafetyCheckStatus } from '../types';
import { minuteTickerAtom, historyFilterAtom, completingChecksAtom } from './atoms';

// =================================================================
//                 Mock Data Store
// =================================================================

export const mockResidents: Resident[] = [
  { id: 'res1', name: 'James Holden', location: 'Rocinante Cockpit' },
  { id: 'res2', name: 'Naomi Nagata', location: 'Rocinante Engineering' },
  { id: 'res3', name: 'Amos Burton', location: 'Rocinante Galley' },
  { id: 'res4', name: 'Alex Kamal', location: 'Rocinante Cockpit' },
  { id: 'res5', name: 'Chrisjen Avasarala', location: 'UN-One' },
  { id: 'res6', name: 'Geralt of Rivia', location: 'Kaer Morhen' },
  { id: 'res7', name: 'Yennefer of Vengerberg', location: 'Kaer Morhen' },
  { id: 'res8', name: 'Ciri Riannon', location: 'Kaer Morhen' },
  { id: 'res9', name: 'John Wick', location: 'Continental NYC' },
  { id: 'res10', name: 'Sarah Connor', location: 'Cyberdyne Annex' },
  { id: 'res11', name: 'Kyle Reese', location: 'Cyberdyne Annex' },
  { id: 'res12', name: 'Ellen Ripley', location: 'LV-426 Colony' },
  { id: 'res13', name: 'Leto Atreides', location: 'Arrakis Palace' },
  { id: 'res14', name: 'Harry Potter', location: 'Gryffindor Tower' },
  { id: 'res15', name: 'Hermione Granger', location: 'Gryffindor Tower' },
  { id: 'res16', name: 'Ron Weasley', location: 'Gryffindor Tower' },
  { id: 'res17', name: 'Albus Dumbledore', location: "Headmaster's Office" },
  { id: 'res18', name: 'Severus Snape', location: 'Potions Classroom' },
  { id: 'res19', name: 'Luke Skywalker', location: 'Tatooine Homestead' },
  { id: 'res20', name: 'Leia Organa', location: 'Tantive IV' },
  { id: 'res21', name: 'Han Solo', location: 'Millennium Falcon' },
  { id: 'res22', name: 'Darth Vader', location: 'Executor Bridge' },
  { id: 'res23', name: 'Obi-Wan Kenobi', location: 'Tatooine Homestead' },
  { id: 'res24', name: 'Sheev Palpatine', location: 'Death Star Throne Room' },
];

// Generate mock checks dynamically. This ensures that the relative times
// are always calculated against the CURRENT time when the app loads, not a
// stale time from when the module was first imported.
const initialChecks: SafetyCheck[] = (() => {
    const now = new Date();
    const inNMinutes = (n: number) => new Date(now.getTime() + n * 60 * 1000).toISOString();

    return [
      { id: 'chk1', residents: [mockResidents[21]], status: 'pending', dueDate: inNMinutes(-3.5), walkingOrderIndex: 1, specialClassification: { type: 'SW', details: 'High-risk Sith Lord. Approach with caution.', residentId: 'res22' } },
      { id: 'chk2', residents: [mockResidents[1]], status: 'pending', dueDate: inNMinutes(1.5), walkingOrderIndex: 3 },
      { id: 'chk6', residents: [mockResidents[5], mockResidents[6], mockResidents[7]], status: 'pending', dueDate: inNMinutes(8), walkingOrderIndex: 2, specialClassification: { type: 'MA', details: 'Medication Alert: Swallow potion by 8 PM.', residentId: 'res7' } },
      { id: 'chk3', residents: [mockResidents[13], mockResidents[14], mockResidents[15]], status: 'pending', dueDate: inNMinutes(29.5), walkingOrderIndex: 4 },
      { id: 'chk4', residents: [mockResidents[3], mockResidents[0]], status: 'pending', dueDate: inNMinutes(89.5), walkingOrderIndex: 5 },
      { id: 'chk7', residents: [mockResidents[11]], status: 'pending', dueDate: inNMinutes(-180), walkingOrderIndex: 6 },
      { id: 'chk5', residents: [mockResidents[4]], status: 'complete', dueDate: inNMinutes(-120), walkingOrderIndex: 11, lastChecked: inNMinutes(-125), completionStatus: 'Awake', notes: 'Discussing galactic politics.', specialClassification: { type: 'SR', details: 'Medical Alert', residentId: 'res5' } },
      { id: 'chk8', residents: [mockResidents[12]], status: 'pending', dueDate: inNMinutes(45), walkingOrderIndex: 7 },
      { id: 'chk9', residents: [mockResidents[18], mockResidents[22]], status: 'pending', dueDate: inNMinutes(62), walkingOrderIndex: 8, specialClassification: { type: 'FA', details: 'Fall Risk Assessment Required', residentId: 'res19' } },
      { id: 'chk10', residents: [mockResidents[16]], status: 'pending', dueDate: inNMinutes(120), walkingOrderIndex: 9 },
      { id: 'chk11', residents: [mockResidents[9], mockResidents[10]], status: 'pending', dueDate: inNMinutes(150), walkingOrderIndex: 10 },
      { id: 'chk12', residents: [mockResidents[19]], status: 'pending', dueDate: inNMinutes(-240), walkingOrderIndex: 12 }, 
      { id: 'chk13', residents: [mockResidents[20]], status: 'pending', dueDate: inNMinutes(200), walkingOrderIndex: 13 },
      { id: 'chk14', residents: [mockResidents[17]], status: 'complete', dueDate: inNMinutes(-300), lastChecked: inNMinutes(-301), completionStatus: 'Sleeping', walkingOrderIndex: 14 },
      { id: 'chk15', residents: [mockResidents[23]], status: 'pending', dueDate: inNMinutes(240), walkingOrderIndex: 15 },
    ];
})();

// This is the "source of truth" atom for the raw check data.
// It is made writable to allow the reducer-style appDataAtom to update it.
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
  | { type: 'CHECK_COMPLETE'; payload: CheckCompletePayload }
  | { type: 'CHECK_SUPPLEMENTAL_ADD'; payload: SupplementalCheckPayload };

// This atom provides a reducer-like interface for mutating the app's core data.
const appDataAtom = atom<AppData, [AppAction], void>(
  (get) => ({ checks: get(baseChecksAtom) }),
  (get, set, action) => {
    const currentChecks = get(baseChecksAtom);
    const nextState = produce({ checks: currentChecks }, (draft: Draft<AppData>) => {
      switch (action.type) {
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
        case 'CHECK_SUPPLEMENTAL_ADD': {
          const { roomId, notes, statuses } = action.payload;
          const roomLocation = mockResidents.find(r => r.id === roomId)?.location;
          const residentsInRoom = mockResidents.filter(r => r.location === roomLocation);

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

// This is the public-facing atom used by components to dispatch actions.
export const dispatchActionAtom = atom(null, (_get, set, action: AppAction) => {
    set(appDataAtom, action);
});


// =================================================================
//                Derived, Read-Only Atoms for UI
// =================================================================

// This derived atom calculates the real-time status of each check.
// It depends on the low-frequency `minuteTickerAtom` to prevent performance issues.
export const safetyChecksAtom = atom<SafetyCheck[]>((get) => {
  const { checks } = get(appDataAtom);
  const timeNow = get(minuteTickerAtom);
  const twoMinutesFromNow = timeNow + 2 * 60 * 1000;
  const completing = get(completingChecksAtom);

  return checks
    .filter(check => !completing.has(check.id))
    .map(check => {
      if (check.status === 'complete' || check.status === 'supplemental') {
        return check;
      }
      const dueTime = new Date(check.dueDate).getTime();

      let newStatus: SafetyCheckStatus = 'pending';
      if (dueTime < timeNow) {
        newStatus = 'late';
      } else if (dueTime < twoMinutesFromNow) {
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

const statusOrder: Record<SafetyCheckStatus, number> = {
  late: 0,
  'due-soon': 1,
  pending: 2,
  missed: 3,
  complete: 4,
  supplemental: 5,
};

// This derived atom sorts checks for the "Time View".
export const timeSortedChecksAtom = atom((get) => {
  const checks = get(safetyChecksAtom);
  const sorted = [...checks];
  sorted.sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  return sorted;
});

// This derived atom sorts checks for the "Route View".
export const routeSortedChecksAtom = atom((get) => {
  const checks = get(safetyChecksAtom);
  const actionable = checks.filter(c => c.status !== 'complete' && c.status !== 'supplemental');
  const nonActionable = checks.filter(c => c.status === 'complete' || c.status === 'supplemental');

  actionable.sort((a, b) => a.walkingOrderIndex - b.walkingOrderIndex);
  nonActionable.sort((a, b) => {
    const timeB = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
    const timeA = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
    return timeB - timeA;
  });

  return [...actionable, ...nonActionable];
});

// This derived atom provides summary counts for the Status Overview bar.
export const statusCountsAtom = atom((get) => {
  const checks = get(safetyChecksAtom);
  const counts = {
    late: 0,
    dueSoon: 0,
    due: 0,
    completed: 0,
  };
  for (const check of checks) {
    switch (check.status) {
      case 'late':
        counts.late++;
        break;
      case 'due-soon':
        counts.dueSoon++;
        break;
      case 'pending':
        counts.due++;
        break;
      case 'complete':
        counts.completed++;
        break;
    }
  }
  return counts;
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
  const { checks } = get(appDataAtom);
  const filter = get(historyFilterAtom);

  let historicalChecks = checks.filter(c => c.status !== 'pending' && c.status !== 'due-soon');

  if (filter === 'lateOrMissed') {
    historicalChecks = historicalChecks.filter(c => c.status === 'late' || c.status === 'missed');
  } else if (filter === 'supplemental') {
    historicalChecks = historicalChecks.filter(c => c.status === 'supplemental');
  }

  historicalChecks.sort((a, b) => {
    const dateA = new Date(a.lastChecked || a.dueDate).getTime();
    const dateB = new Date(b.lastChecked || b.dueDate).getTime();
    return dateB - dateA;
  });

  if (historicalChecks.length === 0) {
    return { groupCounts: [], groups: [], flattenedChecks: [] };
  }

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