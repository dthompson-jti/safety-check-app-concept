// src/data/layoutAtoms.ts
import { atom } from 'jotai';

// =================================================================
//                      Layout Registry
// =================================================================
// This system provides a Single Source of Truth for critical layout dimensions.
// Components report their height here, and the LayoutOrchestrator updates CSS variables.
// This prevents "Layout Thrashing" and infinite loops caused by conflicting ResizeObservers.

export const headerHeightAtom = atom<number>(0);
export const bannerHeightAtom = atom<number>(0);

// Derived atom that sums up the total top displacement
export const totalHeaderHeightAtom = atom((get) => {
    return get(headerHeightAtom) + get(bannerHeightAtom);
});