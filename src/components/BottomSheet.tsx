// src/components/BottomSheet.tsx
import React from 'react';
import { Drawer } from 'vaul';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children }) => {
  return (
    <Drawer.Root open={isOpen} onClose={onClose} dismissible={true}>
      <Drawer.Portal>
        <Drawer.Overlay className="bottom-sheet-overlay" />
        <Drawer.Content className="bottom-sheet-content">
          <div className="bottom-sheet-handle" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};