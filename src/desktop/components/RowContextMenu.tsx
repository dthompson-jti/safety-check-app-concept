// src/desktop/components/RowContextMenu.tsx

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './RowContextMenu.module.css';

interface RowContextMenuProps {
    onAddNote: () => void;
    isVerified: boolean;
}

export const RowContextMenu = ({ onAddNote, isVerified }: RowContextMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + 4,
                left: rect.right - 180, // Menu width is ~180px, align to right edge
            });
        }
        setIsOpen(!isOpen);
    };

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    // Close on scroll or resize
    useEffect(() => {
        if (!isOpen) return;
        const handleClose = () => setIsOpen(false);
        window.addEventListener('scroll', handleClose, true);
        window.addEventListener('resize', handleClose);
        return () => {
            window.removeEventListener('scroll', handleClose, true);
            window.removeEventListener('resize', handleClose);
        };
    }, [isOpen]);

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

            {isOpen && createPortal(
                <>
                    <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
                    <div
                        className={styles.menu}
                        style={{
                            position: 'fixed',
                            top: menuPosition.top,
                            left: menuPosition.left,
                        }}
                    >
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
                </>,
                document.body
            )}
        </div>
    );
};
