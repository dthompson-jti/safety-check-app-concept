# NFC Scan Animation Specification
**Status:** Implemented
**Architecture:** WAAPI-based Conveyor Belt + Shimmer System
**Reference:** `src/features/Shell/useRingAnimation.ts`, `WaapiRingVisualizer.tsx`

## 1. Architecture Overview

The NFC scan animation uses a dual-layer WAAPI-based system for high-performance, synchronized ring expansion:

### Conveyor Belt Layer
- **Concept**: Rings expand outward in a continuous "conveyor belt" pattern
- **Ring Count**: 12 rings (configurable) for dense, gap-free coverage
- **Duration**: 4 seconds per full cycle
- **Stagger**: Rings are phase-offset by `(index / ringCount) * duration`
- **Timing**: Linear easing maintains equidistant ring spacing

### Shimmer Overlay (Deprecated)
- Originally provided opacity and stroke-width modulation
- Now simplified: shimmer effects removed in favor of radial attenuation

## 2. Visual Parameters

### Ring Properties
| Parameter | Value | Notes |
|:----------|:------|:------|
| **Ring Count** | 12 | High density for smooth wave effect |
| **Duration** | 4000ms | Slow, "breathing" radar feel |
| **Min Radius** | 8 | Starting size (24px rendered) |
| **Max Radius** | 80 | Fills footer width (240px rendered) |
| **Stroke Width** | 2 | ~6px rendered |
| **Color** | `--surface-border-info` | Semantic blue for scanning state |
| **Base Opacity** | 0.5 | With radial attenuation |

### Radial Attenuation
Outer rings fade to 30% of base opacity as they expand, creating a natural visual falloff:
- Inner rings (at fadeInPercent): 100% of base opacity
- Outer rings (at 1-fadeOutPercent): 30% of base opacity
- Softens the overall visual intensity, especially in light mode

### "Ready to Scan" Label
- **Color**: `--surface-fg-info-primary` (semantic dark blue)
- **Font Size**: `--font-size-xl`
- **Animation**: Subtle opacity pulse (0.85 → 1.0, 2 second cycle)
- **Text Shadow**: Background-colored halo for ring separation
- **Reduced Motion**: Label animation disabled when `prefers-reduced-motion: reduce`

## 3. Feature Flag Control

The ring animation is controlled by a Future Ideas feature flag:

```typescript
// In featureFlagsAtom
feat_ring_animation: boolean // Default: false
```

**Behavior:**
- **Default OFF**: No ring animation during NFC scan (just the label)
- **Enabled via Future Ideas**: Toggle "Enable Ring Animation" to show rings
- **Persistence**: Flag persists until manually disabled or Future Ideas is locked

## 4. Synchronization Strategy

Uses the "Zero-Time Protocol" documented in `WAAPI-STRATEGY.md`:

1. All ring animations share `startTime = 0` (document.timeline origin)
2. Phase offsets are applied via `iterationStart` property
3. Mathematically impossible for rings to drift out of sync
4. Tab-backgrounding is handled gracefully (jumps to correct frame on resume)

## 5. Success State Animation

When NFC tag is detected:

1. **Scanning rings fade out** (200ms)
2. **Success ring spawns** at expanded size
3. **Ring converges** to `r: 5.5` (spring animation, 200ms)
4. **Checkmark draws** via `pathLength` animation (200ms)
5. **Hold** for 300ms visibility
6. **Finalize**: Toast + auto-restart or form view

### Success Ring Parameters
- **Color**: `--surface-fg-success-primary` (green)
- **Final Radius**: 5.5 (matches checkmark container)
- **Stroke Width**: 1.5 (thinner than scan rings)

## 6. Interaction Model

### Scanning State
- **Tap footer area**: Simulates NFC tag read (for dev testing)
- **Back button/gesture**: Cancels scan, returns to idle

### Timeout State
- Displays "Timed out — Tap to retry" button
- Tapping restarts the scan with fresh timeout

## 7. Ring Animation Sandbox

A developer playground for tuning animation parameters:

- **Location**: Future Ideas → Enable Ring Animation → Ring Animation Sandbox
- **Features**:
  - Real-time parameter adjustment (ring count, duration, opacity, etc.)
  - Phase visualization showing ring timing
  - Preset "recipes" for common configurations
  - Mobile-optimized responsive layout

## 8. Implementation Files

| File | Purpose |
|:-----|:--------|
| `useRingAnimation.ts` | WAAPI animation orchestration, keyframe generation |
| `WaapiRingVisualizer.tsx` | SVG ring rendering, animation binding |
| `NfcScanButton.tsx` | State machine, label rendering, feature flag check |
| `NfcScanButton.module.css` | Label styling, pulse animation |
| `RingAnimationTestSheet.tsx` | Developer sandbox UI |
