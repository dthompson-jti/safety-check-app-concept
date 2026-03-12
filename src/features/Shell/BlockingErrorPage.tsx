// src/features/Shell/BlockingErrorPage.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import { blockingErrorTypeAtom, BlockingErrorType, logoutAtom } from '../../data/atoms';
import { Button } from '../../components/Button';
import styles from './BlockingErrorPage.module.css';

interface ErrorMetadata {
    icon: string;
    headline: string;
    body: string;
    code: string;
    actionLabel?: string;
}

const ERROR_METADATA: Record<NonNullable<BlockingErrorType>, ErrorMetadata> = {
    forbidden: {
        icon: 'vpn_lock',
        headline: 'Access Denied',
        body: 'Access is restricted to authorized networks. Check your VPN connection or contact your administrator.',
        code: 'Error: 403 Forbidden',
        actionLabel: 'Log in again',
    },
    unauthorized: {
        icon: 'gpp_bad',
        headline: 'Unauthorized',
        body: 'You do not have permission to perform safety checks.',
        code: '',
        // No actionLabel - header logout is the intended path
    },
    unavailable: {
        icon: 'dns',
        headline: 'Server Unavailable',
        body: 'The application server may be down or undergoing maintenance. Try again later.',
        code: 'Error: 503 Service Unavailable',
    },
    offline: {
        icon: 'cloud_off',
        headline: "You're Offline",
        body: 'No internet connection detected. Application data cannot be loaded.',
        code: 'Connection Failed',
    },
    generic: {
        icon: 'error_outline',
        headline: 'An Error Occurred',
        body: 'The application encountered a problem. If this persists, please contact support.',
        code: 'System Error',
    },
};

export const BlockingErrorPage = () => {
    const errorType = useAtomValue(blockingErrorTypeAtom);
    const setErrorType = useSetAtom(blockingErrorTypeAtom);
    const logout = useSetAtom(logoutAtom);

    if (!errorType) return null;

    const metadata = ERROR_METADATA[errorType];

    const handleRetry = () => {
        if (errorType === 'forbidden') {
            logout();
        } else {
            // In a real app, this might trigger a ping or reload.
            // For simulation, we clear the state.
            setErrorType(null);
        }
    };

    return (
        <div className={styles.container}>
            <span className={`material-symbols-rounded ${styles.icon}`}>
                {metadata.icon}
            </span>
            <h1 className={styles.headline}>{metadata.headline}</h1>
            <p className={styles.body}>{metadata.body}</p>
            <p className={styles.errorCode}>{metadata.code}</p>
            {metadata.actionLabel && (
                <div className={styles.buttonContainer}>
                    <Button
                        variant="primary"
                        size="m"
                        onClick={handleRetry}
                        style={{ width: '100%' }}
                    >
                        {metadata.actionLabel}
                    </Button>
                </div>
            )}
        </div>
    );
};
