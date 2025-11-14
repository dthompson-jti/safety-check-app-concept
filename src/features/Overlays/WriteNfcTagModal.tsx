// src/features/Overlays/WriteNfcTagModal.tsx
import { useMemo, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Drawer } from 'vaul';
import { isWriteNfcModalOpenAtom } from '../../data/atoms';
import { addToastAtom } from '../../data/toastAtoms';
import { mockResidents } from '../../data/mock/residentData';
import { BottomSheet } from '../../components/BottomSheet';
import { Select, SelectItem } from '../../components/Select';
import { Button } from '../../components/Button';
import styles from './WriteNfcTagModal.module.css';
import { Resident } from '../../types';

type ModalState = 'initial' | 'writing' | 'success' | 'error';

export const WriteNfcTagModal = () => {
  const [isOpen, setIsOpen] = useAtom(isWriteNfcModalOpenAtom);
  const addToast = useSetAtom(addToastAtom);
  const [modalState, setModalState] = useState<ModalState>('initial');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  const uniqueLocations = useMemo((): Resident[] => {
    // FIX: Provide an explicit generic type to the initial value of the reduce function.
    // This ensures TypeScript correctly infers the accumulator's type and prevents
    // the result from degrading to `any`.
    const locationsMap = mockResidents.reduce((acc, resident) => {
      if (!acc.has(resident.location)) {
        acc.set(resident.location, resident);
      }
      return acc;
    }, new Map<string, Resident>());
    
    return Array.from(locationsMap.values()).sort((a, b) => 
      a.location.localeCompare(b.location)
    );
  }, []);

  const resetAndClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setModalState('initial');
      setSelectedRoomId('');
    }, 300);
  };

  const handleWriteTag = () => {
    if (!selectedRoomId) return;
    setModalState('writing');

    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate simulation
      if (success) {
        setModalState('success');
        addToast({ message: 'NFC tag written successfully', icon: 'check_circle' });
      } else {
        setModalState('error');
        addToast({ message: 'Failed to write NFC tag', icon: 'error' });
      }
    }, 2000);
  };

  const renderAnimationArea = () => {
    switch (modalState) {
      case 'writing':
        return (
          <div className={styles.animationContainer}>
            <span className={`material-symbols-rounded ${styles.spinner}`}>nfc</span>
            <p>Hold device near physical tag to write.</p>
          </div>
        );
      case 'success':
        return (
          <div className={styles.animationContainer}>
            <span className={`material-symbols-rounded ${styles.success}`}>check_circle</span>
            <p>Success! Tag is ready.</p>
          </div>
        );
      case 'error':
        return (
          <div className={styles.animationContainer}>
            <span className={`material-symbols-rounded ${styles.error}`}>error</span>
            <p>Error writing to tag. Please try again.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={modalState === 'writing' ? () => {} : resetAndClose}>
      <div className={styles.headerContent}>
        <Drawer.Title asChild>
          <h2>Provision NFC tag</h2>
        </Drawer.Title>
        {modalState !== 'writing' && (
          <Button variant="quaternary" size="s" iconOnly onClick={resetAndClose} aria-label="Close">
            <span className="material-symbols-rounded">close</span>
          </Button>
        )}
      </div>
      <div className={styles.body}>
        <Drawer.Description asChild>
          <p className={styles.helperText}>
            Select a room to prepare its corresponding NFC tag.
          </p>
        </Drawer.Description>
        <div className={styles.formGroup}>
          <label htmlFor="room-select">Select a room</label>
          <Select
            value={selectedRoomId}
            onValueChange={setSelectedRoomId}
            placeholder="Choose a resident location..."
          >
            {/* This mapping is now fully type-safe */}
            {uniqueLocations.map((resident) => (
              <SelectItem key={resident.id} value={resident.id}>
                {resident.location}
              </SelectItem>
            ))}
          </Select>
        </div>
        {modalState !== 'initial' && renderAnimationArea()}
      </div>
      <div className={styles.footerContent}>
        {modalState === 'initial' ? (
          <>
            <Button variant="secondary" size="m" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button variant="primary" size="m" onClick={handleWriteTag} disabled={!selectedRoomId}>
              Write tag
            </Button>
          </>
        ) : modalState === 'success' || modalState === 'error' ? (
          <Button variant="primary" size="m" onClick={resetAndClose}>
            Done
          </Button>
        ) : (
          <Button variant="secondary" size="m" disabled>
            Writing...
          </Button>
        )}
      </div>
    </BottomSheet>
  );
};