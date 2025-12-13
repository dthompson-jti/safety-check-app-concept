# Late Check Morphology & Deconstruction

## 1. Down-Selected Concepts (The "Toolkit")
The following 7 concepts have been selected for the next phase.

**Core Utility (Search & Destroy)**
*   **[1] Team Heatmap Mini-map** (Concept #23): Right-edge visual density ticks.
*   **[2] Jump FAB** (Concept #12): Floating action button to auto-scroll.

**Card-Level Urgency (The Signal)**
*   **[3] Ambient Pulse** (Concept #1): Breathing animation on the card.
*   **[4] Urgency Gradient** (Concept #4): Animated mesh gradient background.
*   **[5] Dynamic Typography** (Concept #13): Heavier font weights for late items.

**Global/Immersive Awareness (The Atmosphere)**
*   **[6] Edge Vignette** (Concept #11): Red glow creeping from screen corners.
*   **[7] Tab Badge** (Concept #5): Standard notification badge.

---

## 2. Abstraction: The Morphological Chart
We deconstruct these 7 solutions into their atomic "Dimensions" (What they change) and "Values" (How they change it). This allows us to mix-and-match atoms to refine the implementation.

| **Dimension** | **Option A (Subtle)** | **Option B (Visible)** | **Option C (Active)** | **Option D (Immersive)** |
| :--- | :--- | :--- | :--- | :--- |
| **Logic (Trigger)** | Static State (Is Late) | Time Interval (Every 2s) | **Scroll Position** (Jump FAB) | **Idle Time** |
| **Location** | **Card Internal** (Type, Pulse) | **Card Background** (Gradient) | **Viewport Edge** (Mini-map, Vignette) | **Overlay / Floating** (FAB) |
| **Visual Primitive** | **Color/Opacity** (Vignette, Pulse) | **Shape/Geometry** (Mini-map ticks) | **Typography** (Dynamic Type) | **Motion/Translate** (FAB entry) |
| **Haptic Feedback** | None | Gentle Tap | Heavy Impact | Pattern/Heartbeat |
| **Interaction** | Passive (Read only) | **Navigation** (Click Mini-map) | **Action** (Click FAB) | Interruption (Modal) |
| **Metaphor** | Data (Graph/Badge) | Biology (Pulse, Heartbeat) | Environment (Vignette, Gradient) | Signage (FAB, Ticker) |

---

## 3. Deconstruction by Concept
Mapping the selected concepts back to the dimensions to understand their composition.

### A. Team Heatmap Mini-map
*   **Dimensions**: `Viewport Edge` + `Shape/Geometry` + `Navigation` + `Data`
*   **Role**: The "Radar". Provides global context and rapid access.
*   **Atomic Value**: Absolute visual position tracking.

### B. Ambient Pulse
*   **Dimensions**: `Card Internal` + `Color/Opacity` + `Passive` + `Biology`
*   **Role**: The "Heartbeat". Indicates the specific item is alive/critical.
*   **Atomic Value**: Time-based continuous animation.

### C. Jump FAB
*   **Dimensions**: `Overlay` + `Motion` + `Action` + `Signage`
*   **Role**: The "Shortcut". Reduces friction to solve the problem.
*   **Atomic Value**: Conditional visibility (only shows when needed).

### D. Urgency Gradient
*   **Dimensions**: `Card Background` + `Color/Opacity` + `Passive` + `Environment`
*   **Role**: The "Texture". Distinguishes the late card from normal cards.
*   **Atomic Value**: High-craft visual surface.

### E. Edge Vignette
*   **Dimensions**: `Viewport Edge` + `Color/Opacity` + `Passive` + `Environment`
*   **Role**: The "Atmosphere". Changes the mood of the entire screen.
*   **Atomic Value**: Global state indication.

### F. Dynamic Typography
*   **Dimensions**: `Card Internal` + `Typography` + `Passive` + `Data`
*   **Role**: The "Emphasis". Uses standard design tools (weight) to signal importance.
*   **Atomic Value**: Variable font axis.

### G. Tab Badge
*   **Dimensions**: `Overlay` + `Shape` + `Passive` + `Data`
*   **Role**: The "Flag". Standard system-level awareness.
*   **Atomic Value**: Count indicator.

---

## 4. Synthesis: "The Late State System"
Instead of treating these as separate features, we combine them into a unified state system.

**State 1: Late (15-30m)**
*   *Atmosphere*: **Tab Badge** (Standard).
*   *Card*: **Dynamic Typography** (Bold) + **Urgency Gradient** (Subtle).
*   *Navigation*: **Mini-map** (Orange ticks).

## 5. Explicit Deconstruction (The Atoms)
We break down the 7 Winners into their raw component parts.

| Source Concept | **Location** | **Trigger** | **Visual** | **Interaction** | **Metaphor** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mini-map** | Viewport Edge | Scroll Pos | Geometry (Tick) | Navigation (Jump) | Data (Radar) |
| **Jump FAB** | Overlay (Bottom) | Off-screen | Motion (Slide) | Action (Click) | Signage |
| **Ambient Pulse** | Card Border | Time Loop | Opacity/Glow | Passive | Biology (Living) |
| **Gradient** | Card Background | Static | Color Mesh | Passive | Environment |
| **Dynamic Type** | Text Layer | Static | Font Weight | Passive | Data (Emphasis) |
| **Vignette** | Full Screen Edge | Global State | Red Glow | Passive | Atmosphere |
| **Badge** | Tab Bar | Status Change | Shape (Dot) | Passive | Notification |

---

## 6. The Remixes (Concepts 51-60)
Strictly combining atoms from the table above to create novel interactions.

### Concept 51: "The Pulse-Map" (Mini-map + Pulse)
*   **Formula**: `Mini-map (Location)` + `Pulse (Visual/Metaphor)`
*   **Description**: Instead of static ticks, the Mini-map indicators on the right edge *pulse* nicely with the same breathing rhythm as the card.
*   **Result**: The "Radar" feels alive; you see the heartbeat even when scrolled away.

### Concept 52: "Gradient Navigation" (Gradient + FAB)
*   **Formula**: `Gradient (Visual)` + `FAB (Location/Interaction)`
*   **Description**: The "Jump to Late" button isn't a solid color pill; it carries the *Urgency Gradient* mesh inside it, animating slowly.
*   **Result**: Connects the navigation affordance visually to the problem source.

### Concept 53: "Typographic Vignette" (Vignette + Type)
*   **Formula**: `Vignette (Location)` + `Type (Visual)`
*   **Description**: Large, bold, translucent numbers (e.g., "15m") partially bleed onto the screen edges from off-screen, indicating the direction of the late item.
*   **Result**: Uses text as an atmospheric texture rather than just data.

### Concept 54: "Scroll-to-Wake" (Pulse + Scroll Trigger)
*   **Formula**: `Pulse (Visual)` + `Mini-map (Scroll Trigger)`
*   **Description**: The Ambient Pulse is dormant (static) until you *start scrolling*. The kinetic energy of scrolling "wakes up" the pulse intensity.
*   **Result**: Connects user energy (scroll) to system feedback.

### Concept 55: "Living Background" (Vignette + Gradient)
*   **Formula**: `Vignette (Location)` + `Gradient (Visual)`
*   **Description**: Instead of a simple red glow edge, the global screen background becomes a subtle, low-opacity version of the *Urgency Gradient* mesh.
*   **Result**: The "Environment" is completely immersed in the state.

### Concept 56: "Haptic Ticks" (Mini-map + Haptic*)
*   **Formula**: `Mini-map (Location)` + `Road Bump (Haptic)`
*   **Description**: Dragging your finger along the *right edge* (Mini-map area) triggers the "Road Bump" haptics without moving the list, acting as a tactile preview.
*   **Result**: Blind/Pocket usability for checking status.

### Concept 57: "Action Ripple" (FAB + Pulse)
*   **Formula**: `FAB (Interaction)` + `Pulse (Visual)`
*   **Description**: When the "Jump to Late" FAB appears, it emits a single large "Sonar Ripple" (from the rejected list, but applied to the FAB) to draw eye contact.
*   **Result**: Increases actionability of the FAB.

### Concept 58: "Bold Borders" (Fluid Border + Type)
*   **Formula**: `Card Border (Location)` + `Type (Metaphor/Weight)`
*   **Description**: The border thickness of the card scales mathematically with the lateness, matching the font-weight steps (Thin -> Regular -> Bold -> Heavy).
*   **Result**: Unifies the visual language of "weight = urgency".

### Concept 59: "The Red Lens" (Badge + Motion)
*   **Formula**: `Badge (Visual)` + `Motion (Visual)` + `Overlay (Location)`
*   **Description**: The little red "Badge" dot detaches from the tab bar and physically *flies* to the late card when you open the view, guiding the eye.
*   **Result**: Explicitly connects the notification (Badge) to the object (Card).

### Concept 60: "Atmospheric Type" (Type + Vignette)
*   **Formula**: `Type (Visual)` + `Vignette (Role)`
*   **Description**: The "Late" status text glows (text-shadow) and bleeds slightly, creating a local "Vignette" around just the word "Late".
*   **Result**: Makes the text feel hot/radioactive.

---

## 7. Synthesis & Recommendation (Updated)
The remixing process highlights that **Animation (Pulse/Gradient)** and **Location (Edge/Mini-map)** are the most potent combinations.

**Killer Combination:**
1.  **Concept 51 (Pulse-Map)**: Enhances the winner (Mini-map) with the best visual (Pulse).
2.  **Concept 55 (Living Background)**: A better implementation of the "Vignette" that uses our bespoke Gradient.

This strengthens the "Power Trio":
*   **Utility**: Pulse-Map (#51).
*   **Atmosphere**: Living Background (#55).
*   **Action**: Jump FAB (#12).

