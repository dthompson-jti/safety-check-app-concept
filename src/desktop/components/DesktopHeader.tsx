// src/desktop/components/DesktopHeader.tsx

import { useAtomValue } from 'jotai';
import { desktopViewAtom } from '../atoms';
import { appConfigAtom } from '../../data/atoms';
import { DesktopTabGroup } from './DesktopTabGroup';
import { CountdownWidget } from './CountdownWidget';
import styles from './DesktopHeader.module.css';

interface DesktopHeaderProps {
    onTogglePanel: () => void;
    isPanelOpen: boolean;
}

export const DesktopHeader = ({ onTogglePanel, isPanelOpen }: DesktopHeaderProps) => {
    const view = useAtomValue(desktopViewAtom);
    const appConfig = useAtomValue(appConfigAtom);

    return (
        <header className={styles.header} data-header-style={appConfig.headerStyle}>
            {/* Left: Title */}
            <div className={styles.leftSection}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Safeguard Room Checks</h1>
                </div>
            </div>

            {/* Center: Tabs (NEW!) */}
            <div className={styles.centerSection}>
                <DesktopTabGroup />
            </div>

            {/* Right: Countdown Widget (Live) or Actions (Historical) */}
            <div className={styles.rightSection}>
                {view === 'live' && <CountdownWidget />}

                {view === 'historical' && (
                    <>
                        <button
                            className="btn"
                            data-variant="secondary"
                            data-size="s"
                            aria-label="Export data"
                        >
                            Export
                        </button>
                        <button
                            className="btn"
                            data-variant="secondary"
                            data-size="s"
                            data-icon-only="true"
                            aria-label="More actions"
                        >
                            <span className="material-symbols-rounded">more_vert</span>
                        </button>

                        <button
                            className={`btn ${isPanelOpen ? 'active' : ''}`}
                            data-variant="secondary"
                            data-size="s"
                            data-icon-only="true"
                            onClick={onTogglePanel}
                            aria-label="Toggle side panel"
                            aria-pressed={isPanelOpen}
                            style={isPanelOpen ? { borderColor: 'var(--control-border-primary)' } : undefined}
                        >
                            <span className="material-symbols-rounded">
                                {isPanelOpen ? 'right_panel_close' : 'right_panel_open'}
                            </span>
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};
