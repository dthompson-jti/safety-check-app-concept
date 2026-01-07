// src/features/Shell/ScanAnimationF.tsx
import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWaveBarsAnimation, WaveBarsAnimationParams, DEFAULT_WAVE_BARS_PARAMS } from './useWaveBarsAnimation';
import styles from './NfcScanButton.module.css';

interface ScanAnimationFProps {
    isEnabled: boolean;
    params?: Partial<WaveBarsAnimationParams>;
}

/**
 * Scan Animation F
 * 
 * Restored NFC icon style: Simplified NFC icon SVG with inner dot, 
 * positioned inline 8px beside "Hold near Tag" text.
 * The SVG paths (wave arcs) animate outward from the center using the shared wave animation hook.
 */
export const ScanAnimationF: React.FC<ScanAnimationFProps> = ({
    isEnabled,
    params: paramOverrides,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Merge params with defaults - using 3 paths for left arcs and 3 for right arcs
    const params = useMemo<WaveBarsAnimationParams>(() => ({
        ...DEFAULT_WAVE_BARS_PARAMS,
        pathCount: 3,  // 3 arcs per side (inner, middle, outer)
        restOpacity: 0.5,
        peakOpacity: 1.0,
        ...paramOverrides,
    }), [paramOverrides]);

    // Run WAAPI animations on paths
    useWaveBarsAnimation(containerRef, params, isEnabled);

    if (!isEnabled) return null;

    return (
        <div ref={containerRef} className={styles.nfcIconContainer}>
            {/* NFC Icon SVG - simplified with inner dot, no outer band */}
            <svg
                className={styles.nfcIconSvg}
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="17"
                viewBox="-1.5 0 28 17"
                fill="none"
            >
                {/* Left side arcs - shifted left by 1.5px to accommodate larger dot */}
                <g transform="translate(-1.5, 0)">
                    {/* Path 0 - innermost left */}
                    <path
                        className="wave-path"
                        fill="currentColor"
                        style={{ opacity: params.restOpacity }}
                        d="M9.8837 5.4232c-.369-.349-.9749-.3524-1.2775.0497a5.283 5.283 0 0 0-.6191 1.0575 5.1099 5.1099 0 0 0-.4314 2.0515 5.11 5.11 0 0 0 .4314 2.0514c.164.3744.3718.729.6191 1.0576.3026.402.9085.3986 1.2775.0496.3689-.349.3562-.9113.09-1.3358a3.498 3.498 0 0 1-.241-.4553 3.4063 3.4063 0 0 1-.2875-1.3675c0-.4693.0977-.934.2876-1.3675a3.5009 3.5009 0 0 1 .2409-.4554c.2662-.4245.2789-.9868-.09-1.3358Z"
                    />
                    {/* Path 1 - middle left */}
                    <path
                        className="wave-path"
                        fill="currentColor"
                        style={{ opacity: params.restOpacity }}
                        d="M7.212 2.7931c-.3689-.3489-.9711-.3514-1.3013.0306-.5833.6747-1.0602 1.428-1.4141 2.2362-.4747 1.084-.719 2.2458-.719 3.419 0 1.1733.2443 2.3351.719 3.4191.354.8082.8308 1.5614 1.414 2.2362.3303.382.9325.3794 1.3014.0305.3689-.3489.3635-.9116.0434-1.3013a7.0672 7.0672 0 0 1-1.0135-1.6492c-.3798-.8672-.5752-1.7966-.5752-2.7353 0-.9386.1954-1.868.5752-2.7352a7.0666 7.0666 0 0 1 1.0135-1.6493c.32-.3897.3255-.9524-.0434-1.3013Z"
                    />
                    {/* Path 2 - outermost left */}
                    <path
                        className="wave-path"
                        fill="currentColor"
                        style={{ opacity: params.restOpacity }}
                        d="M4.5277.2546c-.3615-.342-.9503-.3439-1.2857.0211C2.3083 1.2921 1.553 2.446 1.0066 3.6934.342 5.2109 0 6.8374 0 8.48c0 1.6426.342 3.2691 1.0066 4.7867.5463 1.2475 1.3017 2.4013 2.2354 3.4176.3354.365.9242.3631 1.2857.0212.3615-.342.3582-.8942.0273-1.2628-.7641-.8512-1.3848-1.8112-1.838-2.8462-.5715-1.3051-.8657-2.7039-.8657-4.1165 0-1.4126.2942-2.8114.8657-4.1165.4532-1.035 1.0739-1.995 1.838-2.8462.331-.3686.3342-.9208-.0273-1.2627Z"
                    />
                </g>

                {/* Center dot - 2x size with gentle opacity oscillation */}
                <circle cx="12.168" cy="8.429" r="2" fill="currentColor" className={styles.nfcIconDot} />

                {/* Right side arcs - shifted right by 1.5px to accommodate larger dot */}
                <g transform="translate(1.5, 0)">
                    {/* Path 0 - innermost right */}
                    <path
                        className="wave-path"
                        fill="currentColor"
                        style={{ opacity: params.restOpacity }}
                        d="M14.4513 5.4232c.3689-.349.9748-.3524 1.2774.0497.2473.3285.4552.6832.6192 1.0575a5.11 5.11 0 0 1 .4314 2.0515c0 .704-.1466 1.401-.4314 2.0514a5.2863 5.2863 0 0 1-.6192 1.0576c-.3026.402-.9085.3986-1.2774.0496-.3689-.349-.3562-.9113-.09-1.3358.0914-.1458.172-.298.2409-.4553a3.4055 3.4055 0 0 0 .2876-1.3675c0-.4693-.0977-.934-.2876-1.3675a3.5055 3.5055 0 0 0-.2409-.4554c-.2662-.4245-.2789-.9868.09-1.3358Z"
                    />
                    {/* Path 1 - middle right */}
                    <path
                        className="wave-path"
                        fill="currentColor"
                        style={{ opacity: params.restOpacity }}
                        d="M17.1229 2.7931c.3689-.3489.9712-.3514 1.3014.0306.5833.6747 1.0601 1.428 1.4141 2.2362.4747 1.084.719 2.2458.719 3.419 0 1.1733-.2443 2.3351-.719 3.4191-.354.8082-.8308 1.5614-1.4141 2.2362-.3302.382-.9325.3794-1.3014.0305-.3688-.3489-.3634-.9116-.0434-1.3013a7.0677 7.0677 0 0 0 1.0136-1.6492c.3797-.8672.5752-1.7966.5752-2.7353 0-.9386-.1955-1.868-.5752-2.7352a7.0668 7.0668 0 0 0-1.0136-1.6493c-.32-.3897-.3254-.9524.0434-1.3013Z"
                    />
                    {/* Path 2 - outermost right */}
                    <path
                        className="wave-path"
                        fill="currentColor"
                        style={{ opacity: params.restOpacity }}
                        d="M19.8073.2546c.3615-.342.9503-.3439 1.2856.0211.9337 1.0164 1.6892 2.1702 2.2355 3.4177.6645 1.5175 1.0066 3.144 1.0066 4.7866 0 1.6426-.3421 3.2691-1.0066 4.7867-.5463 1.2475-1.3018 2.4013-2.2355 3.4176-.3353.365-.9241.3631-1.2856.0212-.3615-.342-.3583-.8942-.0274-1.2628.7642-.8512 1.3848-1.8112 1.8381-2.8462.5715-1.3051.8656-2.7039.8656-4.1165 0-1.4126-.2941-2.8114-.8656-4.1165-.4533-1.035-1.0739-1.995-1.8381-2.8462-.3309-.3686-.3341-.9208.0274-1.2627Z"
                    />
                </g>
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
