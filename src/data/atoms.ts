// src/data/atoms.ts
import { atom } from 'jotai';
import { Resident, SafetyCheck } from '../types';

// =================================================================
//                         App State
// =================================================================

// Defines the main views or "tabs" of the PWA
export type AppView = 'dashboard' | 'checks' | 'history' | 'settings';

// The single source of truth for which view is currently active
export const activeViewAtom = atom<AppView>('dashboard');

// =================================================================
//                      Session State
// =================================================================

interface Session {
  isAuthenticated: boolean;
  userName: string | null;
}

export const sessionAtom = atom<Session>({
  isAuthenticated: false,
  userName: null,
});

// =================================================================
//                   Schedule View State
// =================================================================

// Defines the two primary sort/view modes for the main dashboard schedule.
export type ScheduleView = 'time' | 'route';
export const scheduleViewAtom = atom<ScheduleView>('time');

// Atom for the "live" timer, updated by a single global interval
export const currentTimeAtom = atom(new Date());

// =================================================================
//                       History View State
// =================================================================

export type HistoryFilter = 'all' | 'lateOrMissed' | 'supplemental';
export const historyFilterAtom = atom<HistoryFilter>('all');


// =================================================================
//                 Core Scan & Check Workflow State
// =================================================================

export type WorkflowState =
  | { view: 'none' }
  | { view: 'scanning'; isManualSelectionOpen: boolean }
  | {
      // For completing an existing, scheduled check
      view: 'form';
      type: 'scheduled';
      checkId: string;
      roomName: string;
      residents: Resident[]; // MODIFIED: Pass the full resident array
      specialClassification?: SafetyCheck['specialClassification'];
    }
  | {
      // For creating a new, unscheduled supplemental check
      view: 'form';
      type: 'supplemental';
      roomId: string;
      roomName: string;
      residents: Resident[]; // MODIFIED: Pass the full resident array
    };


export const workflowStateAtom = atom<WorkflowState>({ view: 'none' });

// =================================================================
//                  Global UI & Layout State
// =================================================================

// Atom to control the visibility of the Admin "Write NFC" modal
export const isWriteNfcModalOpenAtom = atom(false);

// Atom to control the visibility of the new "Select Room" modal for supplemental checks
export const isSelectRoomModalOpenAtom = atom(false);

// Atom to control the visibility of the side menu
export const isSideMenuOpenAtom = atom(false);