// src/data/atoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Resident, ScheduleFilter, HistoryFilter, SpecialClassification, NfcScanState } from '../types';

// =================================================================
//                      Global Time State (Heartbeat)
// =================================================================

export const fastTickerAtom = atom<number>(Date.now());
export const throttledTickerAtom = atom<number>(Date.now()); // 10fps (For Text Timers)
export const slowTickerAtom = atom<number>(Date.now());

// =================================================================
//                         App State
// =================================================================

export type AppView = 'sideMenu' | 'dashboardTime';
export const appViewAtom = atomWithStorage<AppView>('sc_view', 'dashboardTime');

// =================================================================
//                      Session State
// =================================================================

import type { User } from './users';

interface Session {
  isAuthenticated: boolean;
  user: User | null;
}

export const sessionAtom = atom<Session>({
  isAuthenticated: false,
  user: null,
});

// User preferences (avatar color overrides)
interface UserPreferences {
  [username: string]: {
    avatarHue?: number; // Custom hue override (0-360)
  };
}

export const userPreferencesAtom = atomWithStorage<UserPreferences>('sc_user_prefs', {});

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
    method: 'scan' | 'manual';
    checkId: string;
    roomName: string;
    residents: Resident[];
    specialClassifications?: SpecialClassification[];
  }
  | {
    view: 'form';
    type: 'supplemental';
    roomId: string;
    roomName: string;
    residents: Resident[];
  }
  | { view: 'provisioning' };

export const workflowStateAtom = atom<WorkflowState>({ view: 'none' });

// =================================================================
//                    NFC Scan Activation State
// =================================================================

/** Current NFC scan state (idle → scanning → success → idle) */
export const nfcScanStateAtom = atom<NfcScanState>('idle');

/** Timestamp when scan started (for countdown calculation) */
export const nfcScanStartTimeAtom = atom<number | null>(null);


// =================================================================
//                  Global UI & Layout State
// =================================================================

export const isManualCheckModalOpenAtom = atom(false);
export const isWriteNfcModalOpenAtom = atom(
  (get) => get(workflowStateAtom).view === 'provisioning'
);
export const isSettingsModalOpenAtom = atom(false);
export const isDevToolsModalOpenAtom = atom(false);
export const isRingAnimationTestOpenAtom = atom(false);
export const isFutureIdeasModalOpenAtom = atom(false);
export const isUserSettingsModalOpenAtom = atom(false); // Future Idea: Enhanced Avatar
export const manualSearchQueryAtom = atom('');
export const isGlobalSearchActiveAtom = atom(false);
export const isOfflineToggleVisibleAtom = atomWithStorage('sc_feat_offline_toggle', false);
export const nfcProvisioningGroupIdAtom = atom<string | null>(null);
export const nfcProvisioningUnitIdAtom = atom<string | null>(null);

// =================================================================
//                App Configuration & Dev Tools State
// =================================================================

export type ConnectionStatus = 'online' | 'offline' | 'syncing' | 'connected';
const _connectionStatusAtom = atom<ConnectionStatus>('online');
export const offlineTimestampAtom = atom<number | null>(null);

export interface HardwareSimulation {
  cameraFails: boolean;
  nfcFails: boolean;
  nfcBlocked: boolean;
  nfcTurnedOff: boolean;
}
export const hardwareSimulationAtom = atom<HardwareSimulation>({
  cameraFails: false,
  nfcFails: false,
  nfcBlocked: false,
  nfcTurnedOff: false,
});

export const connectionStatusAtom = atom(
  (get) => get(_connectionStatusAtom),
  (get, set, newStatus: ConnectionStatus) => {
    const currentStatus = get(_connectionStatusAtom);
    if (newStatus === 'offline' && currentStatus !== 'offline') {
      set(offlineTimestampAtom, Date.now());
    } else if (newStatus === 'online') {
      set(offlineTimestampAtom, null);
    }
    set(_connectionStatusAtom, newStatus);
  }
);

export type HapticSuccessPattern = 'light' | 'medium' | 'heavy';
export type HapticErrorPattern = 'simple' | 'double' | 'grind' | 'stutter';

interface AppConfig {
  scanMode: 'qr' | 'nfc';
  hapticsEnabled: boolean;
  audioEnabled: boolean;
  hapticPatternSuccess: HapticSuccessPattern;
  hapticPatternError: HapticErrorPattern;
  isSlowLoadEnabled: boolean;
  isCheckTypeEnabled: boolean;
  markMultipleEnabled: boolean;
  simpleSubmitEnabled: boolean;
  showStatusIndicators: boolean;
  residentStatusSet: 'set-2' | 'set-3' | 'set-4' | 'set-5' | 'set-6' | 'set-7';
  markMultipleLayout: 'row' | 'column' | 'grid';
  // NFC Scan Activation Config
  nfcScanTimeout: number; // ms
  nfcTimeoutEnabled: boolean; // if false, scan stays active indefinitely
  nfcShowCountdown: boolean;
  headerStyle: 'secondary' | 'tertiary' | 'quaternary';
  showEnvironmentName: boolean;
  environmentName: string;
  showChromeShadow: boolean;
}

export const appConfigAtom = atomWithStorage<AppConfig>('sc_config', {
  scanMode: 'qr',
  hapticsEnabled: true,
  audioEnabled: true,
  hapticPatternSuccess: 'heavy',
  hapticPatternError: 'double',
  isSlowLoadEnabled: false,
  isCheckTypeEnabled: false,
  markMultipleEnabled: false,
  simpleSubmitEnabled: false,
  showStatusIndicators: false,
  residentStatusSet: 'set-3',
  markMultipleLayout: 'row',
  // NFC Scan Activation Defaults
  nfcScanTimeout: 15000,
  nfcTimeoutEnabled: true,
  nfcShowCountdown: true,
  headerStyle: 'secondary',
  showEnvironmentName: false,
  environmentName: 'https://vicbc-qa-symphony.logan-symphony.com',
  showChromeShadow: true,
});

// =================================================================
//                       Global Actions
// =================================================================

export const logoutAtom = atom(null, (_get, set) => {
  set(sessionAtom, { isAuthenticated: false, user: null });
  set(isContextSelectionRequiredAtom, true);
  set(selectedFacilityGroupAtom, null);
  set(selectedFacilityUnitAtom, null);
  set(appViewAtom, 'dashboardTime');
  set(workflowStateAtom, { view: 'none' });
  set(completingChecksAtom, new Set());
});