// src/features/Shell/WaapiRingVisualizer.tsx
import React, { useRef, useMemo } from 'react';
import { useRingAnimation, useStaticRings, RingAnimationParams, DEFAULT_RING_PARAMS } from './useRingAnimation';
import styles from './NfcScanButton.module.css';

interface WaapiRingVisualizerProps {
    isEnabled: boolean;
    params?: Partial<RingAnimationParams>;
}

/**
 * WAAPI-powered ring visualizer
 * Replaces CSS-based animation with JavaScript-controlled WAAPI
 */
export const WaapiRingVisualizer: React.FC<WaapiRingVisualizerProps> = ({
    isEnabled,
    params: paramOverrides,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // Merge params with defaults
    const params = useMemo<RingAnimationParams>(() => ({
        ...DEFAULT_RING_PARAMS,
        ...paramOverrides,
    }), [paramOverrides]);

    // Check for reduced motion preference
    const prefersReducedMotion = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    // Get static ring positions for reduced motion
    const staticRadii = useStaticRings(params);

    // Run WAAPI animations if not reduced motion
    useRingAnimation(svgRef, params, isEnabled && !prefersReducedMotion);

    const RING_COLOR = 'var(--surface-border-primary)';

    return (
        <svg
            ref={svgRef}
            className={styles.ringsSvg}
            viewBox="0 0 200 200"
        >
            {prefersReducedMotion ? (
                // Static rings for reduced motion
                staticRadii.map((r, i) => (
                    <circle
                        key={`static-ring-${i}`}
                        cx="100"
                        cy="100"
                        r={r}
                        fill="none"
                        stroke={RING_COLOR}
                        strokeWidth={params.baseStrokeWidth}
                        opacity={params.baseOpacity}
                        vectorEffect="non-scaling-stroke"
                    />
                ))
            ) : (
                // Animated rings - WAAPI will control these
                Array.from({ length: params.ringCount }, (_, i) => (
                    <circle
                        key={`ring-${i}`}
                        className="ring"
                        cx="100"
                        cy="100"
                        r={params.minRadius} // Initial value, WAAPI will override
                        fill="none"
                        stroke={RING_COLOR}
                        strokeWidth={params.baseStrokeWidth}
                        opacity={0} // Initial value, WAAPI will override
                        vectorEffect="non-scaling-stroke"
                    />
                ))
            )}
        </svg>
    );
};
