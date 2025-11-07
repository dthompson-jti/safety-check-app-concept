// src/data/appDataAtoms.ts
import { atom } from 'jotai';
import { produce, Draft } from 'immer';
import { nanoid } from 'nanoid';
import { SafetyCheck, Resident, SafetyCheckStatus } from '../types';
import { currentTimeAtom, historyFilterAtom } from './atoms';

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
  { id: 'res6', name: 'James Holden', location: 'RM 531' },
  { id: 'res7', name: 'Naomi Nagata', location: 'Room 204' },
  { id: 'res8', name: 'Alex Kamal', location: 'Room 205' },
  { id: 'res9', name: 'Amos Burton', location: 'Room 206' },
  { id: 'res10', name: 'Chrisjen Avasarala', location: 'Room 301' },
  { id: 'res11', name: 'Aria Stark', location: 'RM 531' },
  { id: 'res12', name: 'Dave Thompson', location: 'RM 531' },
  // ENHANCEMENT: Added more residents for data fidelity
  { id: 'res13', name: 'Dr. Evelyn Reed-Jones', location: 'Wing C, Room 304-A' },
  { id: 'res14', name: 'Geralt of Rivia', location: 'Kaer Morhen Suite' },
  { id: 'res15', name: 'Yennefer of Vengerberg', location: 'Kaer Morhen Suite' },
  { id: 'res16', name: 'Ciri Riannon', location: 'Kaer Morhen Suite' },
  { id: 'res17', name: 'John Wick', location: 'Continental NYC' },
  { id: 'res18', name: 'Sarah Connor', location: 'Cyberdyne Annex' },
  { id: 'res19', name: 'Kyle Reese', location: 'Cyberdyne Annex' },
  { id: 'res20', name: 'Ellen Ripley', location: 'LV-426 Colony' },
  { id: 'res21', name: 'Kara "Starbuck" Thrace', location: 'Galactica CIC' },
  { id: 'res22', name: 'William Adama', location: 'Galactica CIC' },
  { id: 'res23', name: 'Laura Roslin', location: 'Colonial One' },
  { id: 'res24', name: 'Gaius Baltar', location: 'Colonial One' },
  { id: 'res25', name: 'Leto Atreides', location: 'Arrakis Palace' },
];

const now = new Date();
const inNMinutes = (n: number) => new Date(now.getTime() + n * 60 * 1000).toISOString();

const mockChecks: SafetyCheck[] = [
  // Late check with special classification
  { id: 'chk1', residents: [mockResidents[0]], status: 'pending', dueDate: inNMinutes(-3.5), walkingOrderIndex: 1, specialClassification: { type: 'SW', details: 'Suicide Watch - High Risk', residentId: 'res1' } },
  // Due soon (within 2 minutes)
  { id: 'chk2', residents: [mockResidents[1]], status: 'pending', dueDate: inNMinutes(1.5), walkingOrderIndex: 3 },
  // Multi-resident check with one classified resident
  { id: 'chk6', residents: [mockResidents[5], mockResidents[10], mockResidents[11]], status: 'pending', dueDate: inNMinutes(8), walkingOrderIndex: 2, specialClassification: { type: 'MA', details: 'Medication Alert: Ensure meds taken by 8 PM.', residentId: 'res11' } },
  // Upcoming
  { id: 'chk3', residents: [mockResidents[2]], status: 'pending', dueDate: inNMinutes(29.5), walkingOrderIndex: 4 },
  { id: 'chk4', residents: [mockResidents[3]], status: 'pending', dueDate: inNMinutes(89.5), walkingOrderIndex: 5 },
  // Missed check (well past due)
  { id: 'chk7', residents: [mockResidents[6]], status: 'pending', dueDate: inNMinutes(-180), walkingOrderIndex: 6 },
  // Completed with special classification
  { id: 'chk5', residents: [mockResidents[4]], status: 'complete', dueDate: inNMinutes(-120), walkingOrderIndex: 11, lastChecked: inNMinutes(-125), completionStatus: 'Awake', notes: 'Resident was watching TV.', specialClassification: { type: 'SR', details: 'Medical Alert', residentId: 'res5' } },
  // ENHANCEMENT: Added more checks for data fidelity
  { id: 'chk8', residents: [mockResidents[12]], status: 'pending', dueDate: inNMinutes(45), walkingOrderIndex: 7 },
  { id: 'chk9', residents: [mockResidents[13], mockResidents[14], mockResidents[15]], status: 'pending', dueDate: inNMinutes(62), walkingOrderIndex: 8, specialClassification: { type: 'FA', details: 'Fall Risk Assessment Required', residentId: 'res14' } },
  { id: 'chk10', residents: [mockResidents[16]], status: 'pending', dueDate: inNMinutes(120), walkingOrderIndex: 9 },
  { id: 'chk11', residents: [mockResidents[17], mockResidents[18]], status: 'pending', dueDate: inNMinutes(150), walkingOrderIndex: 10 },
  { id: 'chk12', residents: [mockResidents[19]], status: 'pending', dueDate: inNMinutes(-240), walkingOrderIndex: 12 }, // Very late
  { id: 'chk13', residents: [mockResidents[20], mockResidents[21]], status: 'pending', dueDate: inNMinutes(200), walkingOrderIndex: 13 },
  { id: 'chk14', residents: [mockResidents[22], mockResidents[23]], status: 'complete', dueDate: inNMinutes(-300), lastChecked: inNMinutes(-301), completionStatus: 'Sleeping', walkingOrderIndex: 14 },
  { id: 'chk15', residents: [mockResidents[24]], status: 'pending', dueDate: inNMinutes(240), walkingOrderIndex: 15 },
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
  statuses: Record<string, string>; // residentId -> status
  completionTime: string;
};

type SupplementalCheckPayload = {
  roomId: string; // This is the resident ID for now in the mock data
  notes: string;
  statuses: Record<string, string>;
};

export type AppAction =
  | { type: 'CHECK_COMPLETE'; payload: CheckCompletePayload }
  | { type: 'CHECK_SUPPLEMENTAL_ADD'; payload: SupplementalCheckPayload };

const appDataAtom = atom<AppData>({
  checks: mockChecks,
});

export const dispatchActionAtom = atom(
  null,
  (_get, set, action: AppAction) => {
    const nextState = produce(_get(appDataAtom), (draft: Draft<AppData>) => {
      switch (action.type) {
        case 'CHECK_COMPLETE': {
          const check = draft.checks.find(c => c.id === action.payload.checkId);
          if (check) {
            check.status = 'complete'; // Simplified status update
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
    set(appDataAtom, nextState);
  }
);

// =================================================================
//                Derived, Read-Only Atoms for UI
// =================================================================

export const safetyChecksAtom = atom<SafetyCheck[]>((get) => {
  const checks = get(appDataAtom).checks;
  const timeNow = get(currentTimeAtom).getTime();
  const twoMinutesFromNow = timeNow + 2 * 60 * 1000;

  return checks.map(check => {
    if (check.status === 'complete' || check.status === 'supplemental') {
      return check;
    }
    const dueTime = new Date(check.dueDate).getTime();
    const updatedCheck = { ...check };

    if (dueTime < timeNow) {
      updatedCheck.status = 'late';
    } else if (dueTime < twoMinutesFromNow) {
      updatedCheck.status = 'due-soon';
    } else {
      updatedCheck.status = 'pending';
    }
    return updatedCheck;
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

// Two separate, stable atoms are created for each sort order.
// This is an architectural choice to prevent the list from re-shuffling
// vertically when the user navigates between the Time and Route views.
// Each view consumes its own stable, pre-sorted list.
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

export const routeSortedChecksAtom = atom((get) => {
  const checks = get(safetyChecksAtom);
  const actionable = checks.filter(c => c.status === 'late' || c.status === 'due-soon' || c.status === 'pending' || c.status === 'missed');
  const nonActionable = checks.filter(c => c.status === 'complete' || c.status === 'supplemental');

  actionable.sort((a, b) => a.walkingOrderIndex - b.walkingOrderIndex);
  nonActionable.sort((a, b) => {
    const timeB = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
    const timeA = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
    return timeB - timeA;
  });

  return [...actionable, ...nonActionable];
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
  const allChecks = get(appDataAtom).checks;
  const filter = get(historyFilterAtom);

  let historicalChecks = allChecks.filter(c => c.status !== 'pending' && c.status !== 'due-soon');

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