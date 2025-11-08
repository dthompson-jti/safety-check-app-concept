// src/data/useHaptics.ts
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { appConfigAtom } from './atoms';

type HapticType = 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'selection';

const patterns: Record<HapticType, number | number[]> = {
  success: [100, 50, 100],
  warning: [150, 50, 50],
  error: [200, 75, 200],
  light: 30,
  medium: 60,
  heavy: 100,
  selection: 10,
};

/**
 * A hook to provide standardized haptic feedback, respecting user settings.
 * @returns A function `trigger(type: HapticType)` to play a vibration pattern.
 */
export const useHaptics = () => {
  const { hapticsEnabled } = useAtomValue(appConfigAtom);

  const trigger = useCallback(
    (type: HapticType) => {
      if (hapticsEnabled && window.navigator && 'vibrate' in window.navigator) {
        try {
          window.navigator.vibrate(patterns[type]);
        } catch (e) {
          console.warn('Haptic feedback failed:', e);
        }
      }
    },
    [hapticsEnabled]
  );

  return { trigger };
};