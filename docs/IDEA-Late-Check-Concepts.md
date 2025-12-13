# IDEA-002: Late Check Visual Language (Comprehensive)

This document serves as the master catalog of visual concepts for the "Late Check" state, organized by UI component.

---

## 1. Global & Ambient Effects
*Atmospheric changes that affect the entire viewport or application frame.*

### **1.1. Vignette Signal (Noise + Pulse)**
*   **Concept**: A "dirty" red glow creeps in from the screen edges only when critical items exist.
*   **Detail**:
    *   **Visual**: Inset `box-shadow` (Red, 40px blur) + 5% opacity "White Noise" grain overlay.
    *   **Animation**: The entire vignette breathes slowly (2s loop, `opacity: 0.8` -> `1.0`).
    *   **Logic**: Fades in over 1s when `lateCount > 0`.
*   **Why**: Creates a subconscious feeling of signal interference or radiation.

### **1.2. Glass Tinting (Frame)**
*   **Concept**: The glass materials (Status Bar, Header, Bottom Nav) pick up the alert color.
*   **Detail**:
    *   **Visual**: `background-color: rgba(255, 59, 48, 0.05)` applied to the glass layer.
    *   **Animation**: Subtle pulse synced with the global heartbeat.
*   **Why**: frames the content in the alert state without obscuring the data.

### **1.3. Desaturation Focus**
*   **Concept**: The world turns grey, only the problem is colored.
*   **Detail**:
    *   **Visual**: A global `backdrop-filter: grayscale(0.8)` applied to a layer *behind* the Late Cards but *in front* of everything else.
*   **Why**: Extreme focus intervention (maybe too heavy for P1).

### **1.4. Periodic Background Glow**
*   **Concept**: A soft colored gradient washes over the global background in a slow wave.
*   **Detail**:
    *   **Visual**: `radial-gradient` traveling from top-left to bottom-right.
    *   **Animation**: 10s loop cycle.
*   **Why**: Makes the application feel "live".

---

## 2. Card Surface Effects
*Styling applied specifically to the Late Card itself.*

### **2.1. Breathing Gradient (Mesh)**
*   **Concept**: The card background is not a solid color, but a living mesh.
*   **Detail**:
    *   **Visual**: Mesh gradient of Dark Red / Charcoal / Black.
    *   **Animation**: Background positions shift slowly (`background-size: 200%`), creating a "magma" effect.
*   **Why**: High-craft texture that implies activity.

### **2.2. Anchored Heatmap Glow**
*   **Concept**: A glow that emanates specifically from the "Source" of the problem (the Badge).
*   **Detail**:
    *   **Visual**: A `radial-gradient` mask or overlay anchored to the coordinate of the status badge.
    *   **Animation**: Scales up/down with the badge pulse.
*   **Why**: Logically connects the indicator to the highlight.

### **2.3. Border Bleed**
*   **Concept**: The red border appearing to "leak" into the card.
*   **Detail**:
    *   **Visual**: `box-shadow: inset 0 0 12px var(--surface-error)`.
*   **Why**: Organic metaphor for containment failure.

### **2.4. Striped Hazard Overlay**
*   **Concept**: Subtle diagonal stripes on the card background.
*   **Detail**:
    *   **Visual**: 2% opacity repeating linear gradient (45deg).
    *   **Animation**: Scrolls slowly horizontally.
*   **Why**: Universal language for "Caution".

---

## 3. Badge & Indicator Effects
*Micro-interactions on the specific status pill.*

### **3.1. Synced Scale Pulse**
*   **Concept**: The badge physically throbs in size.
*   **Detail**:
    *   **Animation**: `transform: scale(1.0)` -> `1.05` -> `1.0`.
    *   **Timing**: 2s loop, perfectly synced with other elements.
*   **Why**: Mimics a beating heart. High urgency.

### **3.2. Liquid Fill (Hourglass)**
*   **Concept**: The badge fills up with color as time passes.
*   **Detail**:
    *   **Visual**: Hard-stop gradient background.
    *   **Logic**: Map `minutesLate` (0-30) to `background-position` (0-100%).
*   **Why**: literal data visualization of "time running out".

### **3.3. The Quiver (Nervous)**
*   **Concept**: The badge jitters occasionally.
*   **Detail**:
    *   **Animation**: Very fast X-axis shake (100ms) triggered every 5s.
*   **Why**: Visceral feeling of instability/nervousness.

### **3.4. Counter Ticker**
*   **Concept**: The text inside flips from "Late" to a ticking timer "15:02".
*   **Detail**:
    *   **Tech**: Monospace font variant to prevent layout shift.
*   **Why**: Accuracy increases anxiety (use carefully).

---

## 4. List Structure Effects (Lines & Headers)
*Using the grid and dividers to communicate state.*

### **4.1. Synced Line Expansion**
*   **Concept**: The separator lines above/below the late card stretch.
*   **Detail**:
    *   **Animation**: `transform: scaleX(1.0)` -> `1.15`.
    *   **Origin**: Center.
    *   **Timing**: Synced with Badge Pulse (3.1).
*   **Why**: The "Structure" of the list is reacting to the pressure.

### **4.2. Frequency Line (EKG)**
*   **Concept**: The straight separator line distorts into a signal wave.
*   **Detail**:
    *   **Visual**: SVG background image on the border.
    *   **Animation**: The wave translates horizontally.
*   **Why**: Medical/Vital signs metaphor.

### **4.3. Sticky Header Alert**
*   **Concept**: The Group Header ("Room 101") changes state when it sticks over a problem.
*   **Detail**:
    *   **Logic**: If `isSticky` AND `hasLateChild`, Header Background -> Red.
*   **Why**: Ensure context isn't lost when the item is scrolled under.

---

## 5. Navigation & Overlays
*Tools to help the user find the problem.*

### **5.1. The Pulse-Map (Mini-map)**
*   **Concept**: Right-edge ticks that pulsate.
*   **Detail**:
    *   **Visual**: 4px wide ticks on the scrollbar track.
    *   **Animation**: Linked to the global pulse.
    *   **Interaction**: Click/Drag to scroll.

### **5.2. Jump FAB**
*   **Concept**: "1 Late ↑" pill button.
*   **Detail**:
    *   **Logic**: Only appears if late items are off-screen.
    *   **Visual**: Filled style (Solid Red) or Glass style (Blur).

---

## The "Orchestration" Layer
*How these combine into a system.*

**Recommendation: The "Bio-Sync" System**
Instead of random animations, we implement a **Single Global Oscillator** in the React state or CSS Variable (`--breath-cycle`).

*   **t=0.0s**: Badges are Scale 1.0, Lines are Scale 1.0, Vignette is Opacity 0.
*   **t=1.0s**: Badges swell to 1.05, Lines stretch to 1.1, Vignette glows to Opacity 1.
*   **t=2.0s**: Return to rest.

This makes the *entire UI* feel like a single living organism reacting to the "Late" infection.
