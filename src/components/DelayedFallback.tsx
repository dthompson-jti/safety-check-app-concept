// src/components/DelayedFallback.tsx
// Prevents spinner jank by only showing fallback after a delay threshold.
// If content loads faster than the delay, no fallback is shown at all.

import { useState, useEffect, type ReactNode } from 'react';

interface DelayedFallbackProps {
    /** Milliseconds to wait before showing fallback (default: 200ms) */
    delay?: number;
    /** The fallback content to show after delay */
    children: ReactNode;
}

/**
 * DelayedFallback - Wrap your Suspense fallback with this to prevent
 * "spinner flash" on fast loads.
 * 
 * Note: React Suspense will unmount the fallback immediately when content
 * loads, so minimum display time must be handled differently (e.g., by
 * adding artificial delay to the lazy load promise).
 * 
 * @example
 * <Suspense fallback={<DelayedFallback delay={200}><Spinner /></DelayedFallback>}>
 *   <LazyComponent />
 * </Suspense>
 */
export const DelayedFallback: React.FC<DelayedFallbackProps> = ({
    delay = 200,
    children,
}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    // Render nothing until delay passes
    return show ? <>{children}</> : null;
};
