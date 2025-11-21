// src/features/Workflow/NfcWriteView.tsx
import { useEffect } from 'react';
import { useSetAtom, useAtomValue, useAtom } from 'jotai';
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
  provisionedRoomIdsAtom,
  nfcSearchQueryAtom,
  nfcRoomSearchResultsAtom,
  nfcProvisioningGroupIdAtom,
  nfcProvisioningUnitIdAtom,
} from '../../data/nfcAtoms';
import { Button } from '../../components/Button';
import { SearchInput } from '../../components/SearchInput';
import { EmptyStateMessage } from '../../components/EmptyStateMessage';
import { NfcWriteSheet } from '../Overlays/NfcWriteSheet';
import { NfcRoomListItem } from '../Overlays/NfcRoomListItem';
import { ContextSwitcherCard } from '../Shell/ContextSwitcherCard';
import styles from './NfcWriteView.module.css';

export const NfcWriteView = () => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const setNfcWorkflowState = useSetAtom(nfcWorkflowStateAtom);
  const setProvisionedIds = useSetAtom(provisionedRoomIdsAtom);
  const setIsContextModalOpen = useSetAtom(isContextSelectionModalOpenAtom);

  const [searchQuery, setSearchQuery] = useAtom(nfcSearchQueryAtom);
  const filteredRooms = useAtomValue(nfcRoomSearchResultsAtom);

  const globalGroupId = useAtomValue(selectedFacilityGroupAtom);
  const globalUnitId = useAtomValue(selectedFacilityUnitAtom);
  const [modalGroupId, setModalGroupId] = useAtom(nfcProvisioningGroupIdAtom);
  const [modalUnitId, setModalUnitId] = useAtom(nfcProvisioningUnitIdAtom);

  useEffect(() => {
    setModalGroupId(globalGroupId);
    setModalUnitId(globalUnitId);
  }, [globalGroupId, globalUnitId, setModalGroupId, setModalUnitId]);

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
    setNfcWorkflowState({ status: 'ready', roomId, roomName });
  };

  return (
    <motion.div
      className={styles.viewContainer}
      // PHYSICS: Slide Up (Tool/Sheet)
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className={styles.header}>
        <h3>Write NFC tags</h3>
        <Button variant="tertiary" size="m" iconOnly onClick={handleClose} aria-label="Close">
          <span className="material-symbols-rounded">close</span>
        </Button>
      </header>

      <div className={styles.controlsHeader}>
        <ContextSwitcherCard
          groupId={modalGroupId}
          unitId={modalUnitId}
          onClick={() => setIsContextModalOpen(true)}
          variant="compact" // Use the new compact variant
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
                roomName={room.name}
                onClick={() => handleSelectRoom(room.id, room.name)}
              />
            )}
          />
        ) : (
          <EmptyStateMessage title="No Rooms Found" message="Select a facility group and unit to see a list of rooms to provision." />
        )}
      </main>

      <NfcWriteSheet />
    </motion.div>
  );
};