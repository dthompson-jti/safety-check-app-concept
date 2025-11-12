// src/data/useHaptics.ts
import { useAtomValue } from 'jotai';
import { useCallback, useRef } from 'react';
import { appConfigAtom } from './atoms';

type HapticType = 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'selection';

const patterns: Record<HapticType, number | number[]> = {
  // Semantic patterns
  success: [50],
  warning: [100, 30, 100], // Two quick pulses for alert
  error: [200, 50, 50],    // Longer pulse followed by short one

  // Intensity patterns
  light: 20,
  medium: 40,
  heavy: 60,
  selection: 10,
};

// The minimum time in milliseconds that must pass between haptic triggers.
const HAPTIC_THROTTLE_MS = 500;

/**
 * A hook to provide standardized haptic feedback, respecting user settings.
 * It uses a robust, time-based throttle to prevent haptic "storms".
 * @returns A function `trigger(type: HapticType)` to play a vibration pattern.
 */
export const useHaptics = () => {
  const { hapticsEnabled } = useAtomValue(appConfigAtom);
  const lastVibrationTimestamp = useRef(0);

  const trigger = useCallback(
    (type: HapticType) => {
      if (hapticsEnabled && window.navigator && 'vibrate' in window.navigator) {
        const now = Date.now();
        // Check if enough time has passed since the last vibration.
        if (now - lastVibrationTimestamp.current < HAPTIC_THROTTLE_MS) {
          return; // It's too soon, so we throttle the request.
        }

        try {
          // Trigger the vibration and update the timestamp.
          window.navigator.vibrate(patterns[type]);
          lastVibrationTimestamp.current = now;
        } catch (e) {
          console.warn('Haptic feedback failed:', e);
        }
      }
    },
    [hapticsEnabled]
  );

  return { trigger };
};