// src/data/appDataAtoms.ts
import { atom } from 'jotai';
import { produce, Draft } from 'immer';
import { SafetyCheck } from '../types';

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
  | { type: 'CHECK_ADD'; payload: { name: string } }
  | { type: 'CHECK_UPDATE_STATUS'; payload: { id: string; status: SafetyCheck['status'] } }
  | { type: 'CHECK_DELETE'; payload: { id: string } };

// 3. CREATE THE CORE DATA ATOM
const appDataAtom = atom<AppData>({
  checks: [
    { id: '1', name: 'Fire Extinguisher', status: 'pending', lastChecked: new Date() },
    { id: '2', name: 'First Aid Kit', status: 'pending', lastChecked: new Date() },
  ],
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
            name: action.payload.name,
            status: 'pending',
            lastChecked: new Date(),
          };
          draft.checks.push(newCheck);
          break;
        }
        case 'CHECK_UPDATE_STATUS': {
          const check = draft.checks.find(c => c.id === action.payload.id);
          if (check) {
            check.status = action.payload.status;
            check.lastChecked = new Date();
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