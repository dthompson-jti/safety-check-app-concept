// src/data/atoms.ts
import { atom } from 'jotai';
import { Resident, SafetyCheck, ScheduleFilter, HistoryFilter, SpecialClassification } from '../types';

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

export const isContextSelectionRequiredAtom = atom(true);
export const isContextSelectionModalOpenAtom = atom(false);
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

export const recentlyCompletedCheckIdAtom = atom<string | null>(null);
export const completingChecksAtom = atom(new Set<string>());

export const isScheduleSearchActiveAtom = atom(false);
export const scheduleSearchQueryAtom = atom('');
export const isScheduleLoadingAtom = atom(true);
export const scheduleFilterAtom = atom<ScheduleFilter>('all');
export const isScheduleRefreshingAtom = atom(false);


// =================================================================
//                       History View State
// =================================================================

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
      /**
       * DEFINITIVE FIX: Renamed from `specialClassification` to `specialClassifications`
       * to match the updated `SafetyCheck` type in `types.ts`.
       */
      specialClassifications?: SpecialClassification[];
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
  isSlowLoadEnabled: boolean;
}
export const appConfigAtom = atom<AppConfig>({
  scanMode: 'qr',
  hapticsEnabled: true,
  scheduleViewMode: 'card',
  isSlowLoadEnabled: false,
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
  set(appViewAtom, 'dashboardTime');
  set(workflowStateAtom, { view: 'none' });
  set(completingChecksAtom, new Set());
});