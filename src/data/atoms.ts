// src/data/atoms.ts
import { atom } from 'jotai';
import { Resident, SafetyCheck } from '../types';

// =================================================================
//                         App State
// =================================================================

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
//                  Context Selection State
// =================================================================

// When true, forces the user to the selection modal immediately after login.
export const isContextSelectionRequiredAtom = atom(true);

// When true, opens the selection modal for a user-initiated context switch.
export const isContextSelectionModalOpenAtom = atom(false);

// Stores the user's selected facility/unit for the session.
export const selectedFacilityGroupAtom = atom<string | null>(null);
export const selectedFacilityUnitAtom = atom<string | null>(null);


// =================================================================
//                   Schedule View State
// =================================================================

export const currentTimeAtom = atom(new Date());

export const minuteTickerAtom = atom((get) => {
  const now = get(currentTimeAtom);
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes()
  ).getTime();
});

export const isStatusOverviewOpenAtom = atom(true);
export const recentlyCompletedCheckIdAtom = atom<string | null>(null);
export const completingChecksAtom = atom(new Set<string>());

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
      targetCheckId?: string;
    }
  | {
      view: 'form';
      type: 'scheduled';
      checkId: string;
      roomName: string;
      residents: Resident[];
      specialClassification?: SafetyCheck['specialClassification'];
    }
  | {
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

export const isManualCheckModalOpenAtom = atom(false);
export const isWriteNfcModalOpenAtom = atom(false);
export const isSettingsModalOpenAtom = atom(false);
export const isDevToolsModalOpenAtom = atom(false);


// =================================================================
//                App Configuration & Dev Tools State
// =================================================================

export type ConnectionStatus = 'online' | 'offline' | 'syncing';
export const connectionStatusAtom = atom<ConnectionStatus>('online');

interface AppConfig {
  scanMode: 'qr' | 'nfc';
  hapticsEnabled: boolean;
  scheduleViewMode: 'card' | 'list';
}
export const appConfigAtom = atom<AppConfig>({
  scanMode: 'qr',
  hapticsEnabled: true,
  scheduleViewMode: 'card',
});

// =================================================================
//                       Global Actions
// =================================================================

/**
 * A write-only atom that centralizes the logout process.
 * It resets all session-specific state to ensure a clean slate for the next login.
 */
export const logoutAtom = atom(null, (_get, set) => {
  set(sessionAtom, { isAuthenticated: false, userName: null });
  set(isContextSelectionRequiredAtom, true);
  set(selectedFacilityGroupAtom, null);
  set(selectedFacilityUnitAtom, null);
  set(appViewAtom, 'dashboardTime'); // Explicitly reset the main view
  set(workflowStateAtom, { view: 'none' }); // Reset any active workflow
  set(completingChecksAtom, new Set()); // Clear any transient animation states
});