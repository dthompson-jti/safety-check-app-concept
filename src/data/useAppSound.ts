// src/data/useAppSound.ts
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { appConfigAtom } from './atoms';
import { playSoundDispatcherAtom, SoundId, PlaySoundOptions } from './audioAtoms';

export const useAppSound = () => {
    const { audioEnabled } = useAtomValue(appConfigAtom);
    const playGlobal = useAtomValue(playSoundDispatcherAtom);

    const play = useCallback(
        (id: SoundId, options?: PlaySoundOptions) => {
            if (!audioEnabled || !playGlobal) return;
            playGlobal(id, options);
        },
        [audioEnabled, playGlobal]
    );

    return { play };
};
