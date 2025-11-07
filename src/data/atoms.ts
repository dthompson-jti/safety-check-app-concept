// src/data/atoms.ts
import { atom } from 'jotai';
import { Resident, SafetyCheck } from '../types';

// =================================================================
//                         App State
// =================================================================

// DEFINITIVE FIX: This is the new single source of truth for navigation.
// It replaces activeViewAtom.
export type AppView = 'sideMenu' | 'dashboardTime' | 'dashboardRoute' | 'history' | 'settings' | 'checks';
export const appViewAtom = atom<AppView>('dashboardTime');


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
      residents: Resident[];
      specialClassification?: SafetyCheck['specialClassification'];
    }
  | {
      // For creating a new, unscheduled supplemental check
      view: 'form';
      type: 'supplemental';
      roomId: string;
      roomName: string;
      residents: Resident[];
    };


export const workflowStateAtom = atom<WorkflowState>({ view: 'none' });

// =================================================================
//                  Global UI & Layout State
// =================================================================

// Atom to control the visibility of the Admin "Write NFC" modal
export const isWriteNfcModalOpenAtom = atom(false);

// Atom to control the visibility of the new "Select Room" modal for supplemental checks
export const isSelectRoomModalOpenAtom = atom(false);