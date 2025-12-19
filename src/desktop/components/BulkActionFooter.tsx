// src/desktop/components/BulkActionFooter.tsx

import styles from './BulkActionFooter.module.css';

interface BulkActionFooterProps {
    selectedCount: number;
    onAction: () => void;
    onClear: () => void;
}

export const BulkActionFooter = ({ selectedCount, onAction, onClear }: BulkActionFooterProps) => {
    return (
        <div className={styles.footer}>
            {/* Count section with dismiss */}
            <div className={styles.countSection}>
                <button
                    className={styles.dismissButton}
                    onClick={onClear}
                    aria-label="Clear selection"
                >
                    <span className="material-symbols-rounded">close</span>
                </button>
                <span className={styles.count}>
                    {selectedCount} Selected
                </span>
            </div>

            <div className={styles.divider} />

            {/* Primary action */}
            <button className={`${styles.actionButton} ${styles.primary}`} onClick={onAction}>
                <span className="material-symbols-rounded">edit_note</span>
                Add Note
            </button>

            {/* Overflow menu */}
            <button className={styles.overflowButton} aria-label="More actions">
                <span className="material-symbols-rounded">more_vert</span>
            </button>
        </div>
    );
};
