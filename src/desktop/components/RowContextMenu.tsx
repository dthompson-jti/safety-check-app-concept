// src/desktop/components/RowContextMenu.tsx

import { useState, useRef } from 'react';
import styles from './RowContextMenu.module.css';

interface RowContextMenuProps {
    onAddNote: () => void;
    isVerified: boolean;
}

export const RowContextMenu = ({ onAddNote, isVerified }: RowContextMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className={styles.container}>
            <button
                ref={buttonRef}
                className={styles.trigger}
                onClick={handleToggle}
                aria-label="Row actions"
            >
                <span className="material-symbols-rounded">more_vert</span>
            </button>

            {isOpen && (
                <>
                    <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
                    <div className={styles.menu}>
                        <button
                            className={styles.menuItem}
                            onClick={() => handleAction(onAddNote)}
                        >
                            <span className="material-symbols-rounded">edit_note</span>
                            <span>{isVerified ? 'Edit Note' : 'Add Note'}</span>
                        </button>
                        <div className={styles.separator} />
                        <button
                            className={`${styles.menuItem} ${styles.destructive}`}
                            onClick={() => handleAction(() => console.log('Flag for review'))}
                        >
                            <span className="material-symbols-rounded">flag</span>
                            <span>Flag for Review</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
