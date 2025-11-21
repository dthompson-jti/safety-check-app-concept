// src/features/Shell/SoundManager.tsx
import { useEffect } from 'react';
import useSound from 'use-sound';
import { useSetAtom } from 'jotai';
import { playSoundDispatcherAtom, SoundId, PlaySoundOptions } from '../../data/audioAtoms';

// Use Vite's base URL to ensure assets load correctly in subpath deployments (e.g. GitHub Pages)
const BASE_URL = import.meta.env.BASE_URL;
const SUCCESS_URL = `${BASE_URL}success.mp3`;
const ERROR_URL = `${BASE_URL}error.mp3`;

interface ExposedSound {
  volume: (vol: number) => void;
}

/**
 * Headless component responsible for initializing the Audio Engine.
 * 
 * Responsibilities:
 * 1. Preloads audio assets on mount to minimize latency.
 * 2. Manages the Howler.js instances via use-sound.
 * 3. Exposes a unified 'play' function to the global playSoundDispatcherAtom.
 * 
 * This component must be mounted at the root of the application tree (App.tsx).
 */
export const SoundManager = () => {
  const setPlaySoundDispatcher = useSetAtom(playSoundDispatcherAtom);

  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  const [playSuccess, { sound: successSound }] = useSound(SUCCESS_URL, { volume: 1.0 });
  const [playError, { sound: errorSound }] = useSound(ERROR_URL, { volume: 1.0 });
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */

  useEffect(() => {
    const playFunction = (id: SoundId, options?: PlaySoundOptions) => {
      const volume = options?.volume ?? 1.0;
      
      switch (id) {
        case 'success':
          if (successSound) (successSound as ExposedSound).volume(volume);
          playSuccess();
          break;
        case 'error':
          if (errorSound) (errorSound as ExposedSound).volume(volume);
          playError();
          break;
      }
    };

    setPlaySoundDispatcher(() => playFunction);
  }, [setPlaySoundDispatcher, playSuccess, playError, successSound, errorSound]);

  return null; 
};