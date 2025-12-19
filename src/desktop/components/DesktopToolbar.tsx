// src/desktop/components/DesktopToolbar.tsx

import { useAtom, useAtomValue } from 'jotai';
import { desktopViewAtom, desktopFilterAtom } from '../atoms';
import styles from './DesktopToolbar.module.css';

export const DesktopToolbar = () => {
    const view = useAtomValue(desktopViewAtom);
    const [filter, setFilter] = useAtom(desktopFilterAtom);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter((prev) => ({ ...prev, search: e.target.value }));
    };

    const handleMissedOnlyChange = () => {
        setFilter((prev) => ({ ...prev, showMissedOnly: !prev.showMissedOnly }));
    };

    return (
        <div className={styles.toolbar}>
            {/* Left Side: Search + Advanced */}
            <div className={styles.leftSection}>
                <div className={styles.searchContainer}>
                    <span className="material-symbols-rounded">search</span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search room checks"
                        value={filter.search}
                        onChange={handleSearchChange}
                    />
                    {filter.search && (
                        <button
                            className={styles.clearButton}
                            onClick={() => setFilter((prev) => ({ ...prev, search: '' }))}
                            aria-label="Clear search"
                        >
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    )}
                </div>

                {/* Advanced search (placeholder) */}
                <button className={styles.iconButton} aria-label="Advanced search">
                    <span className="material-symbols-rounded">tune</span>
                </button>
            </div>

            {/* Right Side: Quick Filters */}
            <div className={styles.filterChips}>
                <button className={styles.filterChip}>
                    Facility Area
                    <span className="material-symbols-rounded">expand_more</span>
                </button>
                <button className={styles.filterChip}>
                    Comments
                    <span className="material-symbols-rounded">expand_more</span>
                </button>
                {view === 'historical' && (
                    <button
                        className={`${styles.filterChip} ${filter.showMissedOnly ? styles.active : ''}`}
                        onClick={handleMissedOnlyChange}
                    >
                        Status
                        <span className="material-symbols-rounded">
                            {filter.showMissedOnly ? 'check' : 'expand_more'}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};
