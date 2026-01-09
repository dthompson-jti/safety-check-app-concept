import { useMemo, useCallback, useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { ColumnDef } from '@tanstack/react-table';
import { desktopFilterAtom } from '../atoms';
import { LiveCheckRow } from '../types';
import { DataTable } from './DataTable';
import { RowContextMenu } from './RowContextMenu';
import { StatusBadge, StatusBadgeType } from './StatusBadge';
import { TOTAL_LIVE_RECORDS, loadLiveChecksPage } from '../mockLiveData';
import { COLUMN_WIDTHS } from './tableConstants';
import styles from './DataTable.module.css';

export const LiveMonitorView = () => {
    const filter = useAtomValue(desktopFilterAtom);

    // Pagination State
    const [loadedData, setLoadedData] = useState<LiveCheckRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(0);

    // Initial load
    useEffect(() => {
        setIsLoading(true);
        void loadLiveChecksPage(0, 50).then(({ data, nextCursor }) => {
            setLoadedData(data);
            setCursor(nextCursor ?? 0);
            setHasMore(nextCursor !== null);
            setIsLoading(false);
        });
    }, []);

    const handleLoadMore = useCallback(() => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        void loadLiveChecksPage(cursor, 50).then(({ data, nextCursor }) => {
            setLoadedData((prev) => [...prev, ...data]);
            setCursor(nextCursor ?? cursor);
            setHasMore(nextCursor !== null);
            setIsLoading(false);
        });
    }, [cursor, isLoading, hasMore]);

    // Filter and sort loaded data
    const liveRows = useMemo(() => {
        let rows = [...loadedData];

        // Apply search filter
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            rows = rows.filter((row) => {
                const matchesResident = row.residents.some((r) =>
                    r.name.toLowerCase().includes(searchLower)
                );
                const matchesLocation = row.location.toLowerCase().includes(searchLower);
                return matchesResident || matchesLocation;
            });
        }

        // Sort by urgency, then by risk level (high risk first within same urgency)
        rows.sort((a, b) => {
            const statusOrder: Record<string, number> = { missed: 0, due: 1, pending: 2, overdue: 0 };
            const aStatus = a.status === 'missed' ? 'overdue' : a.status;
            const bStatus = b.status === 'missed' ? 'overdue' : b.status;
            const statusDiff = (statusOrder[aStatus] ?? 99) - (statusOrder[bStatus] ?? 99);
            if (statusDiff !== 0) return statusDiff;
            // High risk residents bubble to top
            if (a.hasHighRisk && !b.hasHighRisk) return -1;
            if (!a.hasHighRisk && b.hasHighRisk) return 1;
            return 0;
        });

        return rows;
    }, [filter.search, loadedData]);

    const columns: ColumnDef<LiveCheckRow>[] = useMemo(
        () => [
            // 1. Resident column with hyperlink and alert icon
            {
                id: 'resident',
                header: 'Resident',
                ...COLUMN_WIDTHS.RESIDENT,
                accessorFn: (row) => row.residents.map((r) => r.name).join(', '),
                cell: ({ row }) => (
                    <div className={styles.residentCell}>
                        <a
                            href="#"
                            className={styles.linkText}
                            onClick={(e) => e.preventDefault()}
                        >
                            {row.original.residents.map((r) => r.name).join(', ')}
                        </a>
                        {row.original.hasHighRisk && (
                            <span
                                className={`material-symbols-rounded ${styles.alertIconInline}`}
                                title={row.original.riskType || 'Special Status'}
                            >
                                warning
                            </span>
                        )}
                    </div>
                ),
            },
            // 2. Group column
            {
                id: 'group',
                header: 'Group',
                accessorKey: 'group',
                ...COLUMN_WIDTHS.GROUP,
            },
            // 3. Unit column
            {
                id: 'unit',
                header: 'Unit',
                accessorKey: 'unit',
                ...COLUMN_WIDTHS.UNIT,
            },
            // 4. Room column (location)
            {
                id: 'location',
                header: 'Room',
                ...COLUMN_WIDTHS.LOCATION,
                accessorKey: 'location',
            },
            // 5. Scheduled column
            {
                id: 'scheduled',
                header: 'Scheduled',
                ...COLUMN_WIDTHS.TIMESTAMP,
                accessorFn: () => {
                    // Constant date for mock sorting/display
                    return new Date().toISOString();
                },
                cell: () => {
                    const now = new Date();
                    return now.toLocaleString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    });
                },
            },
            // 6. Status column
            {
                id: 'status',
                header: 'Status',
                ...COLUMN_WIDTHS.STATUS,
                accessorKey: 'status',
                cell: ({ row }) => {
                    return (
                        <StatusBadge status={row.original.status as StatusBadgeType} />
                    );
                },
            },
            // Spacer to push remaining columns to the right
            {
                id: 'spacer',
                size: 0,
                minSize: 0,
                enableResizing: false,
                header: () => null,
                cell: () => null,
            },
            // Actions column (pinned right)
            {
                id: 'actions',
                header: () => (
                    <div className={styles.checkboxCell}>
                        <span className="material-symbols-rounded" style={{ fontSize: '20px', color: 'var(--surface-fg-tertiary)' }}>
                            more_vert
                        </span>
                    </div>
                ),
                ...COLUMN_WIDTHS.ACTIONS,
                enableSorting: false,
                cell: ({ row }) => (
                    <RowContextMenu
                        actions={[
                            {
                                label: 'View resident',
                                icon: 'person',
                                onClick: () => console.log('View resident', row.original.id),
                            },
                            {
                                label: 'Manage room',
                                icon: 'door_front',
                                onClick: () => console.log('Manage room', row.original.location),
                            }
                        ]}
                    />
                ),
            },
        ],
        []
    );

    return (
        <DataTable
            data={liveRows}
            columns={columns}
            getRowId={(row) => row.id}
            totalCount={TOTAL_LIVE_RECORDS}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onRowClick={undefined}
        />
    );
};
