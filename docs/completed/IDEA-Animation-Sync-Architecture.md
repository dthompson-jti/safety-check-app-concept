# IDEA: Animation Sync Architecture

## Problem Statement
The current animation synchronization approach has proven fundamentally flawed. Multiple attempts to sync CSS animations across components have failed:

1. **Per-mount delay calculation**: Components mounting at different times get different delays
2. **Cached delay**: First-call caching causes newly mounted components to be out of phase
3. **Dual CSS variables**: `--glass-sync-delay` vs `--card-sync-delay` created confusion
4. **Inline style override**: Inline `animationDelay` overrides CSS `animation-delay` rules

## Current Behavior (Broken)
- Header, Footer, and Cards all animate independently
- Newly mounted cards are out of phase with existing cards
- Even after multiple fixes, sync remains unreliable

## Proposed Solution: Global Animation Clock

### Option A: CSS Houdini Animation Worklet
Use CSS Houdini to create a shared animation timeline that all elements reference.
- **Pros**: True synchronization, browser-native performance
- **Cons**: Limited browser support, complex implementation

### Option B: JavaScript Animation Controller
Drive all pulse animations from a single `requestAnimationFrame` loop that updates CSS variables.
```typescript
// Single source of truth for animation phase
const pulsePhase = (Date.now() % 1200) / 1200; // 0-1 normalized
document.body.style.setProperty('--pulse-phase', pulsePhase);
```
- **Pros**: Guaranteed sync, works in all browsers
- **Cons**: More CPU usage, potential for jank

### Option C: Keyframe Animation with Fill Mode
Instead of using `animation-delay`, use a single animation that runs continuously and reference it via `animation-name`.
```css
/* Global animation runs on body */
body {
  animation: global-pulse-clock 1.2s linear infinite;
}

/* Elements reference global timing via inherit */
.pulsing-element::before {
  animation: pulse-basic 1.2s ease-in-out infinite;
  animation-play-state: inherit;
}
```
- **Pros**: Pure CSS, no JavaScript needed
- **Cons**: Uncertain if inheritance works for animation timing

### Option D: Web Animations API (Preferred)
Use the Web Animations API to create and sync animations programmatically.
```typescript
// Create a single animation timeline
const timeline = document.timeline;
const effect = new KeyframeEffect(element, keyframes, { 
  duration: 1200, 
  iterations: Infinity,
  composite: 'replace'
});
const animation = new Animation(effect, timeline);
animation.startTime = 0; // All animations start at timeline origin
animation.play();
```
- **Pros**: Full control, guaranteed sync, good browser support
- **Cons**: Requires refactoring away from CSS animations

## Acceptance Criteria
1. All pulsing elements (header, footer, cards, badges) must be visually synchronized
2. Newly mounted elements must immediately be in phase with existing elements
3. No visible "snap" or discontinuity when elements mount
4. Works across all supported browsers (Chrome, Safari, Firefox)
5. Respects `prefers-reduced-motion`

## Technical Constraints
- Must work with Framer Motion for exit animations
- Must not cause layout thrashing or excessive repaints
- Must maintain 60fps performance

## Related Files
- `src/hooks/useEpochSync.ts` - Current (broken) sync hook
- `src/features/LateEffects/PulseEffectsManager.tsx` - Sets body attributes
- `src/features/Shell/AppHeader.module.css` - Header pulse CSS
- `src/features/Schedule/CheckCard.module.css` - Card pulse CSS

## Priority
High - Animation sync is a core "high-craft" requirement per project principles.
