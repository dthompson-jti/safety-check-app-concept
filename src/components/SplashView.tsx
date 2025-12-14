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
                background: 'var(--surface-bg-secondary, var(--splash-bg))',
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
        </div>
    );
};
