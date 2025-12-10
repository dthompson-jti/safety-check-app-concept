// src/features/Workflow/StatusSelectionSheet.tsx
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

    const handleSelect = (value: string) => {
        triggerHaptic('selection');
        onSelect(value);
        onClose();
    };

    const handleOverlayClick = () => {
        onClose();
    };

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
                    />

                    {/* Sheet Content */}
                    <motion.div
                        className={styles.content}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    >
                        {/* Handle bar per Bottom Sheet Handle Contract */}
                        <div className={styles.handleContainer}>
                            <div className={styles.handle} />
                        </div>

                        {/* Header */}
                        <div className={styles.header}>
                            <h3 className={styles.headerTitle}>Select Status</h3>
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
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className={getContainerClass()}>
                                    {options.map((option) => (
                                        <button
                                            key={option.value}
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
