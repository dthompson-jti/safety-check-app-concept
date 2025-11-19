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

// Internal Stack Physics (Step 1 -> Step 2)
const contentVariants = {
  enter: (direction: number) => ({
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
  const [step, setStep] = useState<Step>('group');
  const [direction, setDirection] = useState(0);
  const [tempGroupId, setTempGroupId] = useState<string | null>(selectedGroup);
  
  // RELIABILITY FIX: Explicitly control exit direction for the parent modal
  const [modalExitDirection, setModalExitDirection] = useState<'right' | 'left'>('right');

  const isOpen = isContextRequired || isModalOpen;

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('group');
      setDirection(0);
      setTempGroupId(selectedGroup);
      setModalExitDirection('right'); // Default to "Back" behavior
    }
  }, [isOpen]); 

  const handleCloseOrLogout = () => {
    // Ensure we exit to the Right (Backwards)
    setModalExitDirection('right');
    
    if (isContextRequired) {
      logout();
    } else {
      setIsModalOpen(false);
    }
  };

  const handleGroupSelect = (groupId: string) => {
    setTempGroupId(groupId);
    setDirection(1); // Slide Forward
    setStep('unit');
  };

  const handleBackToGroups = () => {
    setDirection(-1); // Slide Backward
    setStep('group');
  };

  const handleUnitSelect = (unitId: string) => {
    if (!tempGroupId) return;
    
    // 1. BARN DOOR FIX: Set direction first
    setModalExitDirection('left'); // Exit Left (Progress Forward)

    if (tempGroupId !== selectedGroup || unitId !== selectedUnit) {
      setIsScheduleLoading(true);
    }
    
    setSelectedGroup(tempGroupId);
    setSelectedUnit(unitId);

    if (!isContextRequired) {
      setAppView('dashboardTime');
    } else {
      setIsContextRequired(false);
    }
    
    // 2. BARN DOOR FIX: The Double-RAF Pattern
    // This ensures the 'modalExitDirection' state change paints to the DOM
    // BEFORE we trigger the unmount via setIsModalOpen(false).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalOpen(false);
      });
    });
  };

  const currentGroup = facilityData.find(g => g.id === tempGroupId);
  const units = currentGroup?.units || [];

  const getLeftIcon = () => {
    if (step === 'unit') return 'arrow_back';
    return isContextRequired ? 'logout' : 'arrow_back';
  };

  const handleLeftAction = step === 'group' ? handleCloseOrLogout : handleBackToGroups;

  // DESIGN FIX: Static title "Select Facility"
  const modalTitle = isContextRequired ? "Sign In" : "Select Facility";

  return (
    <FullScreenModal 
      isOpen={isOpen} 
      onClose={handleLeftAction} 
      title={modalTitle}
      leftIcon={getLeftIcon()}
      transitionType="slide-horizontal"
      // RELIABILITY FIX: Pass the specific exit direction
      exitDirection={modalExitDirection}
    >
      <div className={styles.container}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {step === 'group' ? (
            <motion.div
              key="group-list"
              className={styles.viewWrapper}
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* DESIGN FIX: No inline header. List starts immediately. */}
              <div className={styles.listContainer} style={{ borderTop: 'none' }}>
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
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Step 2: Keep sticky banner for context */}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FullScreenModal>
  );
};