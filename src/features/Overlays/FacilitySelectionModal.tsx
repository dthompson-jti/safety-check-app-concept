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
import { useHaptics } from '../../data/useHaptics';
import styles from './FacilitySelectionModal.module.css';

type Step = 'group' | 'unit';

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
  const [isContextRequired, setIsContextRequired] = useAtom(isContextSelectionRequiredAtom);
  const [isModalOpen, setIsModalOpen] = useAtom(isContextSelectionModalOpenAtom);

  // We track global state but selection is stateless in this view until confirmed
  const [selectedGroup, setSelectedGroup] = useAtom(selectedFacilityGroupAtom);
  const [selectedUnit, setSelectedUnit] = useAtom(selectedFacilityUnitAtom);

  const logout = useSetAtom(logoutAtom);
  const setAppView = useSetAtom(appViewAtom);
  const setIsScheduleLoading = useSetAtom(isScheduleLoadingAtom);
  const { trigger: triggerHaptic } = useHaptics();

  const [step, setStep] = useState<Step>('group');
  const [direction, setDirection] = useState(0);

  // Temporary state for the multi-step flow
  const [tempGroupId, setTempGroupId] = useState<string | null>(selectedGroup);

  const [modalExitDirection, setModalExitDirection] = useState<'right' | 'left'>('right');

  const isOpen = isContextRequired || isModalOpen;

  useEffect(() => {
    if (isOpen) {
      setStep('group');
      setDirection(0);
      setTempGroupId(selectedGroup);
      setModalExitDirection('right');
    }
  }, [isOpen, selectedGroup]);

  const handleLeftAction = () => {
    if (step === 'unit') {
      // Back to Group Selection
      setDirection(-1);
      setStep('group');
      return;
    }

    // Closing/Exiting from Root
    setModalExitDirection('right');
    if (isContextRequired) {
      logout();
    } else {
      setIsModalOpen(false);
    }
  };

  const handleGroupSelect = (groupId: string) => {
    triggerHaptic('selection');
    setTempGroupId(groupId);
    setDirection(1);
    setStep('unit');
  };

  const handleUnitSelect = (unitId: string) => {
    triggerHaptic('selection');
    if (!tempGroupId) return;

    setModalExitDirection('left');

    // Trigger loading if context changed
    if (tempGroupId !== selectedGroup || unitId !== selectedUnit) {
      setIsScheduleLoading(true);
    }

    // Commit Selection
    setSelectedGroup(tempGroupId);
    setSelectedUnit(unitId);

    // Always navigate to dashboard and close side menu upon selection/login
    setAppView('dashboardTime');

    if (isContextRequired) {
      // Login flow complete
      setIsContextRequired(false);
    }

    // Close modal after state updates
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalOpen(false);
      });
    });
  };

  const currentGroup = facilityData.find(g => g.id === tempGroupId);
  const units = currentGroup?.units || [];

  // Icon Logic: 
  // Unit Step -> Always Back
  // Group Step + Login Flow -> Back (Logout)
  // Group Step + Switch Flow -> Close
  const getTitle = () => {
    if (step === 'group') return 'Select Facility';
    return 'Select Unit';
  };

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={handleLeftAction}
      title={getTitle()}
      // Default actionType="back" applies (Left Arrow)
      transitionType="slide-horizontal"
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
              <div className={styles.listContainer} style={{ borderTop: 'none' }}>
                {facilityData.map((group) => (
                  <ActionListItem
                    key={group.id}
                    label={group.name}
                    leadingIcon="domain"
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
              <div className={styles.contextBanner}>
                <span className="material-symbols-rounded">domain</span>
                {currentGroup?.name}
              </div>

              <div className={styles.listContainer}>
                {units.map((unit) => {
                  return (
                    <ActionListItem
                      key={unit.id}
                      label={unit.name}
                      onClick={() => handleUnitSelect(unit.id)}
                      // Stateless selection: No checkmark, pure navigation
                      showChevron
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