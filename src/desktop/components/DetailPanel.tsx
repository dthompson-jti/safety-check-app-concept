import { useState, useRef, useCallback, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { supervisorNoteModalAtom, isDetailPanelOpenAtom, PanelData, panelWidthAtom } from '../atoms';
import { StatusBadge, StatusBadgeType } from './StatusBadge';
import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
import styles from './DetailPanel.module.css';

interface DetailPanelProps {
    record: PanelData | null;
    selectedCount?: number;
}

export const DetailPanel = ({ record, selectedCount = 0 }: DetailPanelProps) => {
    // Selection state to trigger "select single" or "empty" messages
    // State management
    const [panelWidth, setPanelWidth] = useAtom(panelWidthAtom);
    const setPanelOpen = useSetAtom(isDetailPanelOpenAtom);
    const setModalState = useSetAtom(supervisorNoteModalAtom);

    // Performance refs: track width during drag without re-rendering DetailPanel
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const widthRef = useRef(panelWidth);

    const handleClose = () => setPanelOpen(false);

    const handleOpenNoteModal = () => {
        if (!record) return;
        setModalState({
            isOpen: true,
            selectedIds: [record.id],
        });
    };

    const formatTime = (iso: string | null) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Resize handlers
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        if (panelRef.current) {
            panelRef.current.style.transition = 'none';
        }
    }, []);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        const clampedWidth = Math.max(320, Math.min(600, newWidth));

        // Direct DOM update on root for real-time grid scaling
        widthRef.current = clampedWidth;
        document.documentElement.style.setProperty('--panel-width', `${clampedWidth}px`);
    }, [isResizing]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        if (panelRef.current) {
            panelRef.current.style.transition = '';
            // Sync Jotai state once dragging stops
            setPanelWidth(widthRef.current);
        }
    }, [setPanelWidth]);

    // Add/remove global listeners for resize
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    const panelVariants = {
        closed: { x: '100%' },
        open: { x: 0 },
    };

    const transition = {
        type: 'tween' as const,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        duration: 0.3,
    };

    return (
        <motion.div
            ref={panelRef}
            className={styles.panel}
            style={{ '--panel-width': `${panelWidth}px` } as React.CSSProperties}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
            transition={transition}
        >
            {/* Resize Handle */}
            <div
                className={`${styles.resizeHandle} ${isResizing ? styles.active : ''}`}
                onMouseDown={handleResizeStart}
            >
                <div className={styles.resizeIndicator} />
            </div>
            {/* Header: Identity Only */}
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h3 className={styles.residentName}>
                        {record ? record.residentName : 'No selection'}
                    </h3>
                </div>
                <div className={styles.headerActions}>
                    <Tooltip content="Close Panel">
                        <Button
                            variant="quaternary"
                            size="s"
                            iconOnly
                            aria-label="Close Panel"
                            onClick={handleClose}
                        >
                            <span className="material-symbols-rounded">close</span>
                        </Button>
                    </Tooltip>
                </div>
            </div>

            <div className={styles.content}>
                {record && (
                    <div className={styles.identityBar}>
                        <div className={styles.locationPill}>
                            <span className="material-symbols-rounded">door_front</span>
                            {record.location}
                        </div>
                        <div className={styles.tags}>
                            <StatusBadge status={record.status as StatusBadgeType} />
                            {record.reviewStatus === 'verified' && (
                                <span className={`${styles.tag} ${styles.verified}`}>
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {!record ? (
                    <div className={styles.emptyState}>
                        <span className={`material-symbols-rounded ${styles.placeholderIcon}`}>
                            {selectedCount > 1 ? 'rule' : 'info'}
                        </span>
                        <h4 className={styles.emptyTitle}>
                            {selectedCount > 1 ? 'Multiple Records Selected' : 'No Record Selected'}
                        </h4>
                        <p className={styles.emptyText}>
                            {selectedCount > 1
                                ? 'Select a single record to view its complete check history.'
                                : 'Select a row from the monitor to view detailed check logs and officer notes.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* SECTION 1: METRICS GRID ("The Dashboard") */}
                        <div className={styles.section}>
                            <span className={styles.sectionTitle}>Operational Data</span>
                            <div className={styles.metricsGrid}>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricLabel}>Scheduled</span>
                                    <span className={styles.metricValue}>{formatTime(record.timeScheduled)}</span>
                                </div>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricLabel}>Actual</span>
                                    <span className={styles.metricValue}>{formatTime(record.timeActual)}</span>
                                </div>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricLabel}>Variance</span>
                                    <span className={`${styles.metricValue} ${record.varianceMinutes && record.varianceMinutes > 2 ? styles.late : ''}`}>
                                        {record.varianceMinutes !== undefined ? (
                                            isFinite(record.varianceMinutes) ? `${record.varianceMinutes > 0 ? '+' : ''}${record.varianceMinutes}m` : 'Missed'
                                        ) : 'N/A'}
                                    </span>
                                </div>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricLabel}>Officer</span>
                                    <span className={styles.metricValue}>{record.officerName}</span>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: OFFICER NOTES ("The Log") */}
                        <div className={styles.section}>
                            <span className={styles.sectionTitle}>Field Notes</span>
                            <div className={styles.quoteBlock}>
                                {record.officerNote ? (
                                    <>
                                        <p className={styles.quoteContent}>“{record.officerNote}”</p>
                                        <div className={styles.quoteSignature}>
                                            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>description</span>
                                            {record.officerName}
                                        </div>
                                    </>
                                ) : (
                                    <span className={styles.emptyNote}>No field notes recorded.</span>
                                )}
                            </div>
                        </div>

                        {/* SECTION 3: SUPERVISOR REVIEW */}
                        <div className={styles.section}>
                            <span className={styles.sectionTitle}>Supervisor Review</span>
                            <div className={styles.supervisorBlock}>
                                {record.supervisorNote ? (
                                    <div className={styles.quoteBlock} style={{ background: 'transparent', padding: 0, border: 'none' }}>
                                        <p className={styles.quoteContent}>{record.supervisorNote}</p>
                                        <div className={styles.tags} style={{ marginTop: 8 }}>
                                            {record.reviewStatus === 'verified' && (
                                                <span className={`${styles.tag} ${styles.verified}`}>
                                                    <span className="material-symbols-rounded" style={{ fontSize: 12, marginRight: 4 }}>check_circle</span>
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <span className={styles.emptyNote}>No supervisor comments.</span>
                                )}

                                <button className={styles.actionButton} onClick={handleOpenNoteModal} style={{ marginTop: 8 }}>
                                    <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                                        {record.supervisorNote ? 'edit' : 'add_comment'}
                                    </span>
                                    {record.supervisorNote ? 'Edit Note' : 'Add Note'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};
