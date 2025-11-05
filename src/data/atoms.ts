// src/data/atoms.ts
import { atom } from 'jotai';
import { BoundData, SafetyCheck } from '../types';

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
//                      Editor/Modal State
// =================================================================

// Define the shape of requests for data binding and scrolling
interface DataBindingRequest {
  componentId: string;
  currentBinding: BoundData | null;
}
interface ScrollRequest {
  componentId: string;
}

// Strongly-typed atoms for modals and editor interactions
export const isDataBindingModalOpenAtom = atom(false);
export const dataBindingRequestAtom = atom<DataBindingRequest | null>(null);
export const dataBindingResultAtom = atom<{ componentId: string; newBinding: BoundData | null } | null>(null);
export const scrollRequestAtom = atom<ScrollRequest | null>(null);
export const isPropertiesPanelVisibleAtom = atom(false);

// =================================================================
//                 Core Scan & Check Workflow State
// =================================================================

export type WorkflowState =
  | { view: 'none' }
  | { view: 'scanning'; isManualSelectionOpen: boolean }
  | {
      view: 'form';
      checkId: string;
      roomName: string;
      residentName: string;
      specialClassification?: SafetyCheck['specialClassification'];
    };

export const workflowStateAtom = atom<WorkflowState>({ view: 'none' });