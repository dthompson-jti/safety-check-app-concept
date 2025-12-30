// src/desktop/components/DataTable.tsx

import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    RowSelectionState,
    ColumnSizingState,
    ColumnPinningState,
} from '@tanstack/react-table';
import { useState, useEffect, useRef } from 'react';
import styles from './DataTable.module.css';

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T, unknown>[];
    enableRowSelection?: boolean;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: (selection: RowSelectionState) => void;
    getRowId?: (row: T) => string;
    totalCount?: number;
    isLoading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

export function DataTable<T>({
    data,
    columns,
    enableRowSelection = false,
    rowSelection = {},
    onRowSelectionChange,
    getRowId,
    totalCount,
    isLoading = false,
    hasMore = false,
    onLoadMore,
}: DataTableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
    const [columnPinning] = useState<ColumnPinningState>({
        right: ['actions'],
    });

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            rowSelection,
            columnSizing,
            columnPinning,
        },
        onSortingChange: setSorting,
        onColumnSizingChange: setColumnSizing,
        columnResizeMode: 'onChange',
        onRowSelectionChange: onRowSelectionChange as (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection,
        enableColumnResizing: true,
        getRowId,
    });

    const sentinelRef = useRef<HTMLTableRowElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!onLoadMore || !hasMore) return;

        const sentinel = sentinelRef.current;
        const scrollArea = scrollAreaRef.current;
        if (!sentinel || !scrollArea) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            {
                root: scrollArea,
                rootMargin: '0px',
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [onLoadMore, hasMore]);

    return (
        <div className={styles.tableContainer}>
            <div ref={scrollAreaRef} className={styles.scrollArea}>
                <table className={styles.table} style={{ width: table.getTotalSize() }}>
                    <thead className={styles.thead}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const isPinned = header.column.getIsPinned();
                                    return (
                                        <th
                                            key={header.id}
                                            className={`${styles.th} ${isPinned ? styles.stickyColumn : ''}`}
                                            style={{
                                                width: header.getSize(),
                                                position: isPinned ? 'sticky' : undefined,
                                                right: isPinned === 'right' ? 0 : undefined,
                                                left: isPinned === 'left' ? 0 : undefined,
                                            }}
                                            onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                            data-sortable={header.column.getCanSort()}
                                        >
                                            <div className={styles.thContent}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span className={styles.sortIndicator}>
                                                        {{
                                                            asc: '↑',
                                                            desc: '↓',
                                                        }[header.column.getIsSorted() as string] ?? ''}
                                                    </span>
                                                )}
                                            </div>
                                            {header.column.getCanResize() && (
                                                <div
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        header.getResizeHandler()(e);
                                                    }}
                                                    onTouchStart={(e) => {
                                                        e.stopPropagation();
                                                        header.getResizeHandler()(e);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`${styles.resizer} ${header.column.getIsResizing() ? styles.isResizing : ''
                                                        }`}
                                                />
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className={styles.tbody}>
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className={styles.tr}
                                data-state={row.getIsSelected() ? 'checked' : 'unchecked'}
                            >
                                {row.getVisibleCells().map((cell) => {
                                    const isPinned = cell.column.getIsPinned();
                                    return (
                                        <td
                                            key={cell.id}
                                            className={`${styles.td} ${isPinned ? styles.stickyColumn : ''}`}
                                            style={{
                                                width: cell.column.getSize(),
                                                position: isPinned ? 'sticky' : undefined,
                                                right: isPinned === 'right' ? 0 : undefined,
                                                left: isPinned === 'left' ? 0 : undefined,
                                            }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {hasMore && (
                            <tr ref={sentinelRef} className={styles.sentinelRow}>
                                <td colSpan={columns.length} />
                            </tr>
                        )}
                    </tbody>
                </table>
                {table.getRowModel().rows.length === 0 && !isLoading && (
                    <div className={styles.emptyState}>
                        <span className={`material-symbols-rounded ${styles.emptyIcon}`}>
                            inbox
                        </span>
                        <p>No data to display</p>
                    </div>
                )}
            </div>

            {/* Table Footer */}
            <div className={styles.tableFooter}>
                <div className={styles.footerLeft}>
                    {isLoading && (
                        <div className={styles.loadingIndicator}>
                            <span className={`material-symbols-rounded ${styles.loadingSpinner}`}>
                                progress_activity
                            </span>
                            <span>Loading records...</span>
                        </div>
                    )}
                    <div className={styles.footerCount}>
                        {data.length.toLocaleString()} of {(totalCount ?? data.length).toLocaleString()} records
                    </div>
                </div>
            </div>
        </div>
    );
}
