// src/components/BottomSheet.tsx
import React from 'react';
import { Drawer } from 'vaul';
import styles from './BottomSheet.module.css';

// --- Main Component Root ---
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string; // Allow passing title directly
}

const BottomSheetRoot = ({ isOpen, onClose, children, title }: BottomSheetProps) => (
  <Drawer.Root open={isOpen} onClose={onClose} dismissible={true}>
    <Drawer.Portal>
      {/* DEFINITIVE FIX: The Drawer.Overlay is restored here. This ensures that any
          bottom sheet using this component will now render the dark backdrop. */}
      <Drawer.Overlay className={styles.overlay} />
      <Drawer.Content className={styles.content}>
        <div className={styles.handleContainer}>
          <div className={styles.handle} />
        </div>
        {/* Render title if provided */}
        {title && (
          <div className={styles.header}>
            <Drawer.Title asChild>
              <h2>{title}</h2>
            </Drawer.Title>
          </div>
        )}
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
);

// --- Compound Component for Custom Content Layouts ---
const BottomSheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const combinedClassName = [styles.customContentContainer, className || ''].join(' ').trim();
  return (
    <div ref={ref} className={combinedClassName} {...props}>
      {children}
    </div>
  );
});
BottomSheetContent.displayName = 'BottomSheet.Content';

// --- Exporting the compound component ---
export const BottomSheet = Object.assign(BottomSheetRoot, {
  Content: BottomSheetContent,
});