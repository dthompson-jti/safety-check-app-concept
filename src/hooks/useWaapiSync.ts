/**
 * useWaapiSync - "Zero-Time Protocol" Animation Synchronization
 * 
 * Forces all CSS animations on an element (and its ::before/::after pseudos)
 * to share a common startTime of 0, ensuring perfect synchronization
 * regardless of when the component mounted.
 * 
 * @see docs/WAAPI-STRATEGY.md for deep-dive rationale.
 */
import { useLayoutEffect, RefObject, useRef, useCallback } from 'react';

// Animation names we want to synchronize (matches CSS keyframe names)
const SYNCABLE_ANIMATION_NAMES = [
    'pulse-basic',
    'pulse-gradient',
    'magma-flow',
    'border-pulse',
    'hazard-fade',
    'card-pulse-basic',
    'card-pulse-gradient',
    'indicator-pulse',
    'badge-pulse',
    'glass-tint-pulse',
    // NFC scan animations
    'pulseRingExpand',
    'shimmerOpacity',
];

interface UseWaapiSyncOptions {
    /** Whether the animated element is currently active (e.g., has late checks) */
    isEnabled: boolean;
    /** Optional: specific animation names to sync. Defaults to SYNCABLE_ANIMATION_NAMES */
    animationNames?: string[];
}

/**
 * Synchronizes all CSS animations on the element to startTime = 0.
 * 
 * @param ref - React ref to the animated element
 * @param options - { isEnabled: boolean }
 */
export function useWaapiSync<T extends Element>(
    ref: RefObject<T | null>,
    options: UseWaapiSyncOptions
): void {
    const { isEnabled, animationNames = SYNCABLE_ANIMATION_NAMES } = options;

    // Track whether reduced motion is preferred
    const prefersReducedMotion = useRef(false);
    if (typeof window !== 'undefined') {
        prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    useLayoutEffect(() => {
        // Early return if disabled, no ref, or reduced motion
        if (!isEnabled || !ref.current || prefersReducedMotion.current) {
            return;
        }

        const element = ref.current;

        /**
         * Sync Function: Forces startTime = 0 for target animations
         */
        const syncAnimation = (anim: Animation) => {
            // CSSAnimation has animationName property
            if ('animationName' in anim) {
                const animName = (anim as CSSAnimation).animationName;
                // Loose match: Check if the hashed name contains our target name
                if (animationNames.some(target => animName.includes(target))) {
                    // The "Nuclear" Sync: Force startTime to document timeline origin
                    // This makes the animation jump to the correct phase immediately.
                    anim.startTime = 0;
                    console.log(`[useWaapiSync] Synced '${animName}' to startTime=0`);
                }
            }
        };

        // 1. Initial Check: Sync any animations already running
        // We handle this synchronously to prevent visual flash if possible
        const animations = element.getAnimations({ subtree: true });
        animations.forEach(syncAnimation);

        // 2. Event Listener: Catch animations that start LATER (e.g. race conditions, class changes)
        // Note: 'animationstart' bubbles from pseudo-elements to the host element.
        const handleAnimationStart = (e: AnimationEvent) => {
            // Loose match check for event
            if (animationNames.some(target => e.animationName.includes(target))) {
                // We can't get the Animation object directly from the event, 
                // but we can find it via getAnimations() now that it has started.
                const currentAnimations = element.getAnimations({ subtree: true });
                const targetAnim = currentAnimations.find(
                    a => (a as CSSAnimation).animationName === e.animationName
                );
                if (targetAnim) {
                    syncAnimation(targetAnim);
                }
            }
        };

        // Cast needed because Element type doesn't include animationstart in its event map
        element.addEventListener('animationstart', handleAnimationStart as EventListener);

        return () => {
            element.removeEventListener('animationstart', handleAnimationStart as EventListener);
        };
    }, [isEnabled, ref, animationNames]);
}

/**
 * Creates a ref and sync function bundle for components that
 * need to sync animations triggered by class changes.
 */
export function useWaapiSyncRef<T extends HTMLElement>(
    options: UseWaapiSyncOptions
): [RefObject<T | null>, () => void] {
    const ref = useRef<T | null>(null);

    const syncNow = useCallback(() => {
        if (!ref.current || !options.isEnabled) return;

        const animations = ref.current.getAnimations({ subtree: true });
        animations.forEach((anim) => {
            if ('animationName' in anim) {
                const cssAnim = anim as CSSAnimation;
                if (SYNCABLE_ANIMATION_NAMES.some(target => cssAnim.animationName.includes(target))) {
                    cssAnim.startTime = 0;
                }
            }
        });
    }, [options.isEnabled]);

    // Also run on mount/enable change
    useWaapiSync(ref, options);

    return [ref, syncNow];
}
