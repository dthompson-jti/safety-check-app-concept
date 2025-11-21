// src/data/atoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Resident, ScheduleFilter, HistoryFilter, SpecialClassification } from '../types';

// =================================================================
//                      Global Time State (Heartbeat)
// =================================================================

export const fastTickerAtom = atom<number>(Date.now());
export const slowTickerAtom = atom<number>(Date.now());

// =================================================================
//                         App State
// =================================================================

export type AppView = 'sideMenu' | 'dashboardTime' | 'dashboardRoute';
export const appViewAtom = atomWithStorage<AppView>('sc_view', 'dashboardTime');

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
//                  Global UI & Layout State
// =================================================================

export const isManualCheckModalOpenAtom = atom(false);
export const isWriteNfcModalOpenAtom = atom(
  (get) => get(workflowStateAtom).view === 'provisioning'
);
export const isSettingsModalOpenAtom = atom(false);
export const isDevToolsModalOpenAtom = atom(false);
export const manualSearchQueryAtom = atom('');
export const isGlobalSearchActiveAtom = atom(false);
export const nfcProvisioningGroupIdAtom = atom<string | null>(null);
export const nfcProvisioningUnitIdAtom = atom<string | null>(null);

// =================================================================
//                App Configuration & Dev Tools State
// =================================================================

export type ConnectionStatus = 'online' | 'offline' | 'syncing';
const _connectionStatusAtom = atom<ConnectionStatus>('online');
export const offlineTimestampAtom = atom<number | null>(null);

export interface HardwareSimulation {
  cameraFails: boolean;
  nfcFails: boolean;
}
export const hardwareSimulationAtom = atom<HardwareSimulation>({
  cameraFails: false,
  nfcFails: false,
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

interface AppConfig {
  scanMode: 'qr' | 'nfc';
  hapticsEnabled: boolean;
  audioEnabled: boolean; // NEW: Decoupled audio setting
  isSlowLoadEnabled: boolean;
  isCheckTypeEnabled: boolean;
  manualConfirmationEnabled: boolean;
  markMultipleEnabled: boolean;
  simpleSubmitEnabled: boolean;
  showStatusIndicators: boolean;
}

export const appConfigAtom = atomWithStorage<AppConfig>('sc_config', {
  scanMode: 'qr',
  hapticsEnabled: true,
  audioEnabled: true, // Default to true
  isSlowLoadEnabled: false,
  isCheckTypeEnabled: false,
  manualConfirmationEnabled: true,
  markMultipleEnabled: false,
  simpleSubmitEnabled: false,
  showStatusIndicators: false,
});

// =================================================================
//                       Global Actions
// =================================================================

export const logoutAtom = atom(null, (_get, set) => {
  set(sessionAtom, { isAuthenticated: false, userName: null });
  set(isContextSelectionRequiredAtom, true);
  set(selectedFacilityGroupAtom, null);
  set(selectedFacilityUnitAtom, null);
  set(appViewAtom, 'dashboardTime');
  set(workflowStateAtom, { view: 'none' });
  set(completingChecksAtom, new Set());
});