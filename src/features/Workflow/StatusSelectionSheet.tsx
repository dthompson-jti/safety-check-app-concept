// src/features/Workflow/StatusSelectionSheet.tsx
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ActionListItem } from '../../components/ActionListItem';
import { useHaptics } from '../../data/useHaptics';
import styles from './StatusSelectionSheet.module.css';

interface StatusOption {
    value: string;
    label: string;
}

interface StatusSelectionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (status: string) => void;
    options: readonly StatusOption[];
    layout: 'row' | 'column' | 'grid';
}

export const StatusSelectionSheet = ({
    isOpen,
    onClose,
    onSelect,
    options,
    layout,
}: StatusSelectionSheetProps) => {
    const { trigger: triggerHaptic } = useHaptics();
    const sheetRef = useRef<HTMLDivElement>(null);
    const firstButtonRef = useRef<HTMLButtonElement | null>(null);

    const handleSelect = (value: string) => {
        triggerHaptic('selection');
        onSelect(value);
        onClose();
    };

    const handleOverlayClick = () => {
        onClose();
    };

    // Accessibility: Focus management and Escape key
    useEffect(() => {
        if (isOpen) {
            // Move focus to the first button for immediate keyboard accessibility
            // Using a small timeout to ensure animation frame availability
            const timer = setTimeout(() => {
                firstButtonRef.current?.focus();
            }, 50);

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    onClose();
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => {
                clearTimeout(timer);
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, onClose]);

    // Calculate if we need a dead cell for grid layout (odd number of items)
    const needsDeadCell = layout === 'grid' && options.length % 2 !== 0;

    // Determine which container class to use
    const getContainerClass = () => {
        switch (layout) {
            case 'row':
                return styles.rowContainer;
            case 'column':
                return styles.columnList;
            case 'grid':
                return styles.gridContainer;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleOverlayClick}
                        aria-hidden="true" // Backdrop is purely visual/click target
                    />

                    {/* Sheet Content */}
                    <motion.div
                        ref={sheetRef}
                        className={styles.content}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="status-sheet-title"
                    >
                        {/* Handle bar per Bottom Sheet Handle Contract */}
                        <div className={styles.handleContainer}>
                            <div className={styles.handle} />
                        </div>

                        {/* Header */}
                        <div className={styles.header}>
                            <h3 id="status-sheet-title" className={styles.headerTitle}>Select Status</h3>
                        </div>

                        {/* Content */}
                        <div className={styles.listContainer}>
                            {layout === 'column' ? (
                                <div className={getContainerClass()}>
                                    {options.map((option) => (
                                        <ActionListItem
                                            key={option.value}
                                            label={option.label}
                                            onClick={() => handleSelect(option.value)}
                                        // ActionListItem needs to forward refs if we want to focus it directly,
                                        // but checking its implementation, it likely returns a button.
                                        // For safety, if ActionListItem doesn't accept ref, we rely on the grid buttons below 
                                        // or user tab navigation. However, for "Mark All", grid is more common.
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className={getContainerClass()}>
                                    {options.map((option, index) => (
                                        <button
                                            key={option.value}
                                            ref={index === 0 ? firstButtonRef : undefined}
                                            className={styles.gridButton}
                                            onClick={() => handleSelect(option.value)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                    {needsDeadCell && <div className={styles.deadCell} />}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
