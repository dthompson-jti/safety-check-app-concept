// src/features/Overlays/WriteNfcTagModal.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Virtuoso } from 'react-virtuoso';
import {
  nfcWorkflowStateAtom,
  nfcSimulationAtom,
  provisionedRoomIdsAtom,
  nfcSearchQueryAtom,
  isGlobalNfcSearchActiveAtom,
  nfcRoomSearchResultsAtom,
  contextualNfcSearchResultsAtom,
  globalNfcSearchResultsAtom,
  NfcError,
} from '../../data/nfcAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { isWriteNfcModalOpenAtom } from '../../data/atoms';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { SearchInput } from '../../components/SearchInput';
import { EmptyStateMessage } from '../../components/EmptyStateMessage';
import { NfcWritingSheet } from './NfcWritingSheet';
import { NfcRoomListItem } from './NfcRoomListItem';
import styles from './WriteNfcTagModal.module.css';

const errorMessages: Record<NfcError['code'], string> = {
  WRITE_FAILED: 'A network error prevented writing the tag.',
  TAG_LOCKED: 'This tag is locked and cannot be overwritten.',
};

export const WriteNfcTagModal = () => {
  const isOpen = useAtomValue(isWriteNfcModalOpenAtom);
  const setWorkflowState = useSetAtom(nfcWorkflowStateAtom);
  const simulationMode = useAtomValue(nfcSimulationAtom);
  const addToast = useSetAtom(addToastAtom);
  const setProvisionedIds = useSetAtom(provisionedRoomIdsAtom);

  const [searchQuery, setSearchQuery] = useAtom(nfcSearchQueryAtom);
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useAtom(isGlobalNfcSearchActiveAtom);

  const filteredLocations = useAtomValue(nfcRoomSearchResultsAtom);
  const contextualResults = useAtomValue(contextualNfcSearchResultsAtom);
  const { count: globalResultsCount } = useAtomValue(globalNfcSearchResultsAtom);

  // Effect to reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSearchQuery('');
        setIsGlobalSearchActive(false);
        setProvisionedIds(new Set());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setSearchQuery, setIsGlobalSearchActive, setProvisionedIds]);

  const handleClose = () => {
    setWorkflowState({ status: 'idle' });
  };

  const handleSelectRoom = (roomId: string, roomName: string) => {
    setWorkflowState({ status: 'writing', roomId, roomName });

    // This timeout simulates the NFC hardware interaction
    setTimeout(() => {
      let outcome: 'success' | 'error' = 'success';
      // DEFINITIVE FIX: Explicitly type `errorCode` to match the expected string literal union.
      // This satisfies TypeScript's strict type checking for the state update payload.
      let errorCode: NfcError['code'] = 'WRITE_FAILED';

      if (simulationMode === 'forceSuccess') {
        outcome = 'success';
      } else if (simulationMode === 'forceErrorWriteFailed') {
        outcome = 'error';
        errorCode = 'WRITE_FAILED';
      } else if (simulationMode === 'forceErrorTagLocked') {
        outcome = 'error';
        errorCode = 'TAG_LOCKED';
      } else { // Random
        outcome = Math.random() > 0.2 ? 'success' : 'error';
        errorCode = Math.random() > 0.5 ? 'WRITE_FAILED' : 'TAG_LOCKED';
      }

      if (outcome === 'success') {
        setWorkflowState({ status: 'success', roomId, roomName });
      } else {
        setWorkflowState({
          status: 'error',
          roomId,
          roomName,
          error: { code: errorCode, message: errorMessages[errorCode] },
        });
        addToast({ message: 'Failed to write NFC tag', icon: 'error' });
      }
    }, 1500);
  };

  const showProgressiveDiscovery =
    searchQuery &&
    contextualResults.length === 0 &&
    globalResultsCount > 0 &&
    !isGlobalSearchActive;

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Provision NFC tag">
      <div className={styles.contentWrapper}>
        <div className={styles.searchContainer}>
          <SearchInput
            variant="standalone"
            placeholder="Search for a room..."
            value={searchQuery}
            onChange={setSearchQuery}
            autoFocus
          />
        </div>
        <div className={styles.listContainer}>
          {filteredLocations.length === 0 && searchQuery ? (
            <EmptyStateMessage
              title={
                showProgressiveDiscovery
                  ? `No rooms found for "${searchQuery}" in this unit`
                  : 'No Results Found'
              }
              action={
                showProgressiveDiscovery ? (
                  <Button variant="tertiary" onClick={() => setIsGlobalSearchActive(true)}>
                    <span className="material-symbols-rounded">search</span>
                    Show {globalResultsCount} result{globalResultsCount > 1 ? 's' : ''} in all other units
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Virtuoso
              data={filteredLocations}
              itemContent={(_index, location) => (
                <NfcRoomListItem
                  key={location.id}
                  roomId={location.id}
                  roomName={location.name}
                  onClick={() => handleSelectRoom(location.id, location.name)}
                />
              )}
            />
          )}
        </div>
      </div>
      <NfcWritingSheet />
    </BottomSheet>
  );
};