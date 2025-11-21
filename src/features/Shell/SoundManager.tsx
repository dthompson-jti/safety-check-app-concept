// src/features/Shell/SoundManager.tsx
import { useEffect } from 'react';
import useSound from 'use-sound';
import { useSetAtom } from 'jotai';
import { playSoundDispatcherAtom, SoundId, PlaySoundOptions } from '../../data/audioAtoms';

// FIX: Use import.meta.env.BASE_URL to handle deployment subpaths correctly.
const BASE_URL = import.meta.env.BASE_URL;
const SUCCESS_URL = `${BASE_URL}success.mp3`;
const ERROR_URL = `${BASE_URL}error.mp3`;

interface ExposedSound {
  volume: (vol: number) => void;
}

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