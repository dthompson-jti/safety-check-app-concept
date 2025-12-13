# Research Round 6: Dimension Expansion
Brainstorming 4-5 contenders for each of the specific dimensions requested.

## 1. Ambient Overlay Effects
*Global effects that apply to the viewport when late items are present but off-screen.*

### **1A. Vignette Pulse**
*   **Concept**: The screen edges (inset 20px) pulse with a soft red glow (`box-shadow: inset`) only when scrolled *away* from late items.
*   **Why**: Subtle peripheral vision cue. "You are leaving a danger zone."
*   **Tech**: Fixed `div` overlay with `pointer-events: none` and CSS keyframes.

### **1B. Noise Grain (Entropy)**
*   **Concept**: A film grain overlay (SVG filter) increases in opacity and roughness as time passes.
*   **Why**: Metaphor for "decay" or "signal loss". The UI feels "static-y" when things aren't right.
*   **Tech**: SVG filter over the root app container.

### **1C. Tinted Glass (Nav Bar)**
*   **Concept**: The Bottom Navigation Bar and Top Header glass materials pick up a red tint.
*   **Why**: The "frame" of the window changes color, not just the content.
*   **Tech**: `backdrop-filter: blur()`, `background: rgba(255, 0, 0, 0.1)`.

### **1D. Desaturation Scale**
*   **Concept**: Everything *except* the late cards desaturates by 50%.
*   **Why**: Inverse focus. "The world is grey, only the problem is colored."
*   **Tech**: `backdrop-filter: grayscale(0.5)` on a root overlay, utilizing `mix-blend-mode`.

### **1E. Directional Fog**
*   **Concept**: A linear gradient fog appears at the top or bottom edge of the lists, explicitly indicating *where* the late item is (e.g., fog at bottom = scroll down).
*   **Why**: Atmospheric wayfinding.
*   **Tech**: `linear-gradient` overlay with opacity transition.

---

## 2. Card Styling Effects (Background)
*Styling applied specifically to the Late Card's background/surface.*

### **2A. Mesh Warp**
*   **Concept**: A slow, fluid mesh gradient (Red/Dark Red) moving inside the card.
*   **Why**: Makes the card feel "alive" and unstable.
*   **Tech**: CSS `radial-gradient` positions animating.

### **2B. Striped Hazard**
*   **Concept**: Very subtle, 5% opacity diagonal hazard stripes (construction style) scrolling slowly across the background.
*   **Why**: Universal symbol for "Caution/Work Zone".
*   **Tech**: `repeating-linear-gradient` + `background-position` animation.

### **2C. Border Bleed**
*   **Concept**: The red border color "bleeds" inward into the card background, fading to transparent at the center.
*   **Why**: Looks like ink spreading or a stain.
*   **Tech**: `box-shadow: inset 0 0 20px var(--surface-error)`.

### **2D. Heatmap Glow**
*   **Concept**: A radial glow from the *center* of the card that pulses outward like a heartbeat.
*   **Why**: "Core meltdown" metaphor.
*   **Tech**: `radial-gradient` center animation.

### **2E. Paper Crumple**
*   **Concept**: A texture overlay that makes the card look slightly crumpled or aged.
*   **Why**: Metaphor for "Old/Neglected" data.
*   **Tech**: Static image/SVG mask.

---

## 3. Card Styling Effects (Badges)
*Effects applied to the "Late" status pill/badge.*

### **3A. The Quiver**
*   **Concept**: The badge shakes/vibrates (X-axis translate) every 5-10 seconds.
*   **Why**: Visceral "nervous/unstable" feeling.
*   **Tech**: CSS Keyframe `transform: translateX()`.

### **3B. Liquid Fill (Hourglass)**
*   **Concept**: The badge background "fills up" with red liquid over time (or loops).
*   **Why**: "Time is running out" metaphor.
*   **Tech**: `linear-gradient` vertical stop position animating.

### **3C. Glow Ring**
*   **Concept**: A distinct ring *outside* the badge border that pulses scale/opacity.
*   **Why**: Makes the badge look radioactive/emitting signal.
*   **Tech**: pseudo-element `::after` scaling.

### **3D. Counter Ticker**
*   **Concept**: A monospaced "seconds" counter ticking up inside the badge (e.g. `15:32`).
*   **Why**: High-anxiety data precision.
*   **Tech**: JS interval updating text content.

### **3E. Invert Blink**
*   **Concept**: The badge swaps Foreground/Background colors slowly (Red bg/White text -> White bg/Red text).
*   **Why**: Impossible to ignore change state.
*   **Tech**: CSS `color` / `background-color` transition.

---

## 4. Card Styling Effects (The Lines)
*Creative use of list separators/dividers or grid lines.*

### **4A. The Live Wire**
*   **Concept**: The separator line turns bright red and "hums" (slight opacity glow pulse).
*   **Why**: "Do not touch" / dangerous connection.
*   **Tech**: `border-image` or `box-shadow` on the separator.

### **4B. Breadcrumb Dotted Path**
*   **Concept**: The solid separator line transforms into a thick dotted path leading user's eye.
*   **Why**: Wayfinding metaphor.
*   **Tech**: `border-style: dotted`.

### **4C. Frequency Line (EKG)**
*   **Concept**: The flat line distorts into a jagged "heartbeat" or "static" waveform (SVG background on the border).
*   **Why**: Medical/Vital signs metaphor.
*   **Tech**: SVG `background-image` on the border element.

### **4D. Laser Tripwire**
*   **Concept**: The line glows intensely (neon) and casts a shadow, looking like a laser beam.
*   **Why**: High security/breach metaphor.
*   **Tech**: `box-shadow` + `background` brightness.

### **4E. Progress Fuse**
*   **Concept**: The separator line acts as a progress bar, "burning" from left to right as time passes.
*   **Why**: "Fuse is burning" metaphor.
*   **Tech**: `width` animation on a pseudo-element.

---

## 5. Floating Header Styling Effects
*Effects applied to the sticky group header (e.g., "Room 101").*

### **5A. Sticky Alert (Chameleon)**
*   **Concept**: When the header sticks to the top, if there are late items *under* it, it turns Red.
*   **Why**: The header absorbs the status of its children.
*   **Tech**: JS check for `isSticky` && `hasLateChild`.

### **5B. Glass Distortion**
*   **Concept**: The header blur increases significantly (frosted glass) when covering a late item.
*   **Why**: "Vision is obscured" / difficulty.
*   **Tech**: `backdrop-filter: blur(20px)`.

### **5C. Marquee Scroll**
*   **Concept**: If the specific room has a critical alert, the Header text scrolls horizontally ("Room 101 - LATE CHECK - ALERT").
*   **Why**: Urgent news ticker style.
*   **Tech**: CSS `transform: translateX` loop.

### **5D. Shadow Color**
*   **Concept**: The drop-shadow of the sticky header turns from black to Red glow.
*   **Why**: Casts a red light onto the items below it.
*   **Tech**: `box-shadow` color transition.

### **5E. Heavy Underline**
*   **Concept**: A thick (4px) red bar appears at the bottom of the sticky header.
*   **Why**: Architectural "Load bearing" stress marker.
*   **Tech**: `border-bottom` width transition.
