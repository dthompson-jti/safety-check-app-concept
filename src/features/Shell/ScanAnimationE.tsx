// src/features/Shell/ScanAnimationE.tsx
import React, { useRef, useLayoutEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from './NfcScanButton.module.css';

interface ScanAnimationEProps {
    isEnabled: boolean;
}

/**
 * Scan Animation E
 * 
 * NFC-style icon with center circle and expanding ring arcs.
 * Uses a 3-step pulse animation:
 * 1. Circle pulses
 * 2. Inner ring arcs pulse
 * 3. Outer ring arcs pulse
 * Then resets and repeats.
 */
export const ScanAnimationE: React.FC<ScanAnimationEProps> = ({ isEnabled }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationsRef = useRef<Animation[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const runPulseSequence = useCallback(() => {
        if (!containerRef.current) return;

        const circle = containerRef.current.querySelector('.pulse-circle');
        const innerPaths = containerRef.current.querySelectorAll('.pulse-inner');
        const outerPaths = containerRef.current.querySelectorAll('.pulse-outer');

        const restOpacity = 0.67;
        const peakOpacity = 1.0;
        const stepDuration = 800; // ms per step (slower, softer)

        // Step 1: Circle pulses
        if (circle) {
            const anim = circle.animate(
                [
                    { opacity: restOpacity },
                    { opacity: peakOpacity },
                    { opacity: restOpacity },
                ],
                { duration: stepDuration, easing: 'ease-in-out', fill: 'forwards' }
            );
            animationsRef.current.push(anim);
        }

        // Step 2: Inner ring arcs pulse (delayed)
        innerPaths.forEach((path) => {
            const anim = path.animate(
                [
                    { opacity: restOpacity },
                    { opacity: peakOpacity },
                    { opacity: restOpacity },
                ],
                { duration: stepDuration, delay: stepDuration * 0.6, easing: 'ease-in-out', fill: 'forwards' }
            );
            animationsRef.current.push(anim);
        });

        // Step 3: Outer ring arcs pulse (delayed more)
        outerPaths.forEach((path) => {
            const anim = path.animate(
                [
                    { opacity: restOpacity },
                    { opacity: peakOpacity },
                    { opacity: restOpacity },
                ],
                { duration: stepDuration, delay: stepDuration * 1.2, easing: 'ease-in-out', fill: 'forwards' }
            );
            animationsRef.current.push(anim);
        });
    }, []);

    useLayoutEffect(() => {
        if (!isEnabled || !containerRef.current) return;

        // Check for reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Initial pulse
        runPulseSequence();

        // Repeat every full cycle (overlapping steps + pause)
        // Last animation ends at: delay(1.2*800) + duration(800) = 1760ms
        const cycleTime = 2400; // ~1760ms for full sequence + 640ms pause
        intervalRef.current = setInterval(runPulseSequence, cycleTime);

        return () => {
            animationsRef.current.forEach(anim => anim.cancel());
            animationsRef.current = [];
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isEnabled, runPulseSequence]);

    if (!isEnabled) return null;

    const restOpacity = 0.67;

    return (
        <div ref={containerRef} className={styles.nfcIconContainer}>
            <svg
                className={styles.nfcIconSvg}
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="18"
                viewBox="0 0 27 18"
                fill="none"
            >
                {/* Outer left arc */}
                <path
                    className="pulse-outer"
                    fill="currentColor"
                    style={{ opacity: restOpacity }}
                    d="M2.433 8.9334c0 1.2888.2 2.5111.6 3.6666.4222 1.1333 1.0111 2.1556 1.7667 3.0667.2222.2889.3333.6.3333.9333 0 .3333-.1222.6222-.3667.8667-.2444.2444-.5444.3666-.9.3666-.3555-.0222-.6444-.1777-.8666-.4666-.9556-1.1556-1.7-2.4445-2.2334-3.8667-.511-1.4222-.7666-2.9444-.7666-4.5666 0-1.6223.2555-3.1445.7666-4.5667C1.2997 2.9222 2.0441 1.6334 2.9997.5c.2222-.2889.511-.4333.8666-.4333.3556-.0222.6556.0889.9.3333.2445.2445.3667.5333.3667.8667 0 .3333-.1111.6444-.3333.9333-.7556.9333-1.3445 1.9667-1.7667 3.1-.4 1.1334-.6 2.3445-.6 3.6334Z"
                />
                {/* Inner left arc */}
                <path
                    className="pulse-inner"
                    fill="currentColor"
                    style={{ opacity: restOpacity }}
                    d="M7.7663 8.9334c0 .5555.0778 1.0888.2334 1.5999.1555.4889.3777.9445.6666 1.3667.1778.2889.2556.6111.2334.9667 0 .3333-.1222.6222-.3667.8666-.2444.2445-.5333.3667-.8667.3667-.3333-.0222-.6-.1667-.8-.4333-.4889-.6667-.8666-1.4-1.1333-2.2a8.1612 8.1612 0 0 1-.4-2.5333c0-.889.1333-1.7334.4-2.5334.2667-.8.6444-1.5333 1.1333-2.2.2-.2667.4667-.4.8-.4.3556-.0222.6556.0889.9.3334.2445.2444.3667.5444.3667.9.0222.3333-.0667.6444-.2667.9333-.2889.4222-.511.8889-.6666 1.4-.1556.4889-.2334 1.011-.2334 1.5667Z"
                />
                {/* Center circle */}
                <path
                    className="pulse-circle"
                    fill="currentColor"
                    style={{ opacity: restOpacity }}
                    d="M13.333 11.6c-.7333 0-1.3667-.2555-1.9-.7667-.5111-.5333-.7667-1.1666-.7667-1.9 0-.7333.2556-1.3555.7667-1.8666.5333-.5333 1.1667-.8 1.9-.8.7333 0 1.3556.2667 1.8667.8.5333.511.8 1.1333.8 1.8667 0 .7333-.2667 1.3666-.8 1.8999-.5111.5112-1.1334.7667-1.8667.7667Z"
                />
                {/* Inner right arc */}
                <path
                    className="pulse-inner"
                    fill="currentColor"
                    style={{ opacity: restOpacity }}
                    d="M18.8997 8.9334c0-.5556-.0778-1.0778-.2334-1.5667-.1555-.5111-.3777-.9778-.6666-1.4-.1778-.289-.2667-.6-.2667-.9333.0222-.3556.1556-.6556.4-.9.2445-.2445.5333-.3556.8667-.3334.3333 0 .6.1334.8.4.4889.6667.8666 1.4 1.1333 2.2.2667.8.4 1.6445.4 2.5334a8.1603 8.1603 0 0 1-.4 2.5333c-.2667.8-.6444 1.5222-1.1333 2.1666-.2.2889-.4778.4334-.8334.4334-.3333 0-.6222-.1222-.8666-.3667-.2445-.2444-.3778-.5333-.4-.8667 0-.3333.1-.6444.3-.9333a5.196 5.196 0 0 0 .6666-1.3667c.1556-.5111.2334-1.0444.2334-1.6Z"
                />
                {/* Outer right arc */}
                <path
                    className="pulse-outer"
                    fill="currentColor"
                    style={{ opacity: restOpacity }}
                    d="M24.233 8.9334c0-1.289-.2111-2.5-.6333-3.6334-.4-1.1555-.9778-2.1889-1.7334-3.1-.2222-.2889-.3444-.6-.3666-.9333 0-.3556.1222-.6556.3666-.9.2445-.2445.5445-.3556.9-.3334.3778.0223.6778.1778.9.4667.9556 1.1334 1.6889 2.4222 2.2 3.8667.5334 1.4222.8 2.9444.8 4.5667 0 1.6222-.2666 3.1444-.8 4.5666-.5111 1.4222-1.2444 2.7111-2.2 3.8667-.2222.2889-.5111.4444-.8666.4666-.3556 0-.6556-.1222-.9-.3666-.2445-.2445-.3667-.5334-.3667-.8667 0-.3333.1111-.6444.3333-.9333a10.3843 10.3843 0 0 0 1.7334-3.1c.4222-1.1334.6333-2.3445.6333-3.6334Z"
                />
            </svg>

            {/* Hold near Tag text */}
            <motion.span
                className={styles.nfcIconLabel}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
            >
                Hold near Tag
            </motion.span>
        </div>
    );
};
