// src/data/audioAtoms.ts
import { atom } from 'jotai';

export type SoundId = 'success' | 'error';

export interface PlaySoundOptions {
  volume?: number;
}

// A simplified dispatcher type
type PlaySoundFunction = (id: SoundId, options?: PlaySoundOptions) => void;

// FIX: Pass the initial value directly to make it a writable primitive atom.
export const playSoundDispatcherAtom = atom<PlaySoundFunction>(() => {});