// src/features/Overlays/ManualCheckSelectionModal.tsx
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { useState, useMemo, useEffect } from 'react';
import { isManualCheckModalOpenAtom, workflowStateAtom } from '../../data/atoms';
import { safetyChecksAtom } from '../../data/appDataAtoms';
import { SafetyCheck } from '../../types';
import { BottomSheet } from '../../components/BottomSheet';
import { SearchInput } from '../../components/SearchInput';
import { NoSearchResults } from '../../components/EmptyStateMessage';
import styles from './ManualCheckSelectionModal.module.css';

export const ManualCheckSelectionModal = () => {
  const [isOpen, setIsOpen] = useAtom(isManualCheckModalOpenAtom);
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const allChecks = useAtomValue(safetyChecksAtom);
  const [query, setQuery] = useState('');

  // Reset search query when modal is closed
  useEffect(() => {
    if (!isOpen) {
      // Delay reset to allow animation to finish
      setTimeout(() => setQuery(''), 300);
    }
  }, [isOpen]);

  const uniqueActionableChecks = useMemo((): SafetyCheck[] => {
    const roomsMap = new Map<string, SafetyCheck>();
    allChecks.forEach(check => {
      const isActionable = check.status !== 'complete' && check.status !== 'missed' && check.status !== 'supplemental' && check.status !== 'queued';
      if (isActionable && !roomsMap.has(check.residents[0].location)) {
        roomsMap.set(check.residents[0].location, check);
      }
    });
    return Array.from(roomsMap.values());
  }, [allChecks]);


  const filteredChecks = useMemo((): SafetyCheck[] => {
    if (!query.trim()) {
      return uniqueActionableChecks;
    }
    const lowerCaseQuery = query.toLowerCase();
    return uniqueActionableChecks.filter(
      (check) =>
        check.residents[0].location.toLowerCase().includes(lowerCaseQuery) ||
        check.residents.some((resident) => resident.name.toLowerCase().includes(lowerCaseQuery))
    );
  }, [query, uniqueActionableChecks]);

  const handleSelectCheck = (check: SafetyCheck) => {
    setWorkflowState({
      view: 'form',
      type: 'scheduled',
      checkId: check.id,
      roomName: check.residents[0].location,
      residents: check.residents,
      specialClassification: check.specialClassification,
    });
    setIsOpen(false);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className={styles.container}>
        <h3 className={styles.title}>Manual Check</h3>
        <p className={styles.subtitle}>Select a room or search by resident name.</p>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search rooms or residents..."
          variant="standalone"
          autoFocus
        />
        <div className={styles.listContainer}>
          {filteredChecks.length > 0 ? (
            filteredChecks.map((check) => (
              <button key={check.id} className={`menu-item ${styles.roomItem}`} onClick={() => handleSelectCheck(check)}>
                <div className="checkmark-container">
                  <span className="material-symbols-rounded">meeting_room</span>
                </div>
                <div className={styles.roomInfo}>
                  <span className={styles.roomName}>{check.residents[0].location}</span>
                  <span className={styles.residentNames}>
                    {check.residents.map((r) => r.name).join(', ')}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <NoSearchResults query={query} />
          )}
        </div>
      </div>
    </BottomSheet>
  );
};