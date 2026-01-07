import { useMemo, useCallback, useState, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { desktopFilterAtom, activeDetailRecordAtom, selectedLiveRowsAtom, isDetailPanelOpenAtom, PanelData } from '../atoms';
import { LiveCheckRow } from '../types';
import { DataTable } from './DataTable';
import { BulkActionFooter } from './BulkActionFooter';
import { RowContextMenu } from './RowContextMenu';
import { StatusBadge, StatusBadgeType } from './StatusBadge';
import { addToastAtom } from '../../data/toastAtoms';
import { TOTAL_LIVE_RECORDS, loadLiveChecksPage } from '../mockLiveData';
import { COLUMN_WIDTHS } from './tableConstants';
import styles from './DataTable.module.css';

export const LiveMonitorView = () => {
    const filter = useAtomValue(desktopFilterAtom);
    const addToast = useSetAtom(addToastAtom);
    const [selectedRows, setSelectedRows] = useAtom(selectedLiveRowsAtom);
    const setIsPanelOpen = useSetAtom(isDetailPanelOpenAtom);

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

        // Apply unit filter (mock data uses room numbers like "101", "102")
        // For demo purposes, we'll keep all data visible unless specific unit filter

        // Sort by urgency, then by risk level (high risk first within same urgency)
        rows.sort((a, b) => {
            const statusOrder: Record<'missed' | 'due' | 'pending', number> = { missed: 0, due: 1, pending: 2 };
            const statusDiff = statusOrder[a.status] - statusOrder[b.status];
            if (statusDiff !== 0) return statusDiff;
            // High risk residents bubble to top
            if (a.hasHighRisk && !b.hasHighRisk) return -1;
            if (!a.hasHighRisk && b.hasHighRisk) return 1;
            return 0;
        });

        return rows;
    }, [filter.search, loadedData]);

    // Convert Set to TanStack's RowSelectionState
    const rowSelection: RowSelectionState = useMemo(() => {
        const selection: RowSelectionState = {};
        selectedRows.forEach((id) => {
            selection[id] = true;
        });
        return selection;
    }, [selectedRows]);

    const handleRowSelectionChange = useCallback(
        (updaterOrValue: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
            const newSelection = typeof updaterOrValue === 'function'
                ? updaterOrValue(rowSelection)
                : updaterOrValue;
            const newSet = new Set(Object.keys(newSelection).filter((k) => newSelection[k]));
            setSelectedRows(newSet);
        },
        [rowSelection, setSelectedRows]
    );

    const handleAlert = useCallback((row: LiveCheckRow) => {
        addToast({
            message: `Alert dispatched for ${row.location}`,
            icon: 'notifications_active',
            variant: 'info',
        });
    }, [addToast]);

    const handleBulkComment = () => {
        addToast({
            message: `Comment added for ${selectedRows.size} checks`,
            icon: 'check_circle',
            variant: 'success',
        });
        setSelectedRows(new Set());
    };

    const setDetailRecord = useSetAtom(activeDetailRecordAtom);

    const handleRowClick = useCallback((row: LiveCheckRow, event: React.MouseEvent) => {
        const isMeta = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;

        setSelectedRows((prev: Set<string>) => {
            const next = new Set(prev);
            if (isMeta) {
                if (next.has(row.id)) next.delete(row.id);
                else next.add(row.id);
            } else if (isShift && prev.size > 0) {
                // Shift click: select range from last selected
                const lastId = Array.from(prev).pop();
                if (lastId) {
                    const allIds = liveRows.map((r: LiveCheckRow) => r.id);
                    const startIdx = allIds.indexOf(lastId);
                    const endIdx = allIds.indexOf(row.id);
                    const range = allIds.slice(
                        Math.min(startIdx, endIdx),
                        Math.max(startIdx, endIdx) + 1
                    );
                    range.forEach((id: string) => next.add(id));
                }
            } else {
                // Standard click: clear and select one
                next.clear();
                next.add(row.id);
            }
            return next;
        });

        // Always update panel data for the clicked row
        const panelData: PanelData = {
            id: row.id,
            source: 'live',
            residentName: row.residents.map(r => r.name).join(', '),
            location: row.location,
            status: row.status,
            timeScheduled: row.originalCheck.dueDate || '',
            timeActual: row.lastCheckTime,
            officerName: row.lastCheckOfficer || '—',
            supervisorNote: row.supervisorNote,
            hasHighRisk: row.hasHighRisk,
            riskType: row.riskType,
        };
        setDetailRecord(panelData);

        // If it was a standard click (no modifiers), ensure panel is open
        if (!isMeta && !isShift) {
            setIsPanelOpen(true);
        }
    }, [liveRows, setSelectedRows, setDetailRecord, setIsPanelOpen]);

    const columns: ColumnDef<LiveCheckRow>[] = useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div className={styles.checkboxCell}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={table.getIsAllRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                            aria-label="Select all rows"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className={styles.checkboxCell}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={row.getIsSelected()}
                            onChange={row.getToggleSelectedHandler()}
                            aria-label={`Select row ${row.id}`}
                        />
                    </div>
                ),
                ...COLUMN_WIDTHS.CHECKBOX,
            },
            {
                id: 'resident',
                header: 'Resident',
                ...COLUMN_WIDTHS.RESIDENT,
                accessorFn: (row) => row.residents.map((r) => r.name).join(', '),
                cell: ({ row }) => (
                    <div className={styles.residentCell}>
                        {row.original.hasHighRisk && (
                            <span
                                className={`material-symbols-rounded ${styles.specialStatusIcon}`}
                                title={row.original.riskType || 'Special Status'}
                            >
                                warning
                            </span>
                        )}
                        <span>{row.original.residents.map((r) => r.name).join(', ')}</span>
                    </div>
                ),
            },
            {
                id: 'location',
                header: 'Room',
                accessorKey: 'location',
                ...COLUMN_WIDTHS.LOCATION,
            },
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
            {
                id: 'actual',
                header: 'Actual',
                ...COLUMN_WIDTHS.TIMESTAMP,
                accessorFn: (row) => row.timerText,
                cell: ({ row }) => {
                    if (row.original.status === 'missed') return '—';
                    return row.original.timerText;
                },
            },
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
            {
                id: 'checkedBy',
                header: 'Checked by',
                ...COLUMN_WIDTHS.OFFICER,
                accessorFn: (row) => row.lastCheckOfficer || '—',
            },
            {
                id: 'comments',
                header: 'Supervisor Comments',
                ...COLUMN_WIDTHS.NOTES,
                accessorFn: (row) => row.supervisorNote || '',
                cell: ({ row }) => (
                    <div className={styles.commentsCell}>
                        {row.original.supervisorNote ? (
                            <span
                                className={styles.supervisorComment}
                                title={row.original.supervisorNote}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>description</span>
                                {row.original.supervisorNote}
                            </span>
                        ) : (
                            <button className={styles.linkAction}>+</button>
                        )}
                    </div>
                ),
            },
            {
                id: 'spacer',
                size: 0,
                minSize: 0,
                enableResizing: false,
                header: () => null,
                cell: () => null,
            },
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
                        onAddNote={() => handleAlert(row.original)}
                        isVerified={false}
                    />
                ),
            },
        ],
        [handleAlert]
    );

    return (
        <>
            <DataTable
                data={liveRows}
                columns={columns}
                enableRowSelection
                rowSelection={rowSelection}
                onRowSelectionChange={handleRowSelectionChange}
                getRowId={(row) => row.id}
                totalCount={TOTAL_LIVE_RECORDS}
                isLoading={isLoading}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                onRowClick={handleRowClick}
            />

            {selectedRows.size > 0 && (
                <BulkActionFooter
                    selectedCount={selectedRows.size}
                    onAction={handleBulkComment}
                    onClear={() => setSelectedRows(new Set())}
                    actionLabel="Comment"
                />
            )}
        </>
    );
};
