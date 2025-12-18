# NFC Animation Specification
**Status:** Approved for Implementation
**Concept:** "High-Fidelity Radar Pulse"
**Reference:** `src/features/Shell/NfcScanButton.tsx` (ScanningVisualizer)

## 1. Global Setup
- **Tooling:** Framer Motion (`framer-motion`)
- **Rendering:** SVG inside a fixed container.
- **Scaling:** 
  - **Container Width:** `600px` (Rendered absolute center of footer)
  - **SVG ViewBox:** `0 0 200 200`
  - **Scale Factor:** ~3x (1 SVG unit = 3 rendered pixels)
- **Cropping:** Strictly cropped to the `AppFooter` bounds (`overflow: hidden`).

## 2. Scanning State ("Radar Pulse")
The scanning state consists of a dense array of concentric circles expanding linearly to create a continuous "wave" effect.

### Ring Parameters
| Parameter | Value | Visual Calc | Notes |
|:---|:---|:---|:---|
| **Ring Count** | `12` | - | High density to prevent gaps. |
| **Duration** | `20s` | - | Extremely slow "breathing" radar. |
| **Expansion** | `r: 11 -> 80` | `33px -> 240px` | Starts at 64px Diameter. |
| **Stagger Delay** | `2s` | - | Matches 1.2x spacing at 20s duration. |
| **Spacing** | ~7.6 units | ~23px | **User Refined (1.2x previous)** |
| **Easing** | `linear` | - | Maintains equidistant spacing. |
| **Thickness** | `2` | ~6px | Thicker, more visible lines. |
| **Color** | `surface-border-primary` | - | Lighter/Subtler Grey. |
| **Opacity** | `0.5 -> 0` | - | Fade out as it expands. |

## 3. Success State ("Check Snap")
The transition creates a "snap" effect where the disorganized radar converges into a solid confirmation token.

### Checkmark Parameters
| Parameter | Value | Visual Calc | Notes |
|:---|:---|:---|:---|
| **Target Size** | `Diameter: 11px` | ~33px | Standard icon size. |
| **Target Radius** | `r: 5.5` | ~16.5px | Half of target size. |
| **Drawing Speed** | `0.4s` | - | Fast "signature" stroke. |
| **Stroke Width** | `2` | ~6px | Thicker than rings for hierarchy. |
| **Path** | `M 96 100...` | - | Custom micro-path centered @ 100,100. |

### Transition Logic
1.  **User Tap/Event:** `scanState` -> `'success'`
2.  **Ring Converge:** A new ring spawns at `r: 20` and springs to `r: 5.5` (Duration: 0.6s).
3.  **Check Draw:** Path draws `pathLength: 0 -> 1` (Delay: 0.1s, Duration: 0.4s).
4.  **Hold:** Wait `0ms` (Instant).
5.  **Finalize:** Trigger App Navigation / Toast.
