// src/features/Overlays/SelectRoomModal.tsx
import { useState, useMemo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Drawer } from 'vaul';
import { isSelectRoomModalOpenAtom, workflowStateAtom } from '../../data/atoms';
import { mockResidents } from '../../data/appDataAtoms';
import { BottomSheet } from '../../components/BottomSheet';
import { Select, SelectItem } from '../../components/Select';
import { Button } from '../../components/Button';
import styles from './SelectRoomModal.module.css';

export const SelectRoomModal = () => {
  const [isOpen, setIsOpen] = useAtom(isSelectRoomModalOpenAtom);
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  const selectedResident = useMemo(
    () => mockResidents.find(r => r.id === selectedRoomId),
    [selectedRoomId]
  );

  const resetAndClose = () => {
    setIsOpen(false);
    // Delay reset to allow animation to finish
    setTimeout(() => setSelectedRoomId(''), 300);
  };

  const handleContinue = () => {
    if (!selectedResident) return;

    const residentsInRoom = mockResidents.filter(
      r => r.location === selectedResident.location
    );

    setWorkflowState({
      view: 'form',
      type: 'supplemental',
      roomId: selectedResident.id,
      roomName: selectedResident.location,
      residents: residentsInRoom,
    });
    resetAndClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={resetAndClose}>
      <div className={styles.headerContent}>
        <Drawer.Title asChild>
          <h2>Supplemental check</h2>
        </Drawer.Title>
        <Button variant="quaternary" size="s" iconOnly onClick={resetAndClose} aria-label="Close">
          <span className="material-symbols-rounded">close</span>
        </Button>
      </div>
      <div className={styles.body}>
        <Drawer.Description asChild>
          <p className={styles.helperText}>
            Select the room where you are performing an unscheduled safety check.
          </p>
        </Drawer.Description>
        <div className={styles.formGroup}>
          <label htmlFor="room-select">Select a room</label>
          <Select
            value={selectedRoomId}
            onValueChange={setSelectedRoomId}
            placeholder="Choose a resident location..."
          >
            {mockResidents.map((resident) => (
              <SelectItem key={resident.id} value={resident.id}>
                {resident.location} - {resident.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      <div className={styles.footerContent}>
        <Button variant="secondary" size="m" onClick={resetAndClose}>
          Cancel
        </Button>
        <Button variant="primary" size="m" onClick={handleContinue} disabled={!selectedRoomId}>
          Continue
        </Button>
      </div>
    </BottomSheet>
  );
};