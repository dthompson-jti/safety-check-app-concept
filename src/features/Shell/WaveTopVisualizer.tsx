// src/features/Shell/WaveTopVisualizer.tsx
import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWaveBarsAnimation, WaveBarsAnimationParams, DEFAULT_WAVE_BARS_PARAMS } from './useWaveBarsAnimation';
import styles from './NfcScanButton.module.css';

interface WaveTopVisualizerProps {
    isEnabled: boolean;
    params?: Partial<WaveBarsAnimationParams>;
}

/**
 * Wave Top Visualizer
 * 
 * Single set of 4 wave arcs rotated upward, centered horizontally.
 * Includes the "Hold near tag" text below for proper stacked layout.
 */
export const WaveTopVisualizer: React.FC<WaveTopVisualizerProps> = ({
    isEnabled,
    params: paramOverrides,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Merge params with defaults
    const params = useMemo<WaveBarsAnimationParams>(() => ({
        ...DEFAULT_WAVE_BARS_PARAMS,
        ...paramOverrides,
    }), [paramOverrides]);

    // Run WAAPI animations
    useWaveBarsAnimation(containerRef, params, isEnabled);

    // SVG paths ordered smallest (1) to largest (4)
    const wavePaths = [
        // Path 1 (smallest, innermost)
        "M22.4216 13.8162c-.6032-.6032-1.5936-.6091-2.0883.0857a9.2659 9.2659 0 0 0-1.0121 8.9185 9.267 9.267 0 0 0 1.0121 1.8278c.4947.6948 1.4851.6889 2.0883.0858.6031-.6032.5822-1.575.1471-2.3086a6.1749 6.1749 0 0 1-.3938-5.5137 6.1749 6.1749 0 0 1 .3938-.787c.4351-.7336.456-1.7054-.1471-2.3085Z",
        // Path 2
        "M18.0542 9.2707c-.603-.603-1.5875-.6074-2.1273.0528a15.4426 15.4426 0 0 0-3.487 9.7737 15.4403 15.4403 0 0 0 3.487 9.7736c.5398.6602 1.5243.6558 2.1273.0528.603-.603.5941-1.5755.071-2.249a12.3539 12.3539 0 0 1-2.5972-7.5774 12.3543 12.3543 0 0 1 2.5972-7.5775c.5231-.6735.532-1.646-.071-2.249Z",
        // Path 3
        "M13.6661 4.8835c-.5909-.591-1.5535-.5943-2.1017.0366a21.617 21.617 0 0 0 0 28.3579c.5482.6308 1.5108.6275 2.1017.0366.591-.5909.5856-1.5453.0447-2.1823A18.5902 18.5902 0 0 1 9.291 19.099a18.59 18.59 0 0 1 4.4198-12.0332c.5409-.637.5463-1.5914-.0447-2.1823Z",
        // Path 4 (largest, outermost)
        "M9.2323.4496c-.603-.603-1.5842-.6058-2.1528.0298a27.7931 27.7931 0 0 0 0 37.0625c.5686.6355 1.5498.6328 2.1528.0298s.599-1.5776.0348-2.2171a24.7051 24.7051 0 0 1 0-32.688c.5642-.6394.5682-1.614-.0348-2.217Z",
    ];

    return (
        <div ref={containerRef} className={styles.waveTopContainer}>
            <svg
                className={styles.waveTopSvg}
                viewBox="0 0 23 39"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {wavePaths.map((d, i) => (
                    <path
                        key={`top-path-${i}`}
                        className="wave-path"
                        d={d}
                        style={{ opacity: params.restOpacity }}
                    />
                ))}
            </svg>
            <motion.div
                className={styles.scanningLabelSmall}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
            >
                Hold near tag
            </motion.div>
        </div>
    );
};
