// src/features/Overlays/FacilitySelectionModal.tsx
import { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  isContextSelectionRequiredAtom,
  isContextSelectionModalOpenAtom,
  selectedFacilityGroupAtom,
  selectedFacilityUnitAtom,
  logoutAtom,
  appViewAtom, // Import the appViewAtom to control the side menu
} from '../../data/atoms';
import { FullScreenModal } from '../../components/FullScreenModal';
import { Button } from '../../components/Button';
import { Select, SelectItem } from '../../components/Select';
import styles from './FacilitySelectionModal.module.css';

const facilityData = {
  'death-star': { name: 'Star Wars: Death Star', units: ['AA-23', 'Detention Block', 'Trash Compactor'] },
  'rocinante': { name: 'The Expanse: Rocinante', units: ['Cockpit', 'Galley', 'Engineering'] },
  'hogwarts': { name: 'Harry Potter: Hogwarts', units: ['Gryffindor Tower', 'Slytherin Dungeon', 'The Great Hall'] },
};

export const FacilitySelectionModal = () => {
  const [isContextRequired, setIsContextRequired] = useAtom(isContextSelectionRequiredAtom);
  const [isModalOpen, setIsModalOpen] = useAtom(isContextSelectionModalOpenAtom);
  const [selectedGroup, setSelectedGroup] = useAtom(selectedFacilityGroupAtom);
  const [selectedUnit, setSelectedUnit] = useAtom(selectedFacilityUnitAtom);
  const logout = useSetAtom(logoutAtom);
  const setAppView = useSetAtom(appViewAtom); // Get the setter for the app view

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
    setSelectedGroup(localGroup);
    setSelectedUnit(localUnit);

    // UX REFINEMENT: If the context was changed via the side menu (i.e., it was not the
    // initial mandatory selection), close the side menu to reveal the dashboard.
    if (!isContextRequired) {
      setAppView('dashboardTime');
    }

    if (isContextRequired) {
      setIsContextRequired(false);
    }
    setIsModalOpen(false);
  };

  const availableUnits = localGroup ? facilityData[localGroup as keyof typeof facilityData]?.units || [] : [];
  const canContinue = localGroup && localUnit;

  const handleGroupChange = (value: string) => {
    setLocalGroup(value);
    setLocalUnit('');
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={handleClose} title="Select Your Unit">
      <div className={styles.content}>
        <p className={styles.instructions}>
          Please select your facility group and unit to begin your shift.
        </p>
        <div className={styles.formGroup}>
          <label htmlFor="facility-group">Facility Group</label>
          <Select value={localGroup} onValueChange={handleGroupChange} placeholder="Select a group...">
            {Object.entries(facilityData).map(([id, data]) => (
              <SelectItem key={id} value={id}>{data.name}</SelectItem>
            ))}
          </Select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="facility-unit">Facility Unit</label>
          <Select value={localUnit} onValueChange={setLocalUnit} placeholder={localGroup ? "Select a unit..." : "Select a group first"} disabled={!localGroup}>
            {availableUnits.map(unit => (
              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
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