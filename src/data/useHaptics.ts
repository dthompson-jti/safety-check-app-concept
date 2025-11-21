// src/data/useHaptics.ts
import { useAtomValue } from 'jotai';
import { useCallback, useRef } from 'react';
import { appConfigAtom } from './atoms';

type HapticType = 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'selection';

const patterns: Record<HapticType, number | number[]> = {
  success: [50],
  warning: [100, 30, 100], 
  error: [200, 50, 50],    
  light: 10,
  medium: 40,
  heavy: 60,
  selection: 5,
};

const HAPTIC_THROTTLE_MS = 150;

export const useHaptics = () => {
  const { hapticsEnabled } = useAtomValue(appConfigAtom);
  const lastVibrationTimestamp = useRef(0);

  const trigger = useCallback(
    (type: HapticType) => {
      if (hapticsEnabled && window.navigator && 'vibrate' in window.navigator) {
        const now = Date.now();
        if (now - lastVibrationTimestamp.current < HAPTIC_THROTTLE_MS) {
          return; 
        }
        try {
          window.navigator.vibrate(patterns[type]);
          lastVibrationTimestamp.current = now;
        } catch {
          // Ignore environments where vibration is unsupported
        }
      }
    },
    [hapticsEnabled]
  );

  return { trigger };
};