// src/components/FacilitySelectionSkeleton.tsx
// High-fidelity skeleton for the Facility Selection screen
// Displayed during post-login lazy load if multiple facilities exist

import styles from './FacilitySelectionSkeleton.module.css';

/**
 * FacilitySelectionSkeleton
 * 
 * Mimics the structure of FacilitySelectionModal to provide
 * a seamless transition from "Loading" to "Selection".
 * 
 * Pattern:
 * - Header (Title)
 * - List Items (Classic "Golden Row" layout)
 */
export const FacilitySelectionSkeleton = () => {
    return (
        <div className={styles.container}>
            {/* Header Chrome */}
            <header className={styles.header}>
                <div className={styles.headerTitle} />
            </header>

            {/* List Content */}
            <main className={styles.content}>
                {/* 5 items to fill the view comfortably */}
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={styles.listItem}>
                        <div className={styles.shimmerOverlay} />
                        <div className={styles.itemIcon} />
                        <div className={styles.itemText} style={{ width: `${Math.floor(Math.random() * 40) + 40}%` }} />
                        <div className={styles.itemChevron} />
                    </div>
                ))}
            </main>
        </div>
    );
};
