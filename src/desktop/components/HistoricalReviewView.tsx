// src/desktop/components/HistoricalReviewView.tsx

import { useMemo, useCallback } from 'react';
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
    const checks = useAtomValue(filteredHistoricalChecksAtom);
    const [selectedRows, setSelectedRows] = useAtom(selectedHistoryRowsAtom);
    const setModalState = useSetAtom(supervisorNoteModalAtom);

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
                    <div
                        className={styles.checkbox}
                        onClick={table.getToggleAllRowsSelectedHandler()}
                        data-state={table.getIsAllRowsSelected() ? 'checked' : 'unchecked'}
                    >
                        {table.getIsAllRowsSelected() && (
                            <span className="material-symbols-rounded">check</span>
                        )}
                    </div>
                ),
                cell: ({ row }) => (
                    <div
                        className={styles.checkbox}
                        onClick={row.getToggleSelectedHandler()}
                        data-state={row.getIsSelected() ? 'checked' : 'unchecked'}
                    >
                        {row.getIsSelected() && (
                            <span className="material-symbols-rounded">check</span>
                        )}
                    </div>
                ),
                size: 48,
            },
            {
                id: 'scheduled',
                header: 'Scheduled',
                accessorFn: (row) => formatTime(row.scheduledTime),
                size: 90,
            },
            {
                id: 'actual',
                header: 'Actual',
                accessorFn: (row) => row.actualTime ? formatTime(row.actualTime) : '',
                cell: ({ row }) =>
                    row.original.actualTime ? formatTime(row.original.actualTime) : '—',
                size: 90,
            },
            {
                id: 'variance',
                header: 'Variance',
                size: 100,
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
                size: 90,
                accessorKey: 'status',
                cell: ({ row }) => (
                    <StatusBadge status={row.original.status as StatusBadgeType} />
                ),
            },
            {
                id: 'resident',
                header: 'Resident',
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
                size: 100,
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
                header: '',
                size: 40,
                enableResizing: false,
                enableSorting: false,
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
                data={checks}
                columns={columns}
                enableRowSelection
                rowSelection={rowSelection}
                onRowSelectionChange={handleRowSelectionChange}
                getRowId={(row) => row.id}
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
