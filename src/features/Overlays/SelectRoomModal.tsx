// src/features/Overlays/SelectRoomModal.tsx
import { useAtom, useSetAtom } from 'jotai';
import { useState, useMemo } from 'react';
import { isManualCheckModalOpenAtom, workflowStateAtom } from '../../data/atoms';
import { mockResidents } from '../../data/appDataAtoms';
import { Resident } from '../../types';
import { BottomSheet } from '../../components/BottomSheet';
import { SearchInput } from '../../components/SearchInput';
import { EmptyStateMessage } from '../../components/EmptyStateMessage';
import styles from './SelectRoomModal.module.css';

interface Room {
  id: string; // Use the ID of the first resident in the room as a stable key
  location: string;
  residents: Resident[];
}

export const SelectRoomModal = () => {
  // FIX: Use the correctly renamed atom 'isManualCheckModalOpenAtom'.
  // This resolves the 'unsafe destructuring' error from ESLint.
  const [isOpen, setIsOpen] = useAtom(isManualCheckModalOpenAtom);
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const [query, setQuery] = useState('');

  // Group residents by location to create a list of rooms.
  // The explicit return type `Room[]` ensures type safety downstream.
  const uniqueRooms = useMemo((): Room[] => {
    const roomsMap = new Map<string, Resident[]>();
    mockResidents.forEach(res => {
      if (!roomsMap.has(res.location)) {
        roomsMap.set(res.location, []);
      }
      roomsMap.get(res.location)!.push(res);
    });
    return Array.from(roomsMap.entries()).map(([location, residents]) => ({
      id: residents[0].id, // Use first resident's ID for a stable key
      location,
      residents,
    }));
  }, []);

  const filteredRooms = useMemo((): Room[] => {
    if (!query.trim()) {
      return uniqueRooms;
    }
    const lowerCaseQuery = query.toLowerCase();
    return uniqueRooms.filter(
      (room) =>
        room.location.toLowerCase().includes(lowerCaseQuery) ||
        room.residents.some((resident) => resident.name.toLowerCase().includes(lowerCaseQuery))
    );
  }, [query, uniqueRooms]);

  const handleSelectRoom = (room: Room) => {
    setWorkflowState({
      view: 'form',
      type: 'supplemental',
      roomId: room.id,
      roomName: room.location,
      residents: room.residents,
    });
    setIsOpen(false);
    setQuery(''); // Reset query on close
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Manual Check</h3>
        <p className={styles.subtitle}>Select a room or search by resident name.</p>
        <div className={styles.searchWrapper}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search rooms or residents..."
            variant="integrated"
            autoFocus
          />
        </div>
        <div className={styles.listContainer}>
          {filteredRooms.length > 0 ? (
            // FIX: By ensuring 'filteredRooms' is strongly typed as Room[],
            // 'room' is also strongly typed, resolving the 'unsafe assignment' error.
            filteredRooms.map((room) => (
              <button key={room.id} className={`menu-item ${styles.roomItem}`} onClick={() => handleSelectRoom(room)}>
                <div className="checkmark-container">
                  <span className="material-symbols-rounded">meeting_room</span>
                </div>
                <div className={styles.roomInfo}>
                  <span className={styles.roomName}>{room.location}</span>
                  <span className={styles.residentNames}>
                    {room.residents.map((r) => r.name).join(', ')}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <EmptyStateMessage query={query} />
          )}
        </div>
      </div>
    </BottomSheet>
  );
};