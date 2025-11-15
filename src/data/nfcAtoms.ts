// src/data/nfcAtoms.ts
import { atom } from 'jotai';
import { nfcProvisioningGroupIdAtom, nfcProvisioningUnitIdAtom } from './atoms';
import { mockResidents } from './mock/residentData';
import { getFacilityContextForLocation } from './mock/facilityUtils';

// =================================================================
//                      Types & Configuration
// =================================================================

export type NfcError = { code: 'WRITE_FAILED'; message: string } | { code: 'TAG_LOCKED'; message: string };

export type NfcWorkflowState =
  | { status: 'idle' }
  | { status: 'selecting' }
  // DEFINITIVE FIX: Add the new 'ready' state to the type definition.
  | { status: 'ready'; roomId: string; roomName: string }
  | { status: 'writing'; roomId: string; roomName: string }
  | { status: 'success'; roomId: string; roomName: string }
  | { status: 'error'; roomId: string; roomName: string; error: NfcError };

export type NfcSimulationMode = 'forceSuccess' | 'forceErrorWriteFailed' | 'forceErrorTagLocked' | 'random';

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
//        Provisioning Modal - Local Context & Search State
// =================================================================

export { nfcProvisioningGroupIdAtom, nfcProvisioningUnitIdAtom };

export const nfcSearchQueryAtom = atom('');

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

// This atom now provides the final list of rooms for the provisioning modal's UI.
export const nfcRoomSearchResultsAtom = atom((get) => {
  const query = get(nfcSearchQueryAtom);
  const allRooms = get(allRoomsAtom);
  const selectedUnitId = get(nfcProvisioningUnitIdAtom);
  const selectedGroupId = get(nfcProvisioningGroupIdAtom);

  if (!selectedUnitId || !selectedGroupId) return [];

  const contextualRooms = allRooms.filter(room => {
    const context = getFacilityContextForLocation(room.name);
    return context?.groupId === selectedGroupId && context?.unitId === selectedUnitId;
  });

  return filterRoomsByQuery(contextualRooms, query);
});