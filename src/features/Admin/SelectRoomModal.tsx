// src/features/Admin/SelectRoomModal.tsx
import { useState, useMemo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { isSelectRoomModalOpenAtom, workflowStateAtom } from '../../data/atoms';
import { mockResidents } from '../../data/appDataAtoms';
import { Modal } from '../../components/Modal';
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
    setTimeout(() => setSelectedRoomId(''), 300);
  };

  const handleContinue = () => {
    if (!selectedResident) return;

    // FIX: Find all residents who share the same location as the selected resident.
    const residentsInRoom = mockResidents.filter(
      r => r.location === selectedResident.location
    );

    // FIX: Set the workflow state with the correct `residents` array property,
    // matching the updated `WorkflowState` type. This resolves the downstream crash.
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
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      width="90%"
      height="auto"
      title="Select Room for Supplemental Check"
      description="Choose a resident's location from the list to record an unscheduled check."
    >
      <Modal.Header>
        <div className={styles.headerContent}>
          <h2>Supplemental Check</h2>
          <Button variant="quaternary" size="s" iconOnly onClick={resetAndClose} aria-label="Close">
            <span className="material-symbols-rounded">close</span>
          </Button>
        </div>
      </Modal.Header>
      <Modal.Content>
        <div className={styles.body}>
          <p className={styles.helperText}>
            Select the room where you are performing an unscheduled safety check.
          </p>
          <div className={styles.formGroup}>
            <label htmlFor="room-select">Select a Room</label>
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
      </Modal.Content>
      <Modal.Footer>
        <div className={styles.footerContent}>
          <Button variant="secondary" size="m" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button variant="primary" size="m" onClick={handleContinue} disabled={!selectedRoomId}>
            Continue
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};