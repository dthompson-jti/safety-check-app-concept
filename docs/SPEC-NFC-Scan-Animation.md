# NFC Animation Specification
**Status:** Approved for Implementation
**Concept:** "High-Fidelity Radar Pulse"
**Reference:** `src/features/Shell/NfcScanButton.tsx` (ScanningVisualizer)

## 1. Global Setup
- **Tooling:** CSS Keyframes (for negative delay support) + Framer Motion (for success state)
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
| **Initial Radius** | `r: 8` | `24px` | Starts at 48px Diameter. |
| **Final Radius** | `r: 80` | `240px` | Fills footer width. |
| **Stagger Delay** | `-i * 2s` | - | **Negative delay for steady-state start.** |
| **Easing** | `linear` | - | Maintains equidistant spacing. |
| **Thickness** | `2` | ~6px | Thicker, more visible lines. |
| **Color** | `surface-border-primary` | - | Lighter/Subtler Grey. |
| **Opacity Peak** | `0 → 0.6 → 0` | @ 20% | Fade in, peak early, fade out. |

### Steady-State Pattern
Uses CSS animation with **negative `animation-delay`** to spread rings across the animation cycle on mount, avoiding the "bunched up at center" problem that occurs with Framer Motion keyframes.

## 3. Success State ("Check Snap")
The transition creates a "snap" effect where the disorganized radar converges into a solid confirmation token.

### Checkmark Parameters
| Parameter | Value | Visual Calc | Notes |
|:---|:---|:---|:---|
| **Target Size** | `Diameter: 11px` | ~33px | Standard icon size. |
| **Target Radius** | `r: 5.5` | ~16.5px | Half of target size. |
| **Ring Converge** | `0.2s` | - | Fast spring to center. |
| **Check Draw** | `0.2s` | - | Fast "signature" stroke. |
| **Stroke Width** | `1.5` | ~4.5px | Slightly thinner than rings. |
| **Path** | `M 97 100 L 99 102 L 103 98` | - | Proportionate to check circle. |

### Transition Logic
1.  **User Tap/Event:** `scanState` → `'success'`
2.  **Ring Converge:** A new ring spawns at `r: 20` and springs to `r: 5.5` (Duration: 0.2s).
3.  **Check Draw:** Path draws `pathLength: 0 → 1` (Duration: 0.2s, no delay).
4.  **Hold:** Wait `300ms` (animation time + brief visibility).
5.  **Finalize:** Trigger Toast, then auto-restart to `scanning` state (continuous loop).

## 4. Continuous Loop Behavior
When `simpleSubmitEnabled` is **ON**, after a successful scan:
1. Success animation plays (0.3s total)
2. Toast shows completion
3. Scanner **automatically restarts** (no need to press Start again)
4. Timeout is reset if enabled

When `simpleSubmitEnabled` is **OFF**:
- Opens CheckEntryView form instead of auto-completing
- Returns to idle state after form submission
