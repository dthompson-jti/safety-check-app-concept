// src/features/Shell/NfcScanButton.tsx
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useNfcScan } from './useNfcScan';
import { WaapiRingVisualizer } from './WaapiRingVisualizer';
import { WaveBarsVisualizer } from './WaveBarsVisualizer';
import { WaveTopVisualizer } from './WaveTopVisualizer';
import { featureFlagsAtom } from '../../data/featureFlags';
import { appConfigAtom } from '../../data/atoms';
import styles from './NfcScanButton.module.css';

/**
 * Shared Start Button - Blue "Scan" button.
 */
const StartButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button className={styles.startButton} onClick={onClick}>
            <span className="material-symbols-rounded">sensors</span>
            <span>Start Scan</span>
        </button>
    );
};

/**
 * Unified feedback icon with animated ring and path.
 */
const AnimatedIcon = ({ type }: { type: 'success' | 'alert' | 'warning' | 'info' }) => {
    const RING_COLOR = {
        success: 'var(--surface-fg-success-primary)',
        alert: 'var(--surface-fg-alert-primary)',
        warning: 'var(--surface-fg-warning-primary)',
        info: 'var(--surface-fg-info-primary)',
    }[type];

    const PATH = {
        success: "M 97 100 L 99 102 L 103 98",
        alert: "M 100 96.9 L 100 100.1 M 100 103 L 100 103.1", // Exclamation adjusted
        warning: "M 100 96.9 L 100 100.1 M 100 103 L 100 103.1", // Exclamation adjusted
        info: "M 100 104 L 100 99 M 100 96 L 100 96.1", // Info 'i'
    }[type];

    return (
        <svg className={styles.ringsSvg} viewBox="0 0 200 200">
            <motion.g>
                <motion.circle
                    cx="100"
                    cy="100"
                    initial={{ r: 20, stroke: 'var(--surface-border-primary)', opacity: 0.5 }}
                    animate={{
                        r: 5.5,
                        stroke: RING_COLOR,
                        opacity: 1,
                        strokeWidth: 3
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    fill="none"
                    style={{ vectorEffect: 'non-scaling-stroke' }}
                />

                <motion.path
                    d={PATH}
                    fill="none"
                    stroke={RING_COLOR}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                />
            </motion.g>
        </svg>
    );
};

/**
 * Unified feedback text with staggered 1-2 line layout.
 */
const FeedbackText = ({ primary, secondary }: { primary: string, secondary?: string }) => {
    return (
        <div className={styles.feedbackTextContainer}>
            <motion.div
                className={styles.primaryText}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.7 }}
            >
                {primary}
            </motion.div>
            {secondary && (
                <motion.div
                    className={styles.secondaryText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.7 }}
                >
                    {secondary}
                </motion.div>
            )}
        </div>
    );
};

/**
 * Unified Feedback Visualizer handles all post-initiation states.
 */
const FeedbackVisualizer = () => {
    const { scanState, finalizeSuccess, targetRoom, startScan } = useNfcScan();
    const featureFlags = useAtomValue(featureFlagsAtom);
    const appConfig = useAtomValue(appConfigAtom);

    // Capture and lock the room name when we hit success state
    // This prevents "room jumping" if the underlying data updates during the animation
    const capturedRoomRef = useRef<string>(targetRoom);
    useEffect(() => {
        if (scanState === 'success') {
            capturedRoomRef.current = targetRoom;
        }
    }, [scanState, targetRoom]);

    // Simple Scan OFF = form is coming after checkmark, so isPreFormPhase = true
    // Simple Scan ON = auto-complete, no form, so isPreFormPhase = false
    const isPreFormPhase = !appConfig.simpleSubmitEnabled;

    // Use ref to store the latest finalizeSuccess to avoid re-triggering effect on callback changes
    const finalizeSuccessRef = useRef(finalizeSuccess);
    useEffect(() => {
        finalizeSuccessRef.current = finalizeSuccess;
    }, [finalizeSuccess]);

    // Auto-finalize success - timing varies by workflow
    // IMPORTANT: Only depend on scanState to prevent timer resets from other dependency changes
    useEffect(() => {
        if (scanState === 'success') {
            const delay = isPreFormPhase ? 800 : 2000;
            const timer = setTimeout(() => finalizeSuccessRef.current(), delay);
            return () => clearTimeout(timer);
        }
        if (scanState === 'formComplete') {
            const timer = setTimeout(() => finalizeSuccessRef.current(), 1700);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scanState]);

    const isScanning = scanState === 'scanning';
    const scanAnimation = featureFlags.feat_scan_animation;
    const showRings = scanAnimation === 'rings' && isScanning;
    const showWaveBars = scanAnimation === 'wave' && isScanning;
    const showWaveTop = scanAnimation === 'wave-top' && isScanning;

    const renderFeedback = (primary: string, secondary?: string, iconType: 'success' | 'alert' | 'warning' = 'success') => {
        const bgClass = iconType === 'success' ? styles.feedbackBackgroundSuccess : styles.feedbackBackgroundError;
        return (
            <motion.div
                key={`feedback-${iconType}`}
                className={styles.feedbackWrapper}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                    opacity: 0,
                    scale: 0.98,
                    y: -4,
                    transition: { duration: isPreFormPhase ? 0 : 0.2, ease: 'easeIn' }
                }}
            >
                <div className={`${styles.feedbackBackground} ${bgClass}`} />
                <motion.div
                    animate={(isPreFormPhase && !primary) ? { opacity: 1 } : { opacity: [1, 1, 0] }}
                    transition={(isPreFormPhase && !primary) ? {} : { times: [0, 0.6, 1], duration: 1.0, ease: 'easeInOut' }}
                >
                    <AnimatedIcon type={iconType} />
                </motion.div>
                <FeedbackText primary={primary} secondary={secondary} />
            </motion.div>
        );
    };

    // Render form completion feedback - NO checkmark, just green bg + text
    const renderFormComplete = () => {
        return (
            <motion.div
                key="formComplete"
                className={styles.feedbackWrapper}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.2, ease: 'easeIn' } }}
            >
                <div className={`${styles.feedbackBackground} ${styles.feedbackBackgroundSuccess}`} />
                <FeedbackText primary={`${capturedRoomRef.current} Complete`} />
            </motion.div>
        );
    };

    // Render toast-like error for blocked/hardwareOff states
    const renderErrorToast = (iconName: string, primary: string, secondary: string) => {
        return (
            <motion.div
                key={`errorToast-${iconName}`}
                className={styles.errorToast}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.2, ease: 'easeIn' } }}
            >
                <span className={`material-symbols-rounded ${styles.errorToastIcon}`}>{iconName}</span>
                <div className={styles.errorToastContent}>
                    <span className={styles.errorToastPrimary}>{primary}</span>
                    <span className={styles.errorToastSecondary}>{secondary}</span>
                </div>
            </motion.div>
        );
    };

    return (
        <div
            className={styles.visualizerContainer}
            onClick={scanState === 'readError' ? startScan : undefined}
            style={{ cursor: scanState === 'readError' ? 'pointer' : 'default' }}
        >
            {showRings && <WaapiRingVisualizer isEnabled={true} />}
            {showWaveBars && <WaveBarsVisualizer isEnabled={true} />}
            {showWaveTop && <WaveTopVisualizer isEnabled={true} />}

            <AnimatePresence mode="wait">
                {scanState === 'scanning' && !showWaveTop && (
                    <motion.div
                        key="scanning"
                        className={styles.scanningLabel}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        Ready to Scan
                    </motion.div>
                )}

                {scanState === 'success' && renderFeedback(
                    isPreFormPhase ? '' : `${capturedRoomRef.current} Complete`,
                    undefined,
                    'success'
                )}
                {scanState === 'formComplete' && renderFormComplete()}
                {scanState === 'readError' && renderFeedback("Tag not read", "Tap to retry", 'alert')}
                {scanState === 'blocked' && renderErrorToast("block", "NFC Blocked", "Allow in app settings")}
                {scanState === 'hardwareOff' && renderErrorToast("sensors_off", "NFC is turned off", "Open NFC Settings to turn on")}
            </AnimatePresence>
        </div>
    );
};

export const NfcScanButton = () => {
    const { scanState, startScan, stopScan, simulateTagRead } = useNfcScan();

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

                    {scanState !== 'idle' && scanState !== 'timeout' && (
                        <motion.div
                            key="visualizer"
                            className={styles.visualizerWrapper}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={scanState === 'scanning' ? simulateTagRead : undefined}
                            style={{ cursor: scanState === 'scanning' ? 'pointer' : 'default', pointerEvents: 'auto' }}
                        >
                            <FeedbackVisualizer />
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
