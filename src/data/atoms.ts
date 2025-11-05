// src/data/atoms.ts
import { atom } from 'jotai';

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