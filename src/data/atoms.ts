// src/data/atoms.ts
import { atom } from 'jotai';
import { Resident, SafetyCheck } from '../types';

// =================================================================
//                         App State
// =================================================================

// This is the single source of truth for the application's primary view state.
// It controls which panel is visible in the main carousel.
// 'history' and 'settings' are removed as they are now modals.
export type AppView = 'sideMenu' | 'dashboardTime' | 'dashboardRoute';
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

// A global atom that is updated every second to drive all time-sensitive UI
// elements, such as countdown timers on check cards.
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
  | {
      view: 'scanning';
      isManualSelectionOpen: boolean;
      // When a user clicks a specific check card to start the workflow,
      // its ID is stored here. This allows the scanner's dev tools
      // to simulate scanning the correct, context-aware QR code.
      targetCheckId?: string;
    }
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

// [NEW] Atoms to control the visibility of the new full-screen modals
export const isHistoryModalOpenAtom = atom(false);
export const isSettingsModalOpenAtom = atom(false);
export const isDevToolsModalOpenAtom = atom(false);


// =================================================================
//                App Configuration & Dev Tools State
// =================================================================

// [NEW] Atom for simulated connection status
export type ConnectionStatus = 'online' | 'offline' | 'syncing';
export const connectionStatusAtom = atom<ConnectionStatus>('online');

// [NEW] Atom for global, configurable application settings
interface AppConfig {
  scanMode: 'qr' | 'nfc';
}
export const appConfigAtom = atom<AppConfig>({ scanMode: 'qr' });