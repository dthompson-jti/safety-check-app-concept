// src/desktop/components/DesktopToolbar.tsx

import { useAtom, useAtomValue } from 'jotai';
import { desktopViewAtom, desktopFilterAtom } from '../atoms';
import { SearchInput } from '../../components/SearchInput';
import { Select, SelectItem } from '../../components/Select';
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


    const handleStatusFilterChange = (val: string) => {
        setFilter((prev) => ({
            ...prev,
            statusFilter: val as StatusFilterValue
        }));
    };

    const handleUnitChange = (val: string) => {
        setFilter((prev) => ({ ...prev, unit: val }));
    };

    return (
        <div className={styles.toolbar}>
            {/* Left Side: Search + Advanced */}
            <div className={styles.leftSection}>
                <SearchInput
                    value={filter.search}
                    onChange={(val) => setFilter((prev) => ({ ...prev, search: val }))}
                    placeholder="Search residents..."
                    variant="standalone"
                />

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
                <div style={{ width: 140 }}>
                    <Select
                        value={filter.unit}
                        onValueChange={handleUnitChange}
                        placeholder="Unit"
                    >
                        {UNIT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                {/* Status Filter (Historical only) */}
                {view === 'historical' && (
                    <div style={{ width: 140 }}>
                        <Select
                            value={filter.statusFilter}
                            onValueChange={handleStatusFilterChange}
                            placeholder="Status"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                )}
            </div>
        </div>
    );
};
