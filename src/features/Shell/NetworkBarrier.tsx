// src/features/Shell/NetworkBarrier.tsx
import { ReactNode } from 'react';
import { useAtomValue } from 'jotai';
import { blockingErrorTypeAtom } from '../../data/atoms';
import { BlockingErrorPage } from './BlockingErrorPage';

interface NetworkBarrierProps {
    children: ReactNode;
}

/**
 * A logical wrapper that intercepts the application render if a blocking
 * error state (Forbidden, Unavailable, Offline, Timeout) is detected.
 */
export const NetworkBarrier = ({ children }: NetworkBarrierProps) => {
    const errorType = useAtomValue(blockingErrorTypeAtom);

    return (
        <>
            {errorType ? <BlockingErrorPage /> : children}
        </>
    );
};
