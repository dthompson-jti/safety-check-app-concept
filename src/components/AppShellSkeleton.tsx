// src/components/AppShellSkeleton.tsx
// Progressive disclosure skeleton for AppShell during lazy load
// Shows app chrome structure immediately, content fills in later

import styles from './AppShellSkeleton.module.css';

/**
 * AppShellSkeleton - Displayed during post-login AppShell lazy load.
 * 
 * Shows the structure of the app (header, footer, card placeholders)
 * to create a feeling of "already there, just loading content".
 */
export const AppShellSkeleton = () => {
    return (
        <div className={styles.container}>
            {/* Header Chrome */}
            <header className={styles.header}>
                <div className={styles.headerIcon} />
                <div className={styles.headerCenter} />
                <div className={styles.headerAvatar} />
            </header>

            {/* Content Area with Skeleton Cards */}
            <main className={styles.content}>
                <div className={styles.sectionHeader} />

                {/* Skeleton Cards */}
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={styles.card}>
                        <div className={styles.cardShimmer} />
                        <div className={styles.cardIndicator} />
                        <div className={styles.cardRow}>
                            <div className={styles.cardTitle} />
                            <div className={styles.cardBadge} />
                        </div>
                        <div className={styles.cardSubtitle} />
                    </div>
                ))}
            </main>

            {/* Footer Chrome */}
            <footer className={styles.footer}>
                <div className={styles.footerButton} />
                <div className={styles.footerButton} />
                <div className={styles.footerButton} />
            </footer>
        </div>
    );
};
