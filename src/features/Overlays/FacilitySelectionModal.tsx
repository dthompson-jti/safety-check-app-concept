// src/features/Overlays/FacilitySelectionModal.tsx
import { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import {
  isContextSelectionRequiredAtom,
  isContextSelectionModalOpenAtom,
  selectedFacilityGroupAtom,
  selectedFacilityUnitAtom,
  logoutAtom,
  appViewAtom,
  isScheduleLoadingAtom,
} from '../../data/atoms';
import { facilityData } from '../../data/mock/facilityData';
import { FullScreenModal } from '../../components/FullScreenModal';
import { ActionListItem } from '../../components/ActionListItem';
import styles from './FacilitySelectionModal.module.css';

type Step = 'group' | 'unit';

// Animation variants for sliding pages.
// Handles the transition direction (left vs right) based on navigation depth.
const variants = {
  enter: (direction: number) => ({
    // If direction is 0 (initial mount), we force x: 0 to avoid a slide-in effect.
    // Otherwise, slide from right (1) or left (-1).
    x: direction === 0 ? 0 : (direction > 0 ? '100%' : '-100%'),
    opacity: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 1, 
  }),
};

export const FacilitySelectionModal = () => {
  // Global State
  const [isContextRequired, setIsContextRequired] = useAtom(isContextSelectionRequiredAtom);
  const [isModalOpen, setIsModalOpen] = useAtom(isContextSelectionModalOpenAtom);
  const [selectedGroup, setSelectedGroup] = useAtom(selectedFacilityGroupAtom);
  const [selectedUnit, setSelectedUnit] = useAtom(selectedFacilityUnitAtom);
  const logout = useSetAtom(logoutAtom);
  const setAppView = useSetAtom(appViewAtom);
  const setIsScheduleLoading = useSetAtom(isScheduleLoadingAtom);

  // Local Navigation State
  // tempGroupId allows exploration of groups without committing the selection to global state.
  const [step, setStep] = useState<Step>('group');
  const [direction, setDirection] = useState(0);
  const [tempGroupId, setTempGroupId] = useState<string | null>(selectedGroup);

  // Control exit direction for the parent FullScreenModal (Slide left on success, right on close)
  const [modalExitDirection, setModalExitDirection] = useState<'right' | 'left'>('right');

  const isOpen = isContextRequired || isModalOpen;

  // Reset local state when the modal OPENS.
  // We deliberately avoid dependening on 'selectedGroup' to prevent race conditions
  // where saving the group would trigger a reset of the exit direction.
  useEffect(() => {
    if (isOpen) {
      setStep('group');
      setDirection(0);
      setTempGroupId(selectedGroup);
      setModalExitDirection('right');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); 

  // -- Navigation Handlers --

  const handleCloseOrLogout = () => {
    if (isContextRequired) {
      logout();
    } else {
      setIsModalOpen(false);
    }
  };

  const handleGroupSelect = (groupId: string) => {
    setTempGroupId(groupId);
    setDirection(1); // Slide forward (Right to Left)
    setStep('unit');
  };

  const handleBackToGroups = () => {
    setDirection(-1); // Slide backward (Left to Right)
    setStep('group');
  };

  const handleUnitSelect = (unitId: string) => {
    if (!tempGroupId) return;
    
    // 1. Set exit direction to Left (Forward) to indicate progress/success
    setModalExitDirection('left');

    // Trigger loading simulation only if the context actually changed
    if (tempGroupId !== selectedGroup || unitId !== selectedUnit) {
      setIsScheduleLoading(true);
    }
    
    // 2. Commit selection to global state
    setSelectedGroup(tempGroupId);
    setSelectedUnit(unitId);

    // If this was the initial login flow, allow entry to dashboard
    if (!isContextRequired) {
      setAppView('dashboardTime');
    } else {
      setIsContextRequired(false);
    }
    
    // 3. Close Modal with a double-RAF delay.
    // This ensures the 'modalExitDirection' state change is painted to the DOM 
    // before the 'isModalOpen' state change triggers the unmount, ensuring the 
    // correct exit animation plays.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalOpen(false);
      });
    });
  };

  // -- Derived UI State --

  const currentGroup = facilityData.find(g => g.id === tempGroupId);
  const units = currentGroup?.units || [];

  // Configure header based on depth
  const headerConfig = step === 'group' 
    ? {
        title: 'Select Facility',
        leftIcon: isContextRequired ? 'logout' : 'close', 
        onAction: handleCloseOrLogout
      }
    : {
        title: 'Select Unit',
        leftIcon: 'arrow_back',
        onAction: handleBackToGroups
      };

  return (
    <FullScreenModal 
      isOpen={isOpen} 
      onClose={headerConfig.onAction} 
      title={headerConfig.title}
      leftIcon={headerConfig.leftIcon}
      exitDirection={modalExitDirection}
    >
      <div className={styles.container}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {step === 'group' ? (
            <motion.div
              key="group-list"
              className={styles.viewWrapper}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ 
                type: 'tween', 
                duration: 0.3, 
                ease: [0.32, 0.72, 0, 1] 
              }}
            >
              <div className={styles.listContainer}>
                {facilityData.map((group) => (
                  <ActionListItem
                    key={group.id}
                    label={group.name}
                    onClick={() => handleGroupSelect(group.id)}
                    showChevron
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="unit-list"
              className={styles.viewWrapper}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ 
                type: 'tween', 
                duration: 0.3, 
                ease: [0.32, 0.72, 0, 1] 
              }}
            >
              <div className={styles.contextBanner}>
                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>domain</span>
                {currentGroup?.name}
              </div>

              <div className={styles.listContainer}>
                {units.map((unit) => {
                  const isSelected = selectedGroup === tempGroupId && selectedUnit === unit.id;
                  return (
                    <ActionListItem
                      key={unit.id}
                      label={unit.name}
                      onClick={() => handleUnitSelect(unit.id)}
                      leadingIcon={isSelected ? 'check' : undefined}
                      isSelected={isSelected}
                      indent={true} 
                    />
                  );
                })}
                {units.length === 0 && (
                   <div style={{ padding: '24px', textAlign: 'center', color: 'var(--surface-fg-tertiary)' }}>
                      No units available.
                   </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FullScreenModal>
  );
};