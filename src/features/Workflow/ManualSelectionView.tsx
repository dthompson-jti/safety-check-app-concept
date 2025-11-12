// src/features/ManualSelection/ManualSelectionView.tsx
import { useState, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Virtuoso } from 'react-virtuoso';
import { Drawer } from 'vaul';
import { safetyChecksAtom } from '../../data/appDataAtoms';
import { workflowStateAtom } from '../../data/atoms';
import { BottomSheet } from '../../components/BottomSheet';
import { SearchInput } from '../../components/SearchInput';
import { SafetyCheck } from '../../types';
import styles from './ManualSelectionView.module.css';

interface ManualSelectionViewProps {
  isOpen: boolean;
}

export const ManualSelectionView = ({ isOpen }: ManualSelectionViewProps) => {
  const [workflow, setWorkflow] = useAtom(workflowStateAtom);
  const allChecks = useAtomValue(safetyChecksAtom);
  const [searchQuery, setSearchQuery] = useState('');

  const incompleteChecks = useMemo(() => {
    return allChecks.filter(c => c.status !== 'complete' && c.status !== 'missed' && c.status !== 'supplemental');
  }, [allChecks]);

  const filteredChecks = useMemo(() => {
    if (!searchQuery) return incompleteChecks;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return incompleteChecks.filter(c =>
      c.residents.some(
        r =>
          r.name.toLowerCase().includes(lowerCaseQuery) ||
          r.location.toLowerCase().includes(lowerCaseQuery)
      )
    );
  }, [incompleteChecks, searchQuery]);

  const handleClose = () => {
    if (workflow.view === 'scanning') {
      setWorkflow({ ...workflow, isManualSelectionOpen: false });
      // Delay reset to allow animation to finish
      setTimeout(() => setSearchQuery(''), 300);
    }
  };

  const handleSelectCheck = (check: SafetyCheck) => {
    setWorkflow({
      view: 'form',
      type: 'scheduled',
      checkId: check.id,
      roomName: check.residents[0].location,
      residents: check.residents,
      specialClassification: check.specialClassification,
    });
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerContent}>
          <Drawer.Title asChild>
            <h2>Select check manually</h2>
          </Drawer.Title>
        </div>
        <div className={styles.searchContainer}>
          <SearchInput
            variant="standalone"
            placeholder="Search by room or name..."
            value={searchQuery}
            onChange={setSearchQuery}
            autoFocus
          />
        </div>
        <div className={styles.listContainer}>
          <Virtuoso
            data={filteredChecks}
            itemContent={(_index, check) => (
              // UPDATE: Use the global 'menu-item' class for consistent styling and interaction
              <button className="menu-item" onClick={() => handleSelectCheck(check)}>
                {/* UPDATE: Use the standard 'checkmark-container' for icon alignment */}
                <div className="checkmark-container">
                  {check.specialClassification ? (
                    <span className={`material-symbols-rounded ${styles.warningIcon}`}>warning</span>
                  ) : (
                    // The placeholder is now just an empty div styled by the container
                    <></>
                  )}
                </div>
                <span className={styles.checkItemText}>
                  {check.residents[0].location} - {check.residents.map(r => r.name).join(', ')}
                </span>
              </button>
            )}
          />
        </div>
      </div>
    </BottomSheet>
  );
};