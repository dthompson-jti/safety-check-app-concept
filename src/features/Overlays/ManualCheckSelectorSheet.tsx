// src/features/Overlays/ManualCheckSelectorSheet.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Virtuoso } from 'react-virtuoso';
import {
  manualSelectionResultsAtom,
  contextualManualSearchResultsAtom,
  globalManualSearchResultsAtom,
} from '../../data/appDataAtoms';
import {
  workflowStateAtom,
  isManualCheckModalOpenAtom,
  manualSearchQueryAtom,
  isGlobalSearchActiveAtom,
} from '../../data/atoms';
import { BottomSheet } from '../../components/BottomSheet';
import { SearchInput } from '../../components/SearchInput';
import { EmptyStateMessage } from '../../components/EmptyStateMessage';
import { Button } from '../../components/Button';
import { ManualCheckListItem } from './ManualCheckListItem';
import { SafetyCheck } from '../../types';
import { useHaptics } from '../../data/useHaptics';
import styles from './ManualCheckSelectorSheet.module.css';

export const ManualCheckSelectorSheet = () => {
  const [isOpen, setIsOpen] = useAtom(isManualCheckModalOpenAtom);
  const [searchQuery, setSearchQuery] = useAtom(manualSearchQueryAtom);
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useAtom(isGlobalSearchActiveAtom);

  const setWorkflow = useSetAtom(workflowStateAtom);
  const { trigger: triggerHaptic } = useHaptics();

  const filteredChecks = useAtomValue(manualSelectionResultsAtom);
  const contextualResults = useAtomValue(contextualManualSearchResultsAtom);
  const { count: globalResultsCount } = useAtomValue(globalManualSearchResultsAtom);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSearchQuery('');
        setIsGlobalSearchActive(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setSearchQuery, setIsGlobalSearchActive]);

  const handleSelectCheck = (check: SafetyCheck) => {
    triggerHaptic('selection');
    setWorkflow({
      view: 'form',
      type: 'scheduled',
      method: 'manual',
      checkId: check.id,
      roomName: check.residents[0].location,
      residents: check.residents,
      specialClassifications: check.specialClassifications,
    });
    setIsOpen(false);
  };

  const showProgressiveDiscovery =
    searchQuery &&
    contextualResults.length === 0 &&
    globalResultsCount > 0 &&
    !isGlobalSearchActive;

  return (
    <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add manual check">
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
          {filteredChecks.length === 0 && searchQuery ? (
            <EmptyStateMessage
              title={
                showProgressiveDiscovery
                  ? `No results for "${searchQuery}" in this unit`
                  : 'No Results Found'
              }
              action={
                showProgressiveDiscovery ? (
                  <Button
                    variant="tertiary"
                    onClick={() => { triggerHaptic('light'); setIsGlobalSearchActive(true); }}
                  >
                    <span className="material-symbols-rounded">search</span>
                    Show {globalResultsCount} result{globalResultsCount > 1 ? 's' : ''} in all other units
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Virtuoso
              data={filteredChecks}
              itemContent={(_index, check) => (
                <ManualCheckListItem
                  onClick={() => handleSelectCheck(check)}
                  title={check.residents[0].location}
                  residents={check.residents}
                  specialClassifications={check.specialClassifications}
                />
              )}
            />
          )}
        </div>
      </div>
    </BottomSheet>
  );
};