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
//                   Schedule View State
// =================================================================

// This atom is for high-frequency updates, e.g., if a global clock UI were needed.
// Components requiring smooth sub-second timers (like useCountdown) should use
// their own internal `requestAnimationFrame` loop for performance.
export const currentTimeAtom = atom(new Date());

// DEFINITIVE FIX: Create a "ticker" atom that only updates once per minute.
// Derived atoms for business logic (like check status) should depend on this
// to prevent excessive re-calculations and re-renders.
export const minuteTickerAtom = atom((get) => {
  const now = get(currentTimeAtom);
  // Return a value that only changes when the minute changes.
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes()
  ).getTime();
});

export const isStatusOverviewOpenAtom = atom(false);

// This atom now ONLY triggers the one-time pulse animation.
export const recentlyCompletedCheckIdAtom = atom<string | null>(null);

// This atom tracks checks that have been completed and are in the process of their exit animation.
// It prevents them from being rendered in the list during their exit.
// NOTE: This Set should be reset to `new Set()` as part of the user logout/session-end workflow
// to prevent stale IDs from persisting between sessions.
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

export const isWriteNfcModalOpenAtom = atom(false);
export const isSelectRoomModalOpenAtom = atom(false);
export const isHistoryModalOpenAtom = atom(false);
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