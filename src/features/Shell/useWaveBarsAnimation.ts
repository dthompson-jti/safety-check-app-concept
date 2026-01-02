// src/features/Shell/useWaveBarsAnimation.ts
import { useLayoutEffect, useRef, useCallback } from 'react';

/**
 * WAAPI-based Wave Bars Animation System
 * 
 * ## Overview
 * Sequential opacity pulse animation for 4-bar wave visualization.
 * Creates an outward wave effect by staggering opacity keyframes.
 * 
 * ## Animation Timing
 * - Pulse Duration: 800ms per wave cycle
 * - Path Stagger: 100ms between each path (1→2→3→4)
 * - Pulse Interval: 2500ms between wave starts
 * - Rest Opacity: 0.15 (visible but subtle)
 * - Peak Opacity: 0.65 (prominent highlight)
 * 
 * ## Color Semantics
 * - Path fill: `--surface-fg-secondary` (applied via CSS)
 */

export interface WaveBarsAnimationParams {
    pathCount: number;
    pulseInterval: number;    // ms between pulse starts
    pulseDuration: number;    // ms for one path's pulse
    pathStagger: number;      // ms between path starts
    restOpacity: number;
    peakOpacity: number;
}

export const DEFAULT_WAVE_BARS_PARAMS: WaveBarsAnimationParams = {
    pathCount: 4,
    pulseInterval: 2000,      // Longer pause between waves
    pulseDuration: 1400,      // Slower fade in/out
    pathStagger: 300,         // Slower wave propagation
    restOpacity: 0.15,
    peakOpacity: 0.35,        // Moderate highlight
};

/**
 * Creates opacity keyframes for a single path pulse
 */
function createPulseKeyframes(restOpacity: number, peakOpacity: number): Keyframe[] {
    return [
        { opacity: restOpacity, offset: 0 },
        { opacity: peakOpacity, offset: 0.3 },  // Quick rise to peak
        { opacity: restOpacity, offset: 1 },    // Gradual fall back
    ];
}

/**
 * Main hook for WAAPI wave bars animation
 */
export function useWaveBarsAnimation(
    containerRef: React.RefObject<HTMLDivElement | null>,
    params: WaveBarsAnimationParams = DEFAULT_WAVE_BARS_PARAMS,
    isEnabled: boolean
): void {
    const animationsRef = useRef<Animation[]>([]);
    const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Trigger a single pulse wave across all paths
    const triggerPulseWave = useCallback(() => {
        if (!containerRef.current) return;

        // Select all paths from both SVGs (left and right)
        const paths = containerRef.current.querySelectorAll('path.wave-path');

        paths.forEach((path, index) => {
            // Calculate which bar this is (0-3, repeating for left/right)
            const barIndex = index % params.pathCount;

            // Stagger delay based on bar position (inner bars first)
            const staggerDelay = barIndex * params.pathStagger;

            const anim = path.animate(
                createPulseKeyframes(params.restOpacity, params.peakOpacity),
                {
                    duration: params.pulseDuration,
                    easing: 'ease-out',
                    delay: staggerDelay,
                    fill: 'forwards',
                }
            );

            animationsRef.current.push(anim);

            // Cleanup animation reference when finished
            anim.onfinish = () => {
                const idx = animationsRef.current.indexOf(anim);
                if (idx > -1) {
                    animationsRef.current.splice(idx, 1);
                }
            };
        });
    }, [containerRef, params]);

    // Setup animation loop
    useLayoutEffect(() => {
        if (!containerRef.current || !isEnabled) {
            return;
        }

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        // Immediate first pulse
        triggerPulseWave();

        // Setup continuous pulse interval
        pulseIntervalRef.current = setInterval(() => {
            triggerPulseWave();
        }, params.pulseInterval);

        // Cleanup
        return () => {
            // Cancel all running animations
            animationsRef.current.forEach(anim => anim.cancel());
            animationsRef.current = [];

            // Clear interval
            if (pulseIntervalRef.current) {
                clearInterval(pulseIntervalRef.current);
                pulseIntervalRef.current = null;
            }
        };
    }, [containerRef, isEnabled, params, triggerPulseWave]);
}
