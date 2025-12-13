# IDEA-002: Late Check Visual Language (Consolidated)

This document outlines the final selected candidates for the "Late Check" visual system, combining the core utility winners with the expanded atmospheric dimensions from Round 6.

---

## Part 1: The New Expansions (Atmosphere & Physics)
*refined concepts based on Dimensional Brainstorming.*

### **IDEA-1A: Vignette Signal (Noise + Pulse)**
*   **Formula**: `Edge Vignette (#11)` + `Noise (#1B)` + `Pulse (#1A)`
*   **Visual**:
    *   **The Glow**: A soft red (`var(--surface-error)`) inset box-shadow pulses at the screen edges.
    *   **The Texture**: A static 2px "White Noise" grain overlay (5% opacity) is applied on top of the glow.
    *   **The Pulse**: The overlay breathes slowly (2s loop).
*   **Why**: The noise adds a visceral "Geiger counter" or "Signal Interference" texture to the standard red glow, making it felt rather than just seen.

### **IDEA-1C: Glass Pulse**
*   **Formula**: `Tinted Glass (#1C)` + `Gentle Pulse`
*   **Visual**:
    *   The App Header and Bottom Navigation Bar (glass materials) pick up a subtle red tint.
    *   **Animation**: This tint creates a gentle "heartbeat" effect, pulsing the opacity of the red layer from 0.05 to 0.15.
*   **Why**: frames the content in the alert state.

### **IDEA-2D: Anchored Bioluminescence (Heatmap Glow)**
*   **Visual**:
    *   Instead of a generic center glow, a **Radial Gradient** is anchored specifically to the collection of "Late" badges.
    *   The glow emanates *from the badge* and spreads into the card background.
*   **Why**: Connects the "Source" (the badge) to the "Effect" (the card highlight).

### **IDEA-SYNC: The Synchronized Living System**
*A unified animation system where multiple elements "breathe" in perfect unison.*

*   **Global Clock**: All CSS animations share the same `duration` and `delay` to ensure perfect phase alignment.
*   **Component 1: Synced Background**: Late cards have a gentle, periodic colored gradient pulse overlay.
*   **Component 2: Synced Badges**: All "Late" badges scale up/down slightly (`scale(1.0)` -> `scale(1.05)`) in sync.
*   **Component 3: Synced Lines (#4-New)**:
    *   The list separator lines for late items grow in the **X-axis** only.
    *   Animation: `scaleX(1)` -> `scaleX(1.1)`.
    *   **Result**: The entire list structure feels like it is expanding and contracting like a lung.

---

## Part 2: The Core Winners (Utility & Feedback)
*Retained top concepts from original research.*

### **1. Jump FAB (#12)**
*   **Role**: Navigation.
*   **Spec**: Floating pill ("1 Late ↑") appears only when the target is off-screen.
*   **Interaction**: Click to scroll.

### **2. Haptic Ticks (001-C)**
*   **Role**: Tactile Feedback.
*   **Spec**: Dragging/Scrubbing the "Pulse Map" (or scrollbar area) triggers haptic bumps: light for "Due", heavy for "Late".

### **3. Living Gradient (001-A / #4)**
*   **Role**: Texture.
*   **Spec**: A slowly moving mesh gradient in the background of the Late Card (or the global background in "Critical" mode).

---

## Synthesis: The "Critical State" Composition

When the app enters **Critical Mode** (Late Check > 15m), the following activates:

1.  **Global Layer**: **IDEA-1A (Vignette Noise)** fades in to frame the screen in static tension.
2.  **List Layer**: **IDEA-SYNC** activates. Lines stretch, Badges swell, and backgrounds glow in a unified 4-second breathing loop.
3.  **Action Layer**: If the check is not visible, the **Jump FAB** slides up.
