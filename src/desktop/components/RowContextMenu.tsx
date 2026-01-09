// src/desktop/components/RowContextMenu.tsx

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './RowContextMenu.module.css';

interface RowAction {
    label: string;
    icon: string;
    onClick: () => void;
    destructive?: boolean;
}

interface RowContextMenuProps {
    actions: RowAction[];
}

export const RowContextMenu = ({ actions }: RowContextMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + 4,
                left: rect.right - 220, // Menu min-width is 220px, align right edges
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
                        data-platform="desktop"
                        style={{
                            position: 'fixed',
                            top: menuPosition.top,
                            left: menuPosition.left,
                        }}
                    >
                        {actions.map((action, idx) => (
                            <div key={action.label}>
                                <button
                                    className={`${styles.menuItem} ${action.destructive ? styles.destructive : ''}`}
                                    onClick={() => handleAction(action.onClick)}
                                >
                                    <span className="material-symbols-rounded">{action.icon}</span>
                                    <span>{action.label}</span>
                                </button>
                                {idx < actions.length - 1 && <div className={styles.separator} />}
                            </div>
                        ))}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};
