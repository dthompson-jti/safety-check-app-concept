import { useAtomValue } from 'jotai';
import { sessionAtom } from '../data/atoms';
import { APP_VERSION } from '../config';

/**
 * Desktop Application Root
 * Focuses on a wider, dashboard-style layout while reusing the mobile design system.
 */
export default function App() {
    const session = useAtomValue(sessionAtom);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface-bg-secondary)'
        }}>
            {/* Basic Desktop Header */}
            <header style={{
                height: '64px',
                background: 'var(--surface-bg-primary)',
                borderBottom: '1px solid var(--surface-border-secondary)',
                padding: '0 var(--spacing-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                    <span className="material-symbols-rounded" style={{ color: 'var(--surface-fg-info)', fontSize: '24px' }}>
                        desktop_windows
                    </span>
                    <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>
                        SafetyCheck <span style={{ opacity: 0.5, fontWeight: 400 }}>Station</span>
                    </h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{session.user?.displayName || 'Guest'}</div>
                        <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--surface-fg-tertiary)' }}>{session.isAuthenticated ? 'Authenticated' : 'Unauthenticated'}</div>
                    </div>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--surface-bg-info-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--surface-fg-info)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 600
                    }}>
                        {session.user?.initials?.[0] || '?'}
                    </div>
                </div>
            </header>

            {/* Main Desktop Content Area */}
            <main style={{
                flex: 1,
                padding: 'var(--spacing-8)',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
            }}>
                <div style={{
                    background: 'var(--surface-bg-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-10)',
                    border: '1px solid var(--surface-border-secondary)',
                    boxShadow: 'var(--surface-shadow-md)',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-4)' }}>Desktop Experience Prototype</h2>
                    <p style={{ color: 'var(--surface-fg-secondary)', maxWidth: '600px', margin: '0 auto var(--spacing-8)' }}>
                        This is the companion desktop experience for SafetyCheck. It leverages the same design tokens, atoms, and state logic as the mobile PWA, but is optimized for large displays and workstation use cases.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-4)' }}>
                        <button className="btn btn-primary" style={{ height: 'var(--control-height-md)', padding: '0 var(--spacing-6)' }}>
                            Explore Facility Dashboard
                        </button>
                        <button className="btn btn-secondary" style={{ height: 'var(--control-height-md)', padding: '0 var(--spacing-6)' }}>
                            System Logs
                        </button>
                    </div>
                </div>

                <footer style={{ marginTop: 'var(--spacing-8)', textAlign: 'center', color: 'var(--surface-fg-quaternary)', fontSize: 'var(--font-size-2xs)' }}>
                    SafetyCheck {APP_VERSION} &bull; Shared Design System v1.0
                </footer>
            </main>
        </div>
    );
}
