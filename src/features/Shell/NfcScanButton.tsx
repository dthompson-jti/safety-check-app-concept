// src/features/Shell/NfcScanButton.tsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useNfcScan } from './useNfcScan';
import { useWaapiSync } from '../../hooks/useWaapiSync';
import styles from './NfcScanButton.module.css';

/**
 * Floating simulate button - simplified to a round NFC icon.
 * Positioned fixed above the footer.
 */
const SimulateFab = () => {
    const { scanState, simulateTagRead } = useNfcScan();

    if (scanState !== 'scanning') return null;

    return (
        <button
            className={styles.simulateFab}
            onClick={(e) => {
                e.stopPropagation();
                simulateTagRead();
            }}
            aria-label="Simulate NFC Tag Read"
        >
            <span className="material-symbols-rounded">contactless</span>
        </button>
    );
};

/**
 * Shared Start Button - Blue "Scan" button.
 */
const StartButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button className={styles.startButton} onClick={onClick}>
            <span className="material-symbols-rounded">sensors</span>
            <span>Scan</span>
        </button>
    );
};

/**
 * The core visualizer for the "Ready to scan" and "Success" states.
 * Uses radially growing circles and a checkmark animation.
 * WAAPI sync ensures consistent starting conditions on mount.
 */
const ScanningVisualizer = () => {
    const { scanState, finalizeSuccess } = useNfcScan();
    const isScanning = scanState === 'scanning';

    // Ref for WAAPI sync - ensures animations start at t=0 on mount
    const svgRef = useRef<SVGSVGElement>(null);
    useWaapiSync(svgRef, { isEnabled: isScanning });

    // Animation constants
    // SVG is 600px wide, viewBox is 200px. Scale factor is 3x.
    // Target size ~32px. SVG size = 10.6px. Radius = 5.3px.
    const CHECK_RADIUS = 5.5;
    const SUCCESS_RING_COLOR = 'var(--surface-fg-success-primary)';
    const IDLE_RING_COLOR = 'var(--surface-border-primary)'; // Spec: Refined color (was fg-secondary)

    // Handle ring spawning  // No-op spawn loop removed in favor of fixed staggered rings
    useEffect(() => {
        // Spacer to maintain hooks order if I were replacing more substantial logic
    }, []);

    // Handle success finalization delay
    // Using ref to prevent timer reset when finalizeSuccess identity changes
    const finalizeSuccessRef = React.useRef(finalizeSuccess);
    finalizeSuccessRef.current = finalizeSuccess;

    useEffect(() => {
        if (scanState === 'success') {
            const timer = setTimeout(() => {
                finalizeSuccessRef.current();
            }, 300); // Spec: Quick flash (ring 0.2s + check 0.2s + buffer)
            return () => clearTimeout(timer);
        }
    }, [scanState]); // Only depend on scanState, not finalizeSuccess

    return (
        <div className={styles.visualizerContainer}>
            <svg className={styles.ringsSvg} viewBox="0 0 200 200" ref={svgRef}>
                <AnimatePresence>
                    {/* Refine: Fixed staggered rings for perfectly even spacing */
                        /* Visual Spacing ~20px. Scale 3x -> 6.6 units. */
                        /* Speed: 80 units / 5s = 16 units/s. Delay = 6.6/16 = 0.4s. */
                    }
                    {isScanning && (
                        <>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                                <circle
                                    key={`ring-${i}`}
                                    cx="100"
                                    cy="100"
                                    r="8"
                                    fill="none"
                                    stroke={IDLE_RING_COLOR}
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                    className={styles.pulseRing}
                                    style={{
                                        // Physical: negative delay for steady-state (72s / 12 = 6s stagger)
                                        // Shimmer: smoothed active window 2.8s (35% of 8s)
                                        // Stagger = 2.8s / 11 ≈ 0.255s per ring
                                        // Outer peaks first, wave propagates inward visually
                                        animationDelay: `${-i * 6}s, ${-(11 - i) * (2.8 / 11)}s`,
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {scanState === 'success' && (
                        <motion.g>
                            {/* Converging Success Ring */}
                            <motion.circle
                                cx="100"
                                cy="100"
                                initial={{ r: 20, stroke: IDLE_RING_COLOR, opacity: 0.5 }}
                                animate={{
                                    r: CHECK_RADIUS,
                                    stroke: SUCCESS_RING_COLOR,
                                    opacity: 1,
                                    strokeWidth: 3
                                }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                fill="none"
                                style={{ vectorEffect: 'non-scaling-stroke' }}
                            />

                            {/* Checkmark drawing animation - Scaled to fit inside ~11u diameter circle */}
                            {/* Path fits in ~6u bounding box centered at 100,100 */}
                            <motion.path
                                d="M 97 100 L 99 102 L 103 98"
                                fill="none"
                                stroke={SUCCESS_RING_COLOR}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.2, delay: 0, ease: "easeOut" }}
                            />
                        </motion.g>
                    )}
                </AnimatePresence>
            </svg>

            <AnimatePresence mode="wait">
                {scanState === 'scanning' && (
                    <motion.div
                        key="scanning-label"
                        className={styles.scanningLabel}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, filter: 'blur(8px)' }}
                    >
                        Ready to Scan
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const NfcScanButton = () => {
    const { scanState, startScan, stopScan } = useNfcScan();

    return (
        <div className={styles.nfcWrapper}>
            <MotionConfig transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.4 }}>
                <AnimatePresence mode="wait">
                    {scanState === 'idle' && (
                        <motion.div
                            key="idle"
                            className={styles.buttonContainer}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <StartButton onClick={startScan} />
                        </motion.div>
                    )}

                    {(scanState === 'scanning' || scanState === 'success') && (
                        <motion.div
                            key="active"
                            className={styles.visualizerWrapper}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            <ScanningVisualizer />
                        </motion.div>
                    )}

                    {scanState === 'timeout' && (
                        <motion.div
                            key="timeout"
                            className={styles.buttonContainer}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <button
                                className={styles.timeoutButton}
                                onClick={() => {
                                    stopScan();
                                    startScan();
                                }}
                            >
                                <span className="material-symbols-rounded">timer_off</span>
                                <span>Timed out — Tap to retry</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </MotionConfig>

            <SimulateFab />
        </div>
    );
};
