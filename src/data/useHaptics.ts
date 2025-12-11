// src/data/useHaptics.ts
import { useAtomValue } from 'jotai';
import { useCallback, useRef } from 'react';
import { appConfigAtom, HapticSuccessPattern, HapticErrorPattern } from './atoms';

type HapticType = 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'selection';

// Configurable Success Patterns
const SUCCESS_PATTERNS: Record<HapticSuccessPattern, number[]> = {
  light: [50],
  medium: [100],
  heavy: [150],
};

// Configurable Error Patterns
const ERROR_PATTERNS: Record<HapticErrorPattern, number[]> = {
  simple: [200],                      // Single long buzz
  double: [300, 100, 300],           // Double heavy buzz
  grind: [50, 50, 50, 50, 50, 50],   // Rapid-fire grind
  stutter: [50, 100, 50, 100, 200],  // Syncopated stutter
};

// Static Patterns (Non-configurable)
const STATIC_PATTERNS: Record<'warning' | 'light' | 'medium' | 'heavy' | 'selection', number | number[]> = {
  warning: [100, 50, 100],
  light: 10,
  medium: 40,
  heavy: 60,
  selection: 5,
};

const HAPTIC_THROTTLE_MS = 150;

export const useHaptics = () => {
  const appConfig = useAtomValue(appConfigAtom);
  const lastVibrationTimestamp = useRef(0);

  const trigger = useCallback(
    (type: HapticType) => {
      if (appConfig.hapticsEnabled && window.navigator && 'vibrate' in window.navigator) {
        const now = Date.now();
        if (now - lastVibrationTimestamp.current < HAPTIC_THROTTLE_MS) {
          return;
        }
        try {
          let pattern: number | number[];

          // Lookup pattern based on type
          if (type === 'success') {
            pattern = SUCCESS_PATTERNS[appConfig.hapticPatternSuccess];
          } else if (type === 'error') {
            pattern = ERROR_PATTERNS[appConfig.hapticPatternError];
          } else {
            pattern = STATIC_PATTERNS[type];
          }

          window.navigator.vibrate(pattern);
          lastVibrationTimestamp.current = now;
        } catch {
          // Ignore environments where vibration is unsupported
        }
      }
    },
    [appConfig.hapticsEnabled, appConfig.hapticPatternSuccess, appConfig.hapticPatternError]
  );

  return { trigger };
};