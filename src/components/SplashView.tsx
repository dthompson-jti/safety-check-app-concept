// src/components/SplashView.tsx
// Minimal splash screen component that matches the static HTML in index.html
// Uses layoutId for seamless transition to LoginView

import { motion } from 'framer-motion';
import { JournalLogo } from './CriticalIcons';

/**
 * SplashView - Displayed during lazy-load of LoginView/AppShell
 * 
 * CRITICAL: This must visually match the static HTML in index.html
 * to create a seamless "pixel-perfect" handoff when React hydrates.
 */
export const SplashView = () => {
    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--surface-bg-primary, var(--splash-bg))',
                gap: 8,
            }}
        >
            <motion.div
                layoutId="app-logo"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <JournalLogo size={144} />
            </motion.div>
            <motion.h3
                layoutId="app-title"
                style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    color: 'var(--surface-fg-primary)',
                }}
            >
                Safeguard
            </motion.h3>
        </div>
    );
};
