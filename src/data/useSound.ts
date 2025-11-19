// src/data/useSound.ts
import { useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { appConfigAtom } from './atoms';

type SoundType = 'success' | 'error';

// Interface to satisfy TypeScript for the webkit prefix
interface WindowWithWebAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

/**
 * A hook for playing UI sound effects using the Web Audio API.
 * This avoids the need for loading external assets or large Base64 strings.
 */
export const useSound = () => {
  const { hapticsEnabled } = useAtomValue(appConfigAtom);

  const play = useCallback((type: SoundType) => {
    // If haptics/sounds are disabled (conceptually linked for this prototype), return.
    if (!hapticsEnabled) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as WindowWithWebAudio).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === 'success') {
        // Success: High pitch sine beep
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
      } else {
        // Error: Low pitch sawtooth buzz
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
      }

    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }, [hapticsEnabled]);

  return { play };
};