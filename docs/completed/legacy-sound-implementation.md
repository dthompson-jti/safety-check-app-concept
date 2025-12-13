# Legacy Sound Implementation

This document describes the legacy sound implementation that was removed. This serves as a reference in case we want to resurrect it in the future.

## Overview

The sound system was designed to provide audio feedback for success and error states. It used a "headless" manager component to handle audio context and preloading, while exposing a dispatcher via a global Jotai atom.

## Architecture

1.  **Library**: Used `use-sound` (a React hook for Howler.js).
2.  **State Management**: Jotai atoms were used to store the "play" function globally, allowing any component to trigger sounds without prop drilling.
3.  **Headless Manager**: A `SoundManager` component was mounted at the root (`App.tsx`) to initialize the audio engine and update the global dispatcher.

## Implementation Details

### Files

-   `src/features/Shell/SoundManager.tsx`: The core component.
    -   Loaded `success.mp3` and `error.mp3`.
    -   Used `useSound` hook to create play functions.
    -   Updated `playSoundDispatcherAtom` with a unified play function.
-   `src/data/audioAtoms.ts`: Defined the atoms and types.
    -   `playSoundDispatcherAtom`: Held the `(id, options) => void` function.
    -   Types: `SoundId` ('success' | 'error'), `PlaySoundOptions` ({ volume }).
-   `src/data/useAppSound.ts`: Custom hook for consuming components.
    -   Checked `appConfigAtom.audioEnabled` before playing.
    -   Called the global dispatcher.
-   `src/data/atoms.ts`:
    -   `appConfigAtom`: Contained `audioEnabled: boolean`.
-   `src/features/Overlays/SettingsModal.tsx`:
    -   UI toggle for `audioEnabled`.

### Usage Pattern

```typescript
// Component usage
const { play } = useAppSound();
play('success');
```

### Re-implementation Steps

To bring this feature back:

1.  **Restore dependencies**: Ensure `use-sound` is in `package.json`.
2.  **Restore State**: Add `audioEnabled` back to `appConfigAtom`. Refill `src/data/audioAtoms.ts`.
3.  **Restore Manager**: Re-create `src/features/Shell/SoundManager.tsx` (see history or below) and mount it in `App.tsx`.
4.  **Restore Hook**: Re-create `src/data/useAppSound.ts`.
5.  **Restore Assets**: Ensure `public/success.mp3` and `public/error.mp3` exist.

### Code Snippets (Reference)

**SoundManager.tsx**
```typescript
export const SoundManager = () => {
  const setPlaySoundDispatcher = useSetAtom(playSoundDispatcherAtom);
  const [playSuccess] = useSound(SUCCESS_URL);
  const [playError] = useSound(ERROR_URL);

  useEffect(() => {
    setPlaySoundDispatcher(() => (id) => {
      if (id === 'success') playSuccess();
      if (id === 'error') playError();
    });
  }, [setPlaySoundDispatcher, playSuccess, playError]);

  return null; 
};
```
