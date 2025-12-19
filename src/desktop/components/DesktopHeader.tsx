// src/desktop/components/DesktopHeader.tsx

import { useState } from 'react';
import { useAtom } from 'jotai';
import { desktopViewAtom } from '../atoms';
import { DesktopView } from '../types';
import styles from './DesktopHeader.module.css';

interface DesktopHeaderProps {
    onTogglePanel: () => void;
    isPanelOpen: boolean;
}

export const DesktopHeader = ({ onTogglePanel, isPanelOpen }: DesktopHeaderProps) => {
    const [view, setView] = useAtom(desktopViewAtom);
    const [showOverflowMenu, setShowOverflowMenu] = useState(false);

    const handleViewChange = (newView: DesktopView) => {
        setView(newView);
    };

    return (
        <header className={styles.header}>
            {/* Left: Title + View Toggle */}
            <div className={styles.leftSection}>
                <h1 className={styles.title}>Safeguard Room Checks</h1>

                <div className={styles.viewToggle}>
                    <button
                        className={`${styles.viewButton} ${view === 'live' ? styles.active : ''}`}
                        onClick={() => handleViewChange('live')}
                    >
                        <span className="material-symbols-rounded">radio_button_checked</span>
                        Live
                    </button>
                    <button
                        className={`${styles.viewButton} ${view === 'historical' ? styles.active : ''}`}
                        onClick={() => handleViewChange('historical')}
                    >
                        <span className="material-symbols-rounded">history</span>
                        Historical
                    </button>
                </div>
            </div>

            {/* Right: Actions */}
            <div className={styles.actions}>
                {/* Export button */}
                <button className={styles.outlineButton}>
                    Export
                </button>

                {/* Overflow menu */}
                <div className={styles.menuContainer}>
                    <button
                        className={styles.iconButton}
                        onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                        aria-label="More options"
                    >
                        <span className="material-symbols-rounded">more_vert</span>
                    </button>
                    {showOverflowMenu && (
                        <>
                            <div className={styles.backdrop} onClick={() => setShowOverflowMenu(false)} />
                            <div className={styles.menu}>
                                <button className={styles.menuItem} onClick={() => setShowOverflowMenu(false)}>
                                    <span className="material-symbols-rounded">download</span>
                                    Export CSV
                                </button>
                                <button className={styles.menuItem} onClick={() => setShowOverflowMenu(false)}>
                                    <span className="material-symbols-rounded">print</span>
                                    Print Report
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Side panel toggle */}
                <button
                    className={`${styles.iconButton} ${isPanelOpen ? styles.active : ''}`}
                    onClick={onTogglePanel}
                    aria-label="Toggle side panel"
                    aria-pressed={isPanelOpen}
                >
                    <span className="material-symbols-rounded">
                        {isPanelOpen ? 'right_panel_close' : 'right_panel_open'}
                    </span>
                </button>
            </div>
        </header>
    );
};
