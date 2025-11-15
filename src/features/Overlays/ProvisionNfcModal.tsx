// src/features/Overlays/ProvisionNfcModal.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Virtuoso } from 'react-virtuoso';
import { AnimatePresence } from 'framer-motion';
import {
  nfcWorkflowStateAtom,
  nfcSimulationAtom,
  provisionedRoomIdsAtom,
  nfcSearchQueryAtom,
  nfcRoomSearchResultsAtom,
  nfcProvisioningGroupIdAtom,
  nfcProvisioningUnitIdAtom,
  NfcError,
} from '../../data/nfcAtoms';
import {
  isWriteNfcModalOpenAtom,
  selectedFacilityGroupAtom,
  selectedFacilityUnitAtom,
  isContextSelectionModalOpenAtom,
} from '../../data/atoms';
import { FullScreenModal } from '../../components/FullScreenModal';
import { SearchInput } from '../../components/SearchInput';
import { EmptyStateMessage } from '../../components/EmptyStateMessage';
import { NfcStatusOverlay } from './NfcStatusOverlay';
import { NfcRoomListItem } from './NfcRoomListItem';
import { ContextSwitcherCard } from '../Shell/ContextSwitcherCard';
import styles from './ProvisionNfcModal.module.css';

const errorMessages: Record<NfcError['code'], string> = {
  WRITE_FAILED: 'A network error prevented writing the tag.',
  TAG_LOCKED: 'This tag is locked and cannot be overwritten.',
};

export const ProvisionNfcModal = () => {
  const isOpen = useAtomValue(isWriteNfcModalOpenAtom);
  const [workflowState, setWorkflowState] = useAtom(nfcWorkflowStateAtom);
  const simulationMode = useAtomValue(nfcSimulationAtom);
  const setProvisionedIds = useSetAtom(provisionedRoomIdsAtom);
  const setIsContextModalOpen = useSetAtom(isContextSelectionModalOpenAtom);

  const [searchQuery, setSearchQuery] = useAtom(nfcSearchQueryAtom);
  const filteredRooms = useAtomValue(nfcRoomSearchResultsAtom);

  const globalGroupId = useAtomValue(selectedFacilityGroupAtom);
  const globalUnitId = useAtomValue(selectedFacilityUnitAtom);
  const [modalGroupId, setModalGroupId] = useAtom(nfcProvisioningGroupIdAtom);
  const [modalUnitId, setModalUnitId] = useAtom(nfcProvisioningUnitIdAtom);

  // Sync local state to global state whenever global state changes or modal opens.
  useEffect(() => {
    if (isOpen) {
      setModalGroupId(globalGroupId);
      setModalUnitId(globalUnitId);
    }
  }, [isOpen, globalGroupId, globalUnitId, setModalGroupId, setModalUnitId]);


  // Effect to reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSearchQuery('');
        setProvisionedIds(new Set());
        setModalGroupId(null);
        setModalUnitId(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setSearchQuery, setProvisionedIds, setModalGroupId, setModalUnitId]);

  const handleClose = () => {
    setWorkflowState({ status: 'idle' });
  };

  const handleSelectRoom = (roomId: string, roomName: string) => {
    setWorkflowState({ status: 'writing', roomId, roomName });

    setTimeout(() => {
      let outcome: 'success' | 'error' = 'success';
      let errorCode: NfcError['code'] = 'WRITE_FAILED';

      if (simulationMode === 'forceSuccess') outcome = 'success';
      else if (simulationMode === 'forceErrorWriteFailed') {
        outcome = 'error'; errorCode = 'WRITE_FAILED';
      } else if (simulationMode === 'forceErrorTagLocked') {
        outcome = 'error'; errorCode = 'TAG_LOCKED';
      } else {
        outcome = Math.random() > 0.2 ? 'success' : 'error';
        errorCode = Math.random() > 0.5 ? 'WRITE_FAILED' : 'TAG_LOCKED';
      }

      if (outcome === 'success') {
        setWorkflowState({ status: 'success', roomId, roomName });
      } else {
        setWorkflowState({
          status: 'error', roomId, roomName,
          error: { code: errorCode, message: errorMessages[errorCode] },
        });
      }
    }, 1500);
  };

  const showOverlay = workflowState.status === 'writing' || workflowState.status === 'success' || workflowState.status === 'error';

  return (
    <FullScreenModal isOpen={isOpen} onClose={handleClose} title="Write NFC Tags">
      <div className={styles.container}>
        <div className={styles.controlsHeader}>
          <ContextSwitcherCard
            groupId={modalGroupId}
            unitId={modalUnitId}
            onClick={() => setIsContextModalOpen(true)}
          />
          <SearchInput variant="standalone" placeholder="Search for a room..." value={searchQuery} onChange={setSearchQuery} />
        </div>
        
        <div className={styles.listContainer}>
          {filteredRooms.length > 0 ? (
            <Virtuoso
              data={filteredRooms}
              itemContent={(_index, room) => (
                <NfcRoomListItem
                  key={room.id}
                  roomId={room.id}
                  roomName={room.name}
                  onClick={() => handleSelectRoom(room.id, room.name)}
                />
              )}
            />
          ) : (
             <EmptyStateMessage title="No Rooms Found" message="Select a facility group and unit to see a list of rooms to provision." />
          )}
        </div>

        <AnimatePresence>
          {showOverlay && <NfcStatusOverlay />}
        </AnimatePresence>
      </div>
    </FullScreenModal>
  );
};