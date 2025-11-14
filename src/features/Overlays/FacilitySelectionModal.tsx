// src/features/Overlays/FacilitySelectionModal.tsx
import { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
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
import { Button } from '../../components/Button';
import { Select, SelectItem } from '../../components/Select';
import styles from './FacilitySelectionModal.module.css';

export const FacilitySelectionModal = () => {
  const [isContextRequired, setIsContextRequired] = useAtom(isContextSelectionRequiredAtom);
  const [isModalOpen, setIsModalOpen] = useAtom(isContextSelectionModalOpenAtom);
  const [selectedGroup, setSelectedGroup] = useAtom(selectedFacilityGroupAtom);
  const [selectedUnit, setSelectedUnit] = useAtom(selectedFacilityUnitAtom);
  const logout = useSetAtom(logoutAtom);
  const setAppView = useSetAtom(appViewAtom);
  const setIsScheduleLoading = useSetAtom(isScheduleLoadingAtom);

  const [localGroup, setLocalGroup] = useState(selectedGroup || '');
  const [localUnit, setLocalUnit] = useState(selectedUnit || '');

  useEffect(() => {
    setLocalGroup(selectedGroup || '');
    setLocalUnit(selectedUnit || '');
  }, [selectedGroup, selectedUnit, isModalOpen]);

  const isOpen = isContextRequired || isModalOpen;

  const handleClose = () => {
    if (isContextRequired) {
      logout();
    } else {
      setIsModalOpen(false);
    }
  };

  const handleContinue = () => {
    if (selectedGroup !== localGroup || selectedUnit !== localUnit) {
      setIsScheduleLoading(true);
    }
    
    setSelectedGroup(localGroup);
    setSelectedUnit(localUnit);

    if (!isContextRequired) {
      setAppView('dashboardTime');
    }

    if (isContextRequired) {
      setIsContextRequired(false);
    }
    setIsModalOpen(false);
  };

  const availableUnits = facilityData.find(g => g.id === localGroup)?.units || [];
  const canContinue = localGroup && localUnit;

  const handleGroupChange = (value: string) => {
    setLocalGroup(value);
    setLocalUnit('');
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={handleClose} title="Select Unit">
      <div className={styles.content}>
        <p className={styles.instructions}>
          Select your facility group and unit to establish your operational context.
        </p>
        <div className={styles.formGroup}>
          <label htmlFor="facility-group">Facility Group</label>
          <Select value={localGroup} onValueChange={handleGroupChange} placeholder="Select a group...">
            {facilityData.map((group) => (
              <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
            ))}
          </Select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="facility-unit">Facility Unit</label>
          <Select value={localUnit} onValueChange={setLocalUnit} placeholder={localGroup ? "Select a unit..." : "Select a group first"} disabled={!localGroup}>
            {availableUnits.map(unit => (
              <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
            ))}
          </Select>
        </div>
      </div>
      <footer className={styles.footer}>
        <Button variant="primary" onClick={handleContinue} disabled={!canContinue} className={styles.continueButton}>
          Continue
        </Button>
      </footer>
    </FullScreenModal>
  );
};