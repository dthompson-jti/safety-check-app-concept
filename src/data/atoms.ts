// src/data/atoms.ts
import { atom } from 'jotai';

// =================================================================
//                         App State
// =================================================================

// Defines the main views or "tabs" of the PWA
export type AppView = 'dashboard' | 'checks' | 'history' | 'settings';

// The single source of truth for which view is currently active
export const activeViewAtom = atom<AppView>('dashboard');

// Example UI state atom for managing a modal's visibility
export const isSomeModalOpenAtom = atom(false);