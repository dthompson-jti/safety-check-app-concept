// src/features/Shell/NfcScanButton.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useNfcScan } from './useNfcScan';
import { WaapiRingVisualizer } from './WaapiRingVisualizer';
import { featureFlagsAtom } from '../../data/featureFlags';
import styles from './NfcScanButton.module.css';


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
 * Uses WAAPI for conveyor belt + shimmer animation system.
 */
const ScanningVisualizer = () => {
    const { scanState, finalizeSuccess } = useNfcScan();
    const featureFlags = useAtomValue(featureFlagsAtom);
    const isScanning = scanState === 'scanning';
    const showRingAnimation = featureFlags.feat_ring_animation;

    // Animation constants for success state
    const CHECK_RADIUS = 5.5;
    const SUCCESS_RING_COLOR = 'var(--surface-fg-success-primary)';
    const IDLE_RING_COLOR = 'var(--surface-border-primary)';

    // Handle success finalization delay
    const finalizeSuccessRef = React.useRef(finalizeSuccess);
    finalizeSuccessRef.current = finalizeSuccess;

    useEffect(() => {
        if (scanState === 'success') {
            const timer = setTimeout(() => {
                finalizeSuccessRef.current();
            }, 850); // 400ms ring + (100ms delay + 400ms check) + 350ms breathing room = 850ms
            return () => clearTimeout(timer);
        }
    }, [scanState]);

    return (
        <div className={styles.visualizerContainer}>
            {/* WAAPI Ring Visualizer for scanning state - controlled by Future Ideas flag */}
            {isScanning && showRingAnimation && (
                <WaapiRingVisualizer isEnabled={true} />
            )}

            {/* Success state with background fade and SVG */}
            <AnimatePresence>
                {scanState === 'success' && (
                    <motion.div
                        className={styles.successBackground}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <svg className={styles.ringsSvg} viewBox="0 0 200 200">
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
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    fill="none"
                                    style={{ vectorEffect: 'non-scaling-stroke' }}
                                />

                                {/* Checkmark drawing animation - slowed down */}
                                <motion.path
                                    d="M 97 100 L 99 102 L 103 98"
                                    fill="none"
                                    stroke={SUCCESS_RING_COLOR}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                                />
                            </motion.g>
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {scanState === 'scanning' && (
                    <motion.div
                        key="scanning-label"
                        className={styles.scanningLabel}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{ animation: 'none' }} // Override CSS labelPulse during Framer Motion control
                    >
                        Ready to Scan
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const NfcScanButton = () => {
    const { scanState, startScan, stopScan, simulateTagRead } = useNfcScan();
    const isScanning = scanState === 'scanning';

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
                            onClick={isScanning ? simulateTagRead : undefined}
                            style={{ cursor: isScanning ? 'pointer' : 'default', pointerEvents: isScanning ? 'auto' : 'none' }}
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
        </div>
    );
};
