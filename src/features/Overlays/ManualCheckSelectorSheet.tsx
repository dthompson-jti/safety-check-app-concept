// src/features/Overlays/ManualCheckSelectorSheet.tsx
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Drawer } from 'vaul';
import {
  isManualCheckModalOpenAtom,
  manualSearchQueryAtom,
  workflowStateAtom,
  isGlobalSearchActiveAtom,
} from '../../data/atoms';
import {
  manualSelectionResultsAtom,
  globalManualSearchResultsAtom
} from '../../data/appDataAtoms';
import { SafetyCheck } from '../../types';
import { SearchInput } from '../../components/SearchInput';
import { ActionListItem } from '../../components/ActionListItem';
import { Button } from '../../components/Button';
import styles from './ManualCheckSelectorSheet.module.css';

export const ManualCheckSelectorSheet = () => {
  const [isOpen, setIsOpen] = useAtom(isManualCheckModalOpenAtom);
  const [searchQuery, setSearchQuery] = useAtom(manualSearchQueryAtom);
  const [isGlobalSearch, setIsGlobalSearch] = useAtom(isGlobalSearchActiveAtom);
  
  const results = useAtomValue(manualSelectionResultsAtom);
  const globalResults = useAtomValue(globalManualSearchResultsAtom);
  const setWorkflowState = useSetAtom(workflowStateAtom);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        setSearchQuery('');
        setIsGlobalSearch(false);
      }, 300);
    }
  };

  const handleSelectCheck = (check: SafetyCheck) => {
    setIsOpen(false);
    
    // Delay transition slightly to allow sheet to close smoothly
    setTimeout(() => {
      setWorkflowState({
        view: 'form',
        type: 'scheduled',
        method: 'manual',
        checkId: check.id,
        roomName: check.residents[0]?.location || 'Unknown Room',
        residents: check.residents,
        specialClassifications: check.specialClassifications,
      });
    }, 300);
  };

  const renderResidents = (residents: { name: string; id: string }[], specialClassifications?: { residentId: string }[]) => {
    const classifiedIds = new Set(specialClassifications?.map(sc => sc.residentId));
    
    return (
      <span style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
        {residents.map((r, i) => (
          <span key={r.id} style={{ display: 'inline-flex', alignItems: 'center', color: 'inherit' }}>
             {classifiedIds.has(r.id) && (
               <span className="material-symbols-rounded" style={{ fontSize: '14px', marginRight: '2px', fontVariationSettings: "'FILL' 1", color: 'var(--surface-fg-primary)' }}>warning</span>
             )}
             {r.name}{i < residents.length - 1 ? ',' : ''}
          </span>
        ))}
      </span>
    );
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className={styles.overlay} />
        <Drawer.Content className={styles.contentWrapper}>
          <div className={styles.content}>
            {/* Restored Handle */}
            <div className={styles.handleContainer}>
              <div className={styles.handle} />
            </div>

            <div className={styles.sheetHeader}>
              <h3 className={styles.sheetTitle}>Add Manual Check</h3>
              <Button variant="tertiary" size="s" iconOnly onClick={() => setIsOpen(false)}>
                <span className="material-symbols-rounded">close</span>
              </Button>
            </div>

            <div className={styles.searchContainer}>
              <SearchInput 
                placeholder="Search room or resident..." 
                value={searchQuery} 
                onChange={setSearchQuery} 
                variant="standalone"
              />
            </div>

            <div className={styles.listContainer}>
              <div className={styles.listContent}>
                {results.length > 0 ? (
                  <>
                    {searchQuery && <div className={styles.sectionHeader}>Matching Results</div>}
                    {results.map(check => (
                      <ActionListItem
                        key={check.id}
                        label={check.residents[0]?.location || 'Unknown Room'}
                        subLabel={renderResidents(check.residents, check.specialClassifications)}
                        onClick={() => handleSelectCheck(check)}
                      />
                    ))}
                  </>
                ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', textAlign: 'center', color: 'var(--surface-fg-tertiary)' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.5 }}>search_off</span>
                      <p>No rooms found.</p>
                      {!isGlobalSearch && searchQuery && (
                         <div style={{ marginTop: '16px' }}>
                            <Button variant="secondary" size="s" onClick={() => setIsGlobalSearch(true)}>
                               Search All Facilities ({globalResults.count})
                            </Button>
                         </div>
                      )}
                   </div>
                )}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};