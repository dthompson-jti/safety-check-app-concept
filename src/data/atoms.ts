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

export const currentTimeAtom = atom(new Date());

export const isStatusOverviewOpenAtom = atom(false);

// This atom now ONLY triggers the one-time pulse animation.
export const recentlyCompletedCheckIdAtom = atom<string | null>(null);

// This atom now tracks checks that have been completed and are in the process of their exit animation.
// It prevents them from being rendered in the list during their exit.
// DEFINITIVE FIX: Initialize the Set with the correct type argument to resolve the 'unknown' error.
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