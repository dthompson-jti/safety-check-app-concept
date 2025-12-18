// src/features/Shell/useRingAnimation.ts
import { useLayoutEffect, useRef, RefObject, useCallback } from 'react';

/**
 * WAAPI-based Ring Animation System
 * 
 * Two-layer architecture:
 * 1. Conveyor Belt: Rings flow from center to edge with fade in/out
 * 2. Shimmer Overlay: Periodic ripple that propagates outward
 */

export interface RingAnimationParams {
    // Conveyor belt
    ringCount: number;
    conveyorDuration: number; // seconds
    minRadius: number;
    maxRadius: number;
    baseOpacity: number;
    fadeInPercent: number;  // 0-1
    fadeOutPercent: number; // 0-1
    baseStrokeWidth: number;

    // Shimmer overlay
    shimmerPeriod: number;  // seconds between shimmer starts
    shimmerDuration: number; // seconds for shimmer to sweep all rings
    shimmerOpacityBoost: number; // added to base opacity
    shimmerStrokeBoost: number;  // added to base stroke width
}

export const DEFAULT_RING_PARAMS: RingAnimationParams = {
    ringCount: 15,
    conveyorDuration: 40,
    minRadius: 8,
    maxRadius: 80,
    baseOpacity: 0.3,
    fadeInPercent: 0.2,
    fadeOutPercent: 0.3,
    baseStrokeWidth: 2,

    shimmerPeriod: 4,
    shimmerDuration: 1,
    shimmerOpacityBoost: 0.55,
    shimmerStrokeBoost: 1,
};

interface RingState {
    conveyorAnim: Animation | null;
    shimmerOpacityAnim: Animation | null;
    shimmerStrokeAnim: Animation | null;
}

/**
 * Creates keyframes for the conveyor belt animation
 * Ring fades in during first fadeInPercent, fades out during last fadeOutPercent
 */
function createConveyorKeyframes(
    params: RingAnimationParams,
    _ringIndex: number
): Keyframe[] {
    const { minRadius, maxRadius, baseOpacity, fadeInPercent, fadeOutPercent, baseStrokeWidth } = params;

    // Phase offset for this ring (evenly distributed across cycle)
    // Not used here since we apply it via animation delay

    return [
        // Start: small radius, invisible
        { r: minRadius, opacity: 0, strokeWidth: baseStrokeWidth, offset: 0 },
        // After fade in: visible
        { r: minRadius + (maxRadius - minRadius) * fadeInPercent, opacity: baseOpacity, strokeWidth: baseStrokeWidth, offset: fadeInPercent },
        // Before fade out: still visible
        { r: minRadius + (maxRadius - minRadius) * (1 - fadeOutPercent), opacity: baseOpacity, strokeWidth: baseStrokeWidth, offset: 1 - fadeOutPercent },
        // End: large radius, invisible
        { r: maxRadius, opacity: 0, strokeWidth: baseStrokeWidth, offset: 1 },
    ];
}

/**
 * Creates keyframes for a single shimmer pulse on a ring
 * Rise quickly to peak, fall back to baseline
 */
function createShimmerOpacityKeyframes(opacityBoost: number): Keyframe[] {
    return [
        { opacity: 0, offset: 0 },          // Start at no boost
        { opacity: opacityBoost, offset: 0.3 }, // Quick rise to peak
        { opacity: 0, offset: 1 },          // Fade back to no boost
    ];
}

function createShimmerStrokeKeyframes(strokeBoost: number): Keyframe[] {
    return [
        { strokeWidth: 0, offset: 0 },
        { strokeWidth: strokeBoost, offset: 0.3 },
        { strokeWidth: 0, offset: 1 },
    ];
}

/**
 * Main hook for WAAPI ring animation
 */
export function useRingAnimation(
    svgRef: RefObject<SVGSVGElement | null>,
    params: RingAnimationParams,
    isEnabled: boolean
): void {
    const ringStatesRef = useRef<RingState[]>([]);
    const shimmerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mountTimeRef = useRef<number>(0);

    // Trigger a shimmer wave across all rings
    const triggerShimmerWave = useCallback(() => {
        if (!svgRef.current) return;

        const rings = svgRef.current.querySelectorAll('circle.ring');

        // Calculate current time in the conveyor cycle to sync shimmer start
        const now = performance.now();
        const elapsedSinceMount = now - mountTimeRef.current;
        const conveyorCycleMs = params.conveyorDuration * 1000;

        rings.forEach((ring, i) => {
            // Cancel any existing shimmer on this ring
            const state = ringStatesRef.current[i];
            if (state?.shimmerOpacityAnim) {
                state.shimmerOpacityAnim.cancel();
            }
            if (state?.shimmerStrokeAnim) {
                state.shimmerStrokeAnim.cancel();
            }

            // Calculate this ring's current position in the conveyor (0 = innermost, 1 = outermost)
            const ringPhaseOffset = (i / params.ringCount);
            const currentPhase = ((elapsedSinceMount / conveyorCycleMs) + ringPhaseOffset) % 1;

            // Shimmer delay based on current phase
            const shimmerDelay = currentPhase * params.shimmerDuration * 1000;

            // Attenuation: reduce shimmer boost in the fade-out zone
            // Phase 0 to (1 - fadeOut) = full boost
            // Phase (1 - fadeOut) to 1 = linear fade to 0
            const fadeOutStart = 1 - params.fadeOutPercent;
            let attenuation = 1;
            if (currentPhase > fadeOutStart) {
                // Linear fade from 1 to 0 across the fade-out zone
                attenuation = 1 - ((currentPhase - fadeOutStart) / params.fadeOutPercent);
            }
            // Also attenuate in fade-in zone for consistency
            if (currentPhase < params.fadeInPercent) {
                attenuation = currentPhase / params.fadeInPercent;
            }

            const attenuatedOpacityBoost = params.shimmerOpacityBoost * attenuation;
            const attenuatedStrokeBoost = params.shimmerStrokeBoost * attenuation;

            const opacityAnim = ring.animate(
                createShimmerOpacityKeyframes(attenuatedOpacityBoost),
                {
                    duration: 800, // Single pulse duration
                    easing: 'ease-in-out',
                    delay: shimmerDelay,
                    fill: 'forwards',
                    composite: 'add', // ADDITIVE - adds to base opacity
                }
            );

            const strokeAnim = ring.animate(
                createShimmerStrokeKeyframes(attenuatedStrokeBoost),
                {
                    duration: 800,
                    easing: 'ease-in-out',
                    delay: shimmerDelay,
                    fill: 'forwards',
                    composite: 'add',
                }
            );

            // Store reference
            if (ringStatesRef.current[i]) {
                ringStatesRef.current[i].shimmerOpacityAnim = opacityAnim;
                ringStatesRef.current[i].shimmerStrokeAnim = strokeAnim;
            }
        });

        console.log('[RingAnimation] Shimmer wave triggered at elapsed:', elapsedSinceMount);
    }, [svgRef, params]);

    // Setup conveyor animations
    useLayoutEffect(() => {
        if (!svgRef.current || !isEnabled) {
            return;
        }

        const svg = svgRef.current;
        const rings = svg.querySelectorAll('circle.ring');

        // Capture mount time for sync
        mountTimeRef.current = Number(document.timeline?.currentTime ?? performance.now());
        console.log('[RingAnimation] Mount time:', mountTimeRef.current);

        // Initialize ring states
        ringStatesRef.current = [];

        rings.forEach((ring, i) => {
            // Calculate phase offset - rings are evenly distributed
            const phaseOffset = i / params.ringCount;
            const delayMs = -phaseOffset * params.conveyorDuration * 1000;

            // Create conveyor animation
            const conveyorAnim = ring.animate(
                createConveyorKeyframes(params, i),
                {
                    duration: params.conveyorDuration * 1000,
                    iterations: Infinity,
                    easing: 'linear',
                }
            );

            // Sync to mount time with phase offset
            conveyorAnim.currentTime = -delayMs;

            ringStatesRef.current.push({
                conveyorAnim,
                shimmerOpacityAnim: null,
                shimmerStrokeAnim: null,
            });

            console.log(`[RingAnimation] Ring ${i} conveyor started, phase offset: ${phaseOffset}`);
        });

        // Setup shimmer interval
        shimmerIntervalRef.current = setInterval(() => {
            triggerShimmerWave();
        }, params.shimmerPeriod * 1000);

        // Immediate first shimmer
        triggerShimmerWave();

        // Cleanup
        return () => {
            ringStatesRef.current.forEach(state => {
                state.conveyorAnim?.cancel();
                state.shimmerOpacityAnim?.cancel();
                state.shimmerStrokeAnim?.cancel();
            });
            ringStatesRef.current = [];

            if (shimmerIntervalRef.current) {
                clearInterval(shimmerIntervalRef.current);
                shimmerIntervalRef.current = null;
            }

            console.log('[RingAnimation] Cleanup complete');
        };
    }, [svgRef, isEnabled, params, triggerShimmerWave]);
}

/**
 * Hook for reduced motion - returns static ring positions
 */
export function useStaticRings(params: RingAnimationParams): number[] {
    const radii: number[] = [];
    const { ringCount, minRadius, maxRadius } = params;

    for (let i = 0; i < ringCount; i++) {
        const progress = i / ringCount;
        radii.push(minRadius + (maxRadius - minRadius) * progress);
    }

    return radii;
}
