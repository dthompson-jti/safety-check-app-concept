// src/desktop/components/DesktopToolbar.tsx

import { useAtom, useAtomValue } from 'jotai';
import { desktopViewAtom, desktopFilterAtom } from '../atoms';
import styles from './DesktopToolbar.module.css';

type StatusFilterValue = 'all' | 'missed' | 'late';

const STATUS_OPTIONS: { value: StatusFilterValue; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'missed', label: 'Missed Only' },
    { value: 'late', label: 'Late Only' },
];

const UNIT_OPTIONS = [
    { value: 'all', label: 'All Units' },
    { value: 'A', label: 'Unit A' },
    { value: 'B', label: 'Unit B' },
    { value: 'C', label: 'Unit C' },
];

export const DesktopToolbar = () => {
    const view = useAtomValue(desktopViewAtom);
    const [filter, setFilter] = useAtom(desktopFilterAtom);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter((prev) => ({ ...prev, search: e.target.value }));
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilter((prev) => ({
            ...prev,
            statusFilter: e.target.value as StatusFilterValue
        }));
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilter((prev) => ({ ...prev, unit: e.target.value }));
    };

    const currentStatusLabel = STATUS_OPTIONS.find(o => o.value === filter.statusFilter)?.label || 'Status';
    const currentUnitLabel = UNIT_OPTIONS.find(o => o.value === filter.unit)?.label || 'Unit';

    return (
        <div className={styles.toolbar}>
            {/* Left Side: Search + Advanced */}
            <div className={styles.leftSection}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search Checks"
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
                    <span className={`material-symbols-rounded ${styles.searchIcon}`}>search</span>
                </div>

                {/* Advanced search (placeholder) */}
                <button
                    className="btn"
                    data-variant="secondary"
                    data-size="s"
                    data-icon-only="true"
                    aria-label="Advanced search"
                >
                    <span className="material-symbols-rounded">tune</span>
                </button>
            </div>

            {/* Right Side: Quick Filters */}
            <div className={styles.filterChips}>
                {/* Unit Filter */}
                <div className={`${styles.filterChip} ${filter.unit !== 'all' ? styles.active : ''}`}>
                    <select
                        className={styles.filterSelect}
                        value={filter.unit}
                        onChange={handleUnitChange}
                    >
                        {UNIT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <span className={styles.filterLabel}>{currentUnitLabel}</span>
                    <span className="material-symbols-rounded">expand_more</span>
                </div>

                {/* Status Filter (Historical only) */}
                {view === 'historical' && (
                    <div className={`${styles.filterChip} ${filter.statusFilter !== 'all' ? styles.active : ''}`}>
                        <select
                            className={styles.filterSelect}
                            value={filter.statusFilter}
                            onChange={handleStatusFilterChange}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <span className={styles.filterLabel}>{currentStatusLabel}</span>
                        <span className="material-symbols-rounded">expand_more</span>
                    </div>
                )}
            </div>
        </div>
    );
};
