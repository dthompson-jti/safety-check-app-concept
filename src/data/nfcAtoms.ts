// src/data/nfcAtoms.ts
import { atom } from 'jotai';
import { facilityData } from './mock/facilityData';
import { selectedFacilityGroupAtom, selectedFacilityUnitAtom } from './atoms';
import { mockResidents } from './mock/residentData';
import { getFacilityContextForLocation } from './mock/facilityUtils';

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

// DEFINITIVE FIX: A dedicated type for a provisionable room.
interface Room {
  id: string;
  name: string;
}

// =================================================================
//                         Core State Atoms
// =================================================================

export const nfcWorkflowStateAtom = atom<NfcWorkflowState>({ status: 'idle' });
export const nfcSimulationAtom = atom<NfcSimulationMode>('random');
export const provisionedRoomIdsAtom = atom<Set<string>>(new Set<string>());

// =================================================================
//          Progressive Disclosure Search State & Logic
// =================================================================

export const nfcSearchQueryAtom = atom('');
export const isGlobalNfcSearchActiveAtom = atom(false);

/** 
 * DEFINITIVE FIX: The source of truth for rooms is the unique `location` field 
 * from the residents data. This atom now correctly derives a de-duplicated list of rooms.
 */
const allRoomsAtom = atom<Room[]>(() => {
  const uniqueLocations = [...new Set(mockResidents.map(r => r.location))];
  return uniqueLocations
    .map(location => ({ id: location, name: location }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const filterRoomsByQuery = (rooms: Room[], query: string) => {
  if (!query) return rooms;
  const lowerCaseQuery = query.toLowerCase();
  return rooms.filter(room => room.name.toLowerCase().includes(lowerCaseQuery));
};

export const contextualNfcSearchResultsAtom = atom((get) => {
  const query = get(nfcSearchQueryAtom);
  const allRooms = get(allRoomsAtom);
  const selectedUnitId = get(selectedFacilityUnitAtom);
  const selectedGroupId = get(selectedFacilityGroupAtom);

  if (!selectedUnitId || !selectedGroupId) return [];

  // Filter all rooms to only those belonging to the current facility context.
  const contextualRooms = allRooms.filter(room => {
    const context = getFacilityContextForLocation(room.name);
    return context?.groupId === selectedGroupId && context?.unitId === selectedUnitId;
  });

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
  
  return [];
});