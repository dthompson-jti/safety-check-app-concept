// src/features/Overlays/WriteNfcTagModal.tsx
import { useMemo, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Drawer } from 'vaul';
import { isWriteNfcModalOpenAtom } from '../../data/atoms';
import { addToastAtom } from '../../data/toastAtoms';
import { mockResidents } from '../../data/mock/residentData';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { SearchInput } from '../../components/SearchInput';
import { ListItem } from '../../components/ListItem';
import { EmptyStateMessage } from '../../components/EmptyStateMessage';
import styles from './WriteNfcTagModal.module.css';

type ModalState = 'initial' | 'writing' | 'success' | 'error';
type LocationInfo = { id: string; name: string };

export const WriteNfcTagModal = () => {
  const [isOpen, setIsOpen] = useAtom(isWriteNfcModalOpenAtom);
  const addToast = useSetAtom(addToastAtom);

  const [modalState, setModalState] = useState<ModalState>('initial');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const uniqueLocations = useMemo((): LocationInfo[] => {
    const locationsMap = mockResidents.reduce((acc, resident) => {
      if (!acc.has(resident.location)) {
        acc.set(resident.location, { id: resident.id, name: resident.location });
      }
      return acc;
    }, new Map<string, LocationInfo>());

    return Array.from(locationsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredLocations = useMemo(() => {
    if (!searchQuery) return uniqueLocations;
    return uniqueLocations.filter(loc =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueLocations, searchQuery]);

  const resetAndClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setModalState('initial');
      setSelectedRoomId('');
      setSearchQuery('');
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

  const renderInitialContent = () => (
    <>
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
        {filteredLocations.length > 0 ? (
          filteredLocations.map(location => (
            <ListItem
              key={location.id}
              title={location.name}
              onClick={() => setSelectedRoomId(location.id)}
              isActive={selectedRoomId === location.id}
            />
          ))
        ) : (
          <EmptyStateMessage title={`No rooms found for "${searchQuery}"`} />
        )}
      </div>
    </>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={modalState === 'writing' ? () => {} : resetAndClose}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerContent}>
          <Drawer.Title asChild>
            <h2>Provision NFC tag</h2>
          </Drawer.Title>
        </div>

        {modalState === 'initial' ? renderInitialContent() : renderAnimationArea()}

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
      </div>
    </BottomSheet>
  );
};