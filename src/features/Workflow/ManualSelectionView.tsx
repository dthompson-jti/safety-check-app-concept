// src/features/ManualSelection/ManualSelectionView.tsx
import { useState, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Virtuoso } from 'react-virtuoso';
import { safetyChecksAtom } from '../../data/appDataAtoms';
import { workflowStateAtom } from '../../data/atoms';
import { Modal } from '../../components/Modal';
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      width="90%"
      height="75%"
      title="Select check manually"
      description="Search for and select a resident's check from the list to proceed with recording the check."
    >
      <Modal.Header>
        <h3>Select check manually</h3>
      </Modal.Header>
      <Modal.Content>
        <div className={styles.contentWrapper}>
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
                <button className={styles.checkItem} onClick={() => handleSelectCheck(check)}>
                  <span className={styles.checkItemText}>
                    {check.residents[0].location} - {check.residents.map(r => r.name).join(', ')}
                  </span>
                  {/* ENHANCEMENT: Show icon for classified checks in the list */}
                  {check.specialClassification && (
                    <span className={`material-symbols-rounded ${styles.srIcon}`}>shield_person</span>
                  )}
                </button>
              )}
            />
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
};