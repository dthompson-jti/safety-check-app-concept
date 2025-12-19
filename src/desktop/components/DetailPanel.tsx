// src/desktop/components/DetailPanel.tsx

import { useAtomValue } from 'jotai';
import { filteredHistoricalChecksAtom, selectedHistoryRowsAtom } from '../atoms';
import styles from './DetailPanel.module.css';

interface DetailPanelProps {
    onClose: () => void;
}

export const DetailPanel = ({ onClose }: DetailPanelProps) => {
    const checks = useAtomValue(filteredHistoricalChecksAtom);
    const selectedRows = useAtomValue(selectedHistoryRowsAtom);

    // Get the first selected check for detail display
    const selectedId = Array.from(selectedRows)[0];
    const selectedCheck = checks.find((c) => c.id === selectedId);

    if (!selectedCheck) {
        return (
            <div className={styles.panel}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Details</h3>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>
                <div className={styles.emptyState}>
                    <span className="material-symbols-rounded" style={{ fontSize: 48, opacity: 0.3 }}>
                        info
                    </span>
                    <p>Select an item to view details</p>
                </div>
            </div>
        );
    }

    const resident = selectedCheck.residents[0];

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h3 className={styles.title}>{resident?.name || 'Unknown'}</h3>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    <span className="material-symbols-rounded">close</span>
                </button>
            </div>

            <div className={styles.content}>
                <div className={styles.field}>
                    <label className={styles.label}>Location</label>
                    <span className={styles.value}>{selectedCheck.location}</span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Scheduled Time</label>
                    <span className={styles.value}>
                        {new Date(selectedCheck.scheduledTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                        })}
                    </span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Actual Time</label>
                    <span className={styles.value}>
                        {selectedCheck.actualTime
                            ? new Date(selectedCheck.actualTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            })
                            : 'Missed'}
                    </span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Variance</label>
                    <span className={styles.value}>
                        {isFinite(selectedCheck.varianceMinutes)
                            ? `${selectedCheck.varianceMinutes > 0 ? '+' : ''}${selectedCheck.varianceMinutes}m`
                            : 'N/A'}
                    </span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Officer</label>
                    <span className={styles.value}>{selectedCheck.officerName}</span>
                </div>

                {selectedCheck.officerNote && (
                    <div className={styles.field}>
                        <label className={styles.label}>Officer Note</label>
                        <span className={styles.value}>{selectedCheck.officerNote}</span>
                    </div>
                )}

                {selectedCheck.supervisorNote && (
                    <div className={styles.field}>
                        <label className={styles.label}>Supervisor Note</label>
                        <span className={styles.value}>{selectedCheck.supervisorNote}</span>
                    </div>
                )}

                <div className={styles.field}>
                    <label className={styles.label}>Status</label>
                    <div className={styles.tags}>
                        <span className={`${styles.tag} ${styles[selectedCheck.status]}`}>
                            {selectedCheck.status}
                        </span>
                        <span className={`${styles.tag} ${styles[selectedCheck.reviewStatus]}`}>
                            {selectedCheck.reviewStatus}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
