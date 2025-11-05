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
    return allChecks.filter(c => c.status !== 'complete' && c.status !== 'missed');
  }, [allChecks]);

  const filteredChecks = useMemo(() => {
    if (!searchQuery) return incompleteChecks;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return incompleteChecks.filter(
      c =>
        c.resident.name.toLowerCase().includes(lowerCaseQuery) ||
        c.resident.location.toLowerCase().includes(lowerCaseQuery)
    );
  }, [incompleteChecks, searchQuery]);

  const handleClose = () => {
    if (workflow.view === 'scanning') {
      setWorkflow({ ...workflow, isManualSelectionOpen: false });
    }
  };

  const handleSelectCheck = (check: SafetyCheck) => {
    // FIX: Add the mandatory 'type' property to the workflow state.
    // This flow is for existing checks, so the type is 'scheduled'.
    setWorkflow({
      view: 'form',
      type: 'scheduled',
      checkId: check.id,
      roomName: check.resident.location,
      residentName: check.resident.name,
      specialClassification: check.specialClassification,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      width="90%"
      height="75%"
      title="Select Check Manually"
      description="Search for and select a resident's check from the list to proceed with recording the check."
    >
      <Modal.Header>
        <h3>Select Check Manually</h3>
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
                  <span>{check.resident.location} - {check.resident.name}</span>
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