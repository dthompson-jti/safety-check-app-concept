// src/data/atoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Resident, ScheduleFilter, HistoryFilter, SpecialClassification } from '../types';

// =================================================================
//                      Global Time State (Heartbeat)
// =================================================================

/**
 * The High-Frequency Ticker (approx. 100ms).
 * Used for UI components that need smooth sub-second updates (e.g., countdown timers).
 * Components subscribing to this atom will re-render approximately 10 times per second.
 */
export const fastTickerAtom = atom<number>(Date.now());

/**
 * The Low-Frequency Ticker (approx. 1000ms).
 * Used for business logic (status calculations, sorting) to prevent
 * excessive re-calculations of large lists.
 */
export const slowTickerAtom = atom<number>(Date.now());

// =================================================================
//                         App State
// =================================================================

export type AppView = 'sideMenu' | 'dashboardTime' | 'dashboardRoute';

// Persist the user's view preference to local storage
export const appViewAtom = atomWithStorage<AppView>('sc_view', 'dashboardTime');


// =================================================================
//                      Session State
// =================================================================

interface Session {
  isAuthenticated: boolean;
  userName: string | null;
}

// Persist the session so the user stays logged in on reload
export const sessionAtom = atomWithStorage<Session>('sc_session', {
  isAuthenticated: false,
  userName: null,
});

// =================================================================
//                  Context Selection State
// =================================================================

// Context selection is intentionally transient.
// Users must re-confirm their physical location upon app restart/shift start.
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
    /**
     * The method used to initiate the check.
     * 'scan' - from a QR or NFC scan.
     * 'manual' - from tapping a card or using manual selection.
     * This dictates whether attestation is required.
     */
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

// State for the Manual Selection "Progressive Discovery" search feature
export const manualSearchQueryAtom = atom('');
export const isGlobalSearchActiveAtom = atom(false);

export const nfcProvisioningGroupIdAtom = atom<string | null>(null);
export const nfcProvisioningUnitIdAtom = atom<string | null>(null);


// =================================================================
//                App Configuration & Dev Tools State
// =================================================================

export type ConnectionStatus = 'online' | 'offline' | 'syncing';

// Internal atom to hold the raw status. 
// We do NOT persist this. The app should always detect fresh status on boot.
const _connectionStatusAtom = atom<ConnectionStatus>('online');

// Timestamp for when the app went offline (used for the duration timer)
export const offlineTimestampAtom = atom<number | null>(null);

// Hardware Simulation State
export interface HardwareSimulation {
  cameraFails: boolean;
  nfcFails: boolean;
}
export const hardwareSimulationAtom = atom<HardwareSimulation>({
  cameraFails: false,
  nfcFails: false,
});

// Read/Write atom that manages side effects (setting the timestamp)
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
  isSlowLoadEnabled: boolean;
  /** When true, shows the 'Check Type' segmented control on the CheckEntryView. */
  isCheckTypeEnabled: boolean;
  /** Dev Tool: When true, shows the 'I attest...' checkbox on manual checks. */
  manualConfirmationEnabled: boolean;
  /** Dev Tool: When true, shows 'Mark All' buttons on the check form. */
  markMultipleEnabled: boolean;
  /** Dev Tool: When true, skips the completion animation for faster testing. */
  simpleSubmitEnabled: boolean;
}

// Persist app configuration to local storage
export const appConfigAtom = atomWithStorage<AppConfig>('sc_config', {
  scanMode: 'qr',
  hapticsEnabled: true,
  isSlowLoadEnabled: false,
  isCheckTypeEnabled: false,
  manualConfirmationEnabled: true,
  markMultipleEnabled: false,
  simpleSubmitEnabled: false,
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
  // We intentionally do not clear persisted checks on logout to simulate device-level data retention.
});