// src/data/nfcAtoms.ts
import { atom } from 'jotai';
import { facilityData, FacilityUnit } from './mock/facilityData';
import { selectedFacilityUnitAtom } from './atoms';

// =================================================================
//                      Types & Configuration
// =================================================================

export type NfcError = { code: 'WRITE_FAILED'; message: string } | { code: 'TAG_LOCKED'; message: string };

export type NfcWorkflowState =
  | { status: 'idle' }
  | { status: 'selecting' }
  | { status: 'writing'; roomId: string; roomName: string }
  | { status: 'success'; roomId: string; roomName: string }
  | { status: 'error'; roomId: string; roomName: string; error: NfcError };

export type NfcSimulationMode = 'forceSuccess' | 'forceErrorWriteFailed' | 'forceErrorTagLocked' | 'random';

// =================================================================
//                         Core State Atoms
// =================================================================

export const nfcWorkflowStateAtom = atom<NfcWorkflowState>({ status: 'idle' });
export const nfcSimulationAtom = atom<NfcSimulationMode>('random');

/**
 * Tracks rooms that have been successfully provisioned within the current session.
 * This is reset when the main modal is closed.
 */
// DEFINITIVE FIX: Explicitly type the empty Set to `new Set<string>()`.
// This resolves the mismatch where TypeScript inferred `Set<unknown>`.
export const provisionedRoomIdsAtom = atom<Set<string>>(new Set<string>());

// =================================================================
//          Progressive Disclosure Search State & Logic
// =================================================================

export const nfcSearchQueryAtom = atom('');
export const isGlobalNfcSearchActiveAtom = atom(false);

/** A flattened, searchable list of all unique rooms from the facility data. */
const allRoomsAtom = atom<FacilityUnit[]>(() => {
  // In a real app, rooms would be a separate entity. Here, we treat each "unit" as a room.
  const allUnits = facilityData.flatMap(group => group.units);
  return allUnits.map(unit => ({ id: unit.id, name: unit.name }));
});

const filterRoomsByQuery = (rooms: FacilityUnit[], query: string) => {
  if (!query) return rooms;
  const lowerCaseQuery = query.toLowerCase();
  return rooms.filter(room => room.name.toLowerCase().includes(lowerCaseQuery));
};

export const contextualNfcSearchResultsAtom = atom((get) => {
  const query = get(nfcSearchQueryAtom);
  const selectedUnitId = get(selectedFacilityUnitAtom);
  
  if (!selectedUnitId) return [];

  // This is a simplified context filter for the demo.
  // It finds the group for the current unit and shows all rooms in that group.
  const currentGroup = facilityData.find(group => group.units.some(u => u.id === selectedUnitId));
  if (!currentGroup) return [];

  const contextualRooms = currentGroup.units;
  return filterRoomsByQuery(contextualRooms, query);
});

export const globalNfcSearchResultsAtom = atom((get) => {
  const query = get(nfcSearchQueryAtom);
  const allRooms = get(allRoomsAtom);
  const results = filterRoomsByQuery(allRooms, query);
  return { results, count: results.length };
});

export const nfcRoomSearchResultsAtom = atom((get) => {
  const query = get(nfcSearchQueryAtom);
  if (!query) {
    return get(contextualNfcSearchResultsAtom);
  }

  const contextualResults = get(contextualNfcSearchResultsAtom);
  if (contextualResults.length > 0) {
    return contextualResults;
  }

  if (get(isGlobalNfcSearchActiveAtom)) {
    return get(globalNfcSearchResultsAtom).results;
  }
  
  return []; // Return empty if contextual search fails and global isn't active
});