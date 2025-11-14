// src/features/Overlays/ManualSelectionView.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Virtuoso } from 'react-virtuoso';
import { Drawer } from 'vaul';
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
import { ListItem } from '../../components/ListItem';
import { SafetyCheck } from '../../types';
import styles from './ManualSelectionView.module.css';

export const ManualSelectionView = () => {
  const [isOpen, setIsOpen] = useAtom(isManualCheckModalOpenAtom);
  const [searchQuery, setSearchQuery] = useAtom(manualSearchQueryAtom);
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useAtom(isGlobalSearchActiveAtom);

  const setWorkflow = useSetAtom(workflowStateAtom);

  const filteredChecks = useAtomValue(manualSelectionResultsAtom);
  const contextualResults = useAtomValue(contextualManualSearchResultsAtom);
  const { count: globalResultsCount } = useAtomValue(globalManualSearchResultsAtom);

  // Effect to reset search state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Delay reset to allow animation to finish
      const timer = setTimeout(() => {
        setSearchQuery('');
        setIsGlobalSearchActive(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setSearchQuery, setIsGlobalSearchActive]);

  const handleSelectCheck = (check: SafetyCheck) => {
    setWorkflow({
      view: 'form',
      type: 'scheduled',
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
    <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
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
                    onClick={() => setIsGlobalSearchActive(true)}
                  >
                    {/* DEFINITIVE FIX: The icon is now passed as a child span, not a prop, to align with the Button component's architecture. */}
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
                <ListItem
                  onClick={() => handleSelectCheck(check)}
                  title={check.residents[0].location}
                  subtitle={check.residents.map(r => r.name).join(', ')}
                  icon={
                    check.specialClassifications && check.specialClassifications.length > 0
                      ? 'warning'
                      : undefined
                  }
                />
              )}
            />
          )}
        </div>
      </div>
    </BottomSheet>
  );
};