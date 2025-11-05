// src/data/appDataAtoms.ts
import { atom } from 'jotai';
import { produce, Draft } from 'immer';
import { SafetyCheck, Resident, SafetyCheckStatus } from '../types';
import { sortModeAtom, currentTimeAtom } from './atoms';

// =================================================================
//                 Mock Data Store
// =================================================================

const mockResidents: Resident[] = [
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
  // Overdue
  { id: 'chk1', resident: mockResidents[0], status: 'overdue', dueDate: inNMinutes(-15), walkingOrderIndex: 1, specialClassification: { type: 'SR', details: 'Fall Risk' } },
  { id: 'chk2', resident: mockResidents[1], status: 'overdue', dueDate: inNMinutes(-5), walkingOrderIndex: 2 },
  // Due Soon
  { id: 'chk3', resident: mockResidents[2], status: 'due-soon', dueDate: inNMinutes(30), walkingOrderIndex: 3 },
  { id: 'chk4', resident: mockResidents[3], status: 'due-soon', dueDate: inNMinutes(90), walkingOrderIndex: 4 },
  // Upcoming
  { id: 'chk5', resident: mockResidents[4], status: 'upcoming', dueDate: inNMinutes(150), walkingOrderIndex: 5, specialClassification: { type: 'SR', details: 'Medical Alert' } },
  { id: 'chk6', resident: mockResidents[5], status: 'upcoming', dueDate: inNMinutes(180), walkingOrderIndex: 6 },
  { id: 'chk7', resident: mockResidents[6], status: 'upcoming', dueDate: inNMinutes(240), walkingOrderIndex: 7 },
  // Completed
  { id: 'chk8', resident: mockResidents[7], status: 'complete', dueDate: inNMinutes(-120), walkingOrderIndex: 0 },
  { id: 'chk9', resident: mockResidents[8], status: 'upcoming', dueDate: inNMinutes(300), walkingOrderIndex: 8 },
  { id: 'chk10', resident: mockResidents[9], status: 'upcoming', dueDate: inNMinutes(360), walkingOrderIndex: 9 },
];

// =================================================================
//                Core Application Data & Reducer
// =================================================================

interface AppData {
  checks: SafetyCheck[];
}

export type AppAction =
  | { type: 'CHECK_UPDATE_STATUS'; payload: { id: string; status: SafetyCheckStatus } };

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
  const twoHoursFromNow = timeNow + 2 * 60 * 60 * 1000;

  // Update status based on current time
  return checks.map(check => {
    if (check.status === 'complete') {
      return check;
    }
    const dueTime = new Date(check.dueDate).getTime();
    let newStatus: SafetyCheckStatus = 'upcoming';
    if (dueTime < timeNow) {
      newStatus = 'overdue';
    } else if (dueTime < twoHoursFromNow) {
      newStatus = 'due-soon';
    }
    return { ...check, status: newStatus };
  });
});

export const sortedChecksAtom = atom((get) => {
  const checks = get(safetyChecksAtom);
  const mode = get(sortModeAtom);
  const sorted = [...checks]; // Create a mutable copy

  if (mode === 'dueTime') {
    // For "dueTime", we want incomplete checks first, then completed checks last
    sorted.sort((a, b) => {
      if (a.status === 'complete' && b.status !== 'complete') return 1;
      if (a.status !== 'complete' && b.status === 'complete') return -1;
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
    overdue: [] as SafetyCheck[],
    'due-soon': [] as SafetyCheck[],
    upcoming: [] as SafetyCheck[],
    complete: [] as SafetyCheck[],
  };

  for (const check of checks) {
    if (groups[check.status]) {
      groups[check.status].push(check);
    }
  }
  return groups;
});