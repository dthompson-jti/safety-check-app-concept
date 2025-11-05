// src/data/appDataAtoms.ts
import { atom } from 'jotai';
import { produce, Draft } from 'immer';
import { SafetyCheck, Resident } from '../types';

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
];

const mockChecks: SafetyCheck[] = [
  { id: 'chk1', resident: mockResidents[0], status: 'pending', checkTime: '10:00 PM' },
  { id: 'chk2', resident: mockResidents[1], status: 'pending', checkTime: '10:00 PM' },
  { id: 'chk3', resident: mockResidents[2], status: 'complete', checkTime: '10:00 PM' },
  { id: 'chk4', resident: mockResidents[3], status: 'pending', checkTime: '11:00 PM' },
  { id: 'chk5', resident: mockResidents[4], status: 'failed', checkTime: '11:00 PM' },
  { id: 'chk6', resident: mockResidents[5], status: 'pending', checkTime: '11:00 PM' },
  { id: 'chk7', resident: mockResidents[6], status: 'pending', checkTime: '12:00 AM' },
];


// =================================================================
//                Core Application Data & Reducer
// =================================================================

// 1. DEFINE THE CORE STATE SHAPE
interface AppData {
  checks: SafetyCheck[];
  userName: string;
}

// 2. DEFINE THE ACTION CONTRACT (REDUCER PATTERN)
export type AppAction =
  | { type: 'CHECK_ADD'; payload: { resident: Resident; checkTime: string } }
  | { type: 'CHECK_UPDATE_STATUS'; payload: { id: string; status: SafetyCheck['status'] } }
  | { type: 'CHECK_DELETE'; payload: { id: string } };

// 3. CREATE THE CORE DATA ATOM
const appDataAtom = atom<AppData>({
  checks: mockChecks,
  userName: 'Demo User',
});

// 4. CREATE THE CENTRAL ACTION DISPATCHER (REDUCER)
// This is a write-only atom. UI components will call this to mutate state.
export const dispatchActionAtom = atom(
  null,
  (get, set, action: AppAction) => {
    const nextState = produce(get(appDataAtom), (draft: Draft<AppData>) => {
      switch (action.type) {
        case 'CHECK_ADD': {
          const newCheck: SafetyCheck = {
            id: crypto.randomUUID(),
            resident: action.payload.resident,
            status: 'pending',
            checkTime: action.payload.checkTime,
          };
          draft.checks.push(newCheck);
          break;
        }
        case 'CHECK_UPDATE_STATUS': {
          const check = draft.checks.find(c => c.id === action.payload.id);
          if (check) {
            check.status = action.payload.status;
          }
          break;
        }
        case 'CHECK_DELETE': {
          draft.checks = draft.checks.filter(c => c.id !== action.payload.id);
          break;
        }
      }
    });
    set(appDataAtom, nextState);
  }
);

// 5. CREATE DERIVED, READ-ONLY ATOMS FOR THE UI
// UI components should subscribe to these atoms to read data.
export const safetyChecksAtom = atom<SafetyCheck[]>((get) => get(appDataAtom).checks);
export const userNameAtom = atom<string>((get) => get(appDataAtom).userName);