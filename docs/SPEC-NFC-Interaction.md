# NFC Interaction & Animation Spec

## 1. Core Concept: "Radiating Connection"
The NFC scanning experience is designed to feel like a "heartbeat" or "radar" emanating from the application footer, searching for a connection. It dominates the bottom visual field but remains strictly contained within the UI chrome (the glass footer).

## 2. Layout & Cropping
### 2.1 Container
- **Reference Frame:** The entire Glass Footer (`AppFooter`).
- **Cropping:** The animation **must** be clipped to the exact bounds of the footer (including safe area), respecting the footer's border-radius if applicable (though footer is usually full-width).
- **Bleed:** The effect appears to "bleed" significantly, but is hard-clipped.

### 2.2 Centering
- **Origin Point:** The geometric center of the **visible glass footer surface**.
  - Vertical alignment: Centered within the glass panel height.
  - Horizontal alignment: Centered within the screen width.
- This ensures the "pulse" feels like it comes from the device's hardware chin, not just a floating button.

## 3. Visual States

### 3.1 Idle / Scanning ("Ready to scan")
- **Components:**
  - **Label:** "Ready to scan"
    - Font: `text-lg`, `font-bold`.
    - Color: `surface-fg-primary`.
    - Shadow: `0 0 4px var(--surface-bg-secondary)` (Matches background to create legibility halo).
    - Z-Index: Above rings.
  - **Rings:** 3 concentric circles.
    - Color: `surface-fg-secondary` (neutral/grey).
    - Stroke: Constant **3px** (`non-scaling-stroke`).
    - Spacing: Perfectly even/equidistant.
- **Animation:**
  - **Expansion:** `r: 0 -> 300px` (Massive expansion to ensure full bleed).
  - **Opacity:** `0.3 -> 0` (Fade out as it expands).
  - **Timing:** 
    - Duration: 4s per ring.
    - Easing: **Linear** (Essential for keeping rings equidistant).
    - Stagger: 1.33s (4s / 3 rings).
    - Loop: Infinite.

### 3.2 Success ("Check")
- **Trigger:** NFC Tag detected.
- **Transition:**
  - Existing scanning rings fade out immediately or complete loop? *Decision: Fade/Scale out.*
  - **Convergence:** A new "Success Ring" spawns at `r: 20px` (or matches current ring) and snaps to `r: 32px`.
- **Visuals:**
  - **Ring:** Green (`surface-fg-success-primary`), 3px stroke.
  - **Checkmark:** Draws in (`pathLength: 0 -> 1`) inside the ring.
- **Timing:**
  - Ring Snap: ~400ms (Spring: stiffness 300, damping 25).
  - Check Draw: ~300ms (Ease out), delayed 100ms.
  - Hold Time: 1500ms before navigation.

### 3.3 Timeout
- **State:** Scanning stops.
- **Visuals:**
  - Button reappears (or morphs).
  - Style: Warning/Red ghost button.
  - Label: "Timed out — Tap to retry".
  - Icon: `timer_off`.

## 4. Implementation Details (The "High Craft" Contract)
- **Positioning:** The Visualizer MUST be positioned `absolute` relative to the `AppFooter` (Inset 0), NOT the button wrapper.
- **Optimization:** Use css `will-change: transform, opacity`.
- **Accessibility:** Respect `prefers-reduced-motion` by disabling expansion and using a simple opacity pulse.
- **Interactivity:**
  - Scanning area typically absorbs clicks (no-op) or can cancel? *Decision: No-op to prevent accidental cancels, hardware back button or explicit 'Back' handles exit.*
  - Timeout state MUST be tappable (high z-index).

## 5. Token Mapping
| Element | Token | Value (Ref) |
|:---|:---|:---|
| Ring Stroke | `surface-fg-secondary` | Grey 700 |
| Ring Success | `surface-fg-success-primary` | Green 600 |
| Label Text | `surface-fg-primary` | Grey 900 |
| Label Halo | `surface-bg-secondary` | Grey 20 (Light), Grey 900 (Dark) |
