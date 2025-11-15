// src/features/Workflow/ProvisionNfcView.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';
import {
  workflowStateAtom,
  isContextSelectionModalOpenAtom,
  selectedFacilityGroupAtom,
  selectedFacilityUnitAtom,
} from '../../data/atoms';
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
import { Button } from '../../components/Button';
import { SearchInput } from '../../components/SearchInput';
import { EmptyStateMessage } from '../../components/EmptyStateMessage';
import { NfcWritingSheet } from '../Overlays/NfcWritingSheet';
import { NfcRoomListItem } from '../Overlays/NfcRoomListItem';
import { ContextSwitcherCard } from '../Shell/ContextSwitcherCard';
import styles from './ProvisionNfcView.module.css';

const errorMessages: Record<NfcError['code'], string> = {
  WRITE_FAILED: 'A network error prevented writing the tag.',
  TAG_LOCKED: 'This tag is locked and cannot be overwritten.',
};

export const ProvisionNfcView = () => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const setNfcWorkflowState = useSetAtom(nfcWorkflowStateAtom);
  const simulationMode = useAtomValue(nfcSimulationAtom);
  const setProvisionedIds = useSetAtom(provisionedRoomIdsAtom);
  const setIsContextModalOpen = useSetAtom(isContextSelectionModalOpenAtom);

  const [searchQuery, setSearchQuery] = useAtom(nfcSearchQueryAtom);
  const filteredRooms = useAtomValue(nfcRoomSearchResultsAtom);

  const globalGroupId = useAtomValue(selectedFacilityGroupAtom);
  const globalUnitId = useAtomValue(selectedFacilityUnitAtom);
  const [modalGroupId, setModalGroupId] = useAtom(nfcProvisioningGroupIdAtom);
  const [modalUnitId, setModalUnitId] = useAtom(nfcProvisioningUnitIdAtom);

  // Sync local state to global state when the view is active.
  useEffect(() => {
    setModalGroupId(globalGroupId);
    setModalUnitId(globalUnitId);
  }, [globalGroupId, globalUnitId, setModalGroupId, setModalUnitId]);

  // Effect to reset state when view closes
  useEffect(() => {
    return () => {
      setSearchQuery('');
      setProvisionedIds(new Set());
      setModalGroupId(null);
      setModalUnitId(null);
      setNfcWorkflowState({ status: 'idle' });
    };
  }, [setSearchQuery, setProvisionedIds, setModalGroupId, setModalUnitId, setNfcWorkflowState]);

  const handleClose = () => {
    setWorkflowState({ view: 'none' });
  };

  const handleSelectRoom = (roomId: string, roomName: string) => {
    setNfcWorkflowState({ status: 'writing', roomId, roomName });

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
        setNfcWorkflowState({ status: 'success', roomId, roomName });
      } else {
        setNfcWorkflowState({
          status: 'error', roomId, roomName,
          error: { code: errorCode, message: errorMessages[errorCode] },
        });
      }
    }, 1500);
  };

  return (
    <motion.div
      className={styles.viewContainer}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className={styles.header}>
        <h3>Write NFC Tags</h3>
        <Button variant="tertiary" size="m" iconOnly onClick={handleClose} aria-label="Close">
          <span className="material-symbols-rounded">close</span>
        </Button>
      </header>

      <div className={styles.controlsHeader}>
        <ContextSwitcherCard
          groupId={modalGroupId}
          unitId={modalUnitId}
          onClick={() => setIsContextModalOpen(true)}
        />
        <SearchInput variant="standalone" placeholder="Search for a room..." value={searchQuery} onChange={setSearchQuery} />
      </div>

      <main className={styles.listContainer}>
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
      </main>
      
      <NfcWritingSheet />
    </motion.div>
  );
};