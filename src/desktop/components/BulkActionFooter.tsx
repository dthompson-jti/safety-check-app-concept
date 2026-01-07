import { Button } from '../../components/Button';
import styles from './BulkActionFooter.module.css';

interface BulkActionFooterProps {
    selectedCount: number;
    onAction: () => void;
    onClear: () => void;
    actionLabel?: string;
    actionIcon?: string;
}

export const BulkActionFooter = ({
    selectedCount,
    onAction,
    onClear,
    actionLabel = 'Add Note',
    actionIcon = 'edit_note',
}: BulkActionFooterProps) => {
    return (
        <div className={styles.footer}>
            {/* Count section with dismiss */}
            <div className={styles.countSection}>
                <Button
                    variant="on-solid"
                    size="s"
                    iconOnly
                    onClick={onClear}
                    aria-label="Clear selection"
                >
                    <span className="material-symbols-rounded">close</span>
                </Button>
                <span className={styles.count}>
                    {selectedCount} Selected
                </span>
            </div>

            <div className={styles.divider} />

            {/* Primary action */}
            <Button
                variant="on-solid"
                size="s"
                onClick={onAction}
            >
                <span className="material-symbols-rounded">{actionIcon}</span>
                {actionLabel}
            </Button>

            <div className={styles.divider} />

            {/* Overflow menu */}
            <Button
                variant="on-solid"
                size="s"
                iconOnly
                aria-label="More actions"
            >
                <span className="material-symbols-rounded">more_vert</span>
            </Button>
        </div>
    );
};
