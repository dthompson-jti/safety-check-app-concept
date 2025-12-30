import { useMemo, useCallback, useState, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import {
    filteredHistoricalChecksAtom,
    selectedHistoryRowsAtom,
    supervisorNoteModalAtom,
} from '../atoms';
import { HistoricalCheck } from '../types';
import { DataTable } from './DataTable';
import { BulkActionFooter } from './BulkActionFooter';
import { RowContextMenu } from './RowContextMenu';
import { StatusBadge, StatusBadgeType } from './StatusBadge';
import { TOTAL_HISTORICAL_RECORDS, loadHistoricalChecksPage } from '../mockHistoricalData';
import styles from './DataTable.module.css';

const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

const formatVariance = (minutes: number): string => {
    if (!isFinite(minutes)) return 'Missed';
    if (minutes <= 2) return 'On Time';
    return `+${minutes}m late`;
};

export const HistoricalReviewView = () => {
    const [selectedRows, setSelectedRows] = useAtom(selectedHistoryRowsAtom);
    const setModalState = useSetAtom(supervisorNoteModalAtom);

    // Pagination State
    const [loadedData, setLoadedData] = useState<HistoricalCheck[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(0);

    // Initial load
    useEffect(() => {
        setIsLoading(true);
        loadHistoricalChecksPage(0, 50).then(({ data, nextCursor }) => {
            setLoadedData(data);
            setCursor(nextCursor ?? 0);
            setHasMore(nextCursor !== null);
            setIsLoading(false);
        });
    }, []);

    const handleLoadMore = useCallback(() => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        loadHistoricalChecksPage(cursor, 50).then(({ data, nextCursor }) => {
            setLoadedData((prev) => [...prev, ...data]);
            setCursor(nextCursor ?? cursor);
            setHasMore(nextCursor !== null);
            setIsLoading(false);
        });
    }, [cursor, isLoading, hasMore]);

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

    const handleBulkAction = () => {
        setModalState({
            isOpen: true,
            selectedIds: Array.from(selectedRows),
        });
    };

    const handleClearSelection = () => {
        setSelectedRows(new Set<string>());
    };

    const handleOpenNoteModal = useCallback((checkId: string) => {
        setModalState({
            isOpen: true,
            selectedIds: [checkId],
        });
    }, [setModalState]);

    const columns: ColumnDef<HistoricalCheck>[] = useMemo(
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
                size: 44,
                enableResizing: false,
            },
            {
                id: 'scheduled',
                header: 'Scheduled',
                accessorFn: (row) => formatTime(row.scheduledTime),
                size: 110,
            },
            {
                id: 'actual',
                header: 'Actual',
                accessorFn: (row) => row.actualTime ? formatTime(row.actualTime) : '',
                cell: ({ row }) =>
                    row.original.actualTime ? formatTime(row.original.actualTime) : '—',
                size: 110,
            },
            {
                id: 'variance',
                header: 'Variance',
                size: 120,
                accessorKey: 'varianceMinutes',
                cell: ({ row }) => {
                    const variance = row.original.varianceMinutes;
                    let className = styles.timerCell;
                    if (!isFinite(variance)) className += ` ${styles.alert}`;
                    else if (variance > 2) className += ` ${styles.warning}`;
                    else className += ` ${styles.neutral}`;

                    return <span className={className}>{formatVariance(variance)}</span>;
                },
            },
            {
                id: 'status',
                header: 'Status',
                size: 100,
                accessorKey: 'status',
                cell: ({ row }) => (
                    <StatusBadge status={row.original.status as StatusBadgeType} />
                ),
            },
            {
                id: 'resident',
                header: 'Resident',
                size: 240,
                accessorFn: (row) => row.residents.map((r) => r.name).join(', '),
            },
            {
                id: 'notes',
                header: 'Notes',
                size: 80,
                accessorFn: (row) => `${row.officerNote || ''} ${row.supervisorNote || ''}`,
                cell: ({ row }) => (
                    <div className={styles.notesCell}>
                        {row.original.officerNote && (
                            <span
                                className={`material-symbols-rounded ${styles.noteIcon}`}
                                title={row.original.officerNote}
                            >
                                description
                            </span>
                        )}
                        {row.original.supervisorNote && (
                            <span
                                className={`material-symbols-rounded ${styles.noteIcon}`}
                                title={row.original.supervisorNote}
                            >
                                comment
                            </span>
                        )}
                    </div>
                ),
            },
            {
                id: 'review',
                header: 'Review',
                size: 120,
                accessorKey: 'reviewStatus',
                cell: ({ row }) => {
                    if (row.original.reviewStatus === 'verified') {
                        return (
                            <span className={styles.verifiedStatus}>
                                <span className="material-symbols-rounded">check_circle</span>
                                Verified
                            </span>
                        );
                    }
                    return (
                        <button
                            className={styles.linkAction}
                            onClick={() => handleOpenNoteModal(row.original.id)}
                        >
                            Add Note
                        </button>
                    );
                },
            },
            {
                id: 'actions',
                header: () => null,
                size: 48,
                enableSorting: false,
                enableResizing: false,
                cell: ({ row }) => (
                    <RowContextMenu
                        onAddNote={() => handleOpenNoteModal(row.original.id)}
                        isVerified={row.original.reviewStatus === 'verified'}
                    />
                ),
            },
        ],
        [handleOpenNoteModal]
    );

    return (
        <>
            <DataTable
                data={loadedData}
                columns={columns}
                enableRowSelection
                rowSelection={rowSelection}
                onRowSelectionChange={handleRowSelectionChange}
                getRowId={(row) => row.id}
                totalCount={TOTAL_HISTORICAL_RECORDS}
                isLoading={isLoading}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
            />

            {selectedRows.size > 0 && (
                <BulkActionFooter
                    selectedCount={selectedRows.size}
                    onAction={handleBulkAction}
                    onClear={handleClearSelection}
                />
            )}
        </>
    );
};
