# Debug Diagnosis: Sync Failure

## Problem Statement
Despite implementing the WAAPI `startTime = 0` logic, animations remain desynchronized. The behavior suggests that the WAAPI logic is effectively **doing nothing**, allowing the default CSS behavior (and its drift) to persist.

## Root Cause Analysis

### 1. CSS Module Keyframe Scoping (Primary/Critical)
*   **Mechanism**: Application uses CSS Modules (`.module.css`). By default, Vite/PostCSS hashes class names AND `@keyframe` names to prevent global collisions.
*   **The Mismatch**: 
    *   **CSS Source**: `@keyframes pulse-basic`
    *   **Compiled CSS**: `@keyframes _pulse-basic_x9d2s` (Hash appended)
    *   **JS Logic**: `const SYNCABLE_ANIMATION_NAMES = ['pulse-basic', ...]`
    *   **The Check**: `if (animationNames.includes(animName))`
*   **Result**: The strict string check fails 100% of the time. The hook sees the animations but ignores them because the names don't match the hardcoded list.
*   **Evidence**: Standard Vite configuration in `vite.config.ts` confirms default CSS handling.

### 2. Race Condition (Secondary - Likely Fixed)
*   **Mechanism**: JavaScript executes before Paint, but CSS animations might start 1-2 frames later.
*   **Status**: Addressed by the `animationstart` listener added in the previous step. However, since the listener *also* uses the same strict name check, it is also failing silently.

### 3. Pseudo-Element Targeting
*   **Mechanism**: `element.getAnimations({ subtree: true })` relies on modern browser implementation to catch `::before` pseudos.
*   **Status**: Supported in Chrome/Edge (User's browser), but strictly speaking, if the pseudo-element logic was brittle, it would be a cause. Unlikely given Root Cause #1 is blocking everything first.

### 4. Reduced Motion Preferences
*   **Mechanism**: The hook explicitly disables itself if `prefers-reduced-motion` is detected.
*   **Status**: Possible if the user's OS has this set, but assuming standard environment, this is working as intended (disabling sync).

## Recommended Fix
**Relax Animation Name Matching.**
Instead of strict equality (`===`), use substring matching (`includes`).

**Plan:**
1.  Update `useWaapiSync.ts` to check `animName.includes('pulse-basic')` (or generally `includes` any of the target keywords).
2.  Refactor the check logic to be robust against hash suffixes.

## Verification
After applying the fix, expect to see `[useWaapiSync] Synced ...` logs in the console which were likely missing or "0 synced" before.
