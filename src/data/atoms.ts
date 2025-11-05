// src/data/atoms.ts
import { atom } from 'jotai';
import { SafetyCheck } from '../types';

// =================================================================
//                         App State
// =================================================================

// Defines the main views or "tabs" of the PWA
export type AppView = 'dashboard' | 'checks' | 'history' | 'settings';

// The single source of truth for which view is currently active
export const activeViewAtom = atom<AppView>('dashboard');

// Defines the four high-level layout patterns for the app shell
export type LayoutMode = 'classic' | 'notched' | 'overlapping' | 'minimalist';

// The single source of truth for which layout is currently active
export const layoutModeAtom = atom<LayoutMode>('classic');

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

export type SortMode = 'dueTime' | 'walkingOrder';
export const sortModeAtom = atom<SortMode>('dueTime');

export type ScheduleLayout = 'list' | 'card' | 'priority';
export const scheduleLayoutAtom = atom<ScheduleLayout>('list');

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
      residentName: string;
      specialClassification?: SafetyCheck['specialClassification'];
    }
  | {
      // For creating a new, unscheduled supplemental check
      view: 'form';
      type: 'supplemental';
      roomId: string;
      roomName: string;
      residentName: string;
    };


export const workflowStateAtom = atom<WorkflowState>({ view: 'none' });

// Atom to control the visibility of the Admin "Write NFC" modal
export const isWriteNfcModalOpenAtom = atom(false);

// Atom to control the visibility of the new "Select Room" modal for supplemental checks
export const isSelectRoomModalOpenAtom = atom(false);

// NEW: Atom to control the visibility of the side menu in MinimalistLayout
export const isSideMenuOpenAtom = atom(false);