# SPEC: Mobile Header Refactor (Single Row)

## Objective
Refactor the mobile header to be vertically compact, eliminating the secondary "offline row". The offline status indicator must be integrated directly into the main header row (center), replacing or displacing the standard status notification badges, ensuring zero layout growth.

## Requirements

### 1. Layout & Structure
- **Container**: The `AppHeader` must maintain a single-row structure (fixed height, e.g., `64px`) in both Online and Offline states.
- **Offline Mode**:
    - There will be NO dedicated/expanded second row for the offline status.
    - The **Offline Pill** will occupy the **Center Content** area.
    - The layout must remain "vertically compact" – no height changes during status transitions.

### 2. Component Placement
- **Left**: Menu Button (unchanged).
- **Center**:
    - **Online**: Displays `StatusBar` (Notification Counts).
    - **Offline**: Displays **Offline Pill** (Timer & Queue Count).
    - **Transition**: Elements should swap positions or fade/slide in place. The Offline Pill slides up (or in) to occupy the center.
- **Right**: User Avatar (unchanged).

### 3. Styling & Visuals
- **Offline Pill**:
    - **Border**: Full border (`1px solid rgba(255, 255, 255, 0.15)`).
    - **Shadow**: No shadow (`box-shadow: none`).
    - **Icon**: No "Cloud Off" icon (Text only: "Offline: MM:SS — N Queued").
    - **Background**: Compatible with the header's "solid color" state.
- **Status Badges (Offline Context)**:
    - *Clarification mandated by design constraints*: If the Offline Pill takes the center, the Status Badges (Missed/Due) must either:
        - Temporarily hide (implied by "slide up" replacement).
        - Move to the Right Actions (if space permits and requested).
        - *Assumption for this spec*: The Offline Pill effectively replaces the Status Bar in the center for the duration of the offline state, prioritizing connectivity status.

### 4. Animations
- **Entrance (Offline)**: The Offline Pill should slide up/fade in into the center position.
- **Exit (Online)**: The Offline Pill reverses out, restoring the Status Bar.

## Implementation Steps
1.  **Remove** the `.offlineRow` container and logic from `AppHeader.tsx`.
2.  **Move** the `offlineBar` rendering logic into the `.centerContent` div, conditionally swapping with `StatusBar` using `AnimatePresence`.
3.  **Update CSS**:
    - Remove `.offlineRow` styles.
    - Refine `.offlineBar` to remove shadows, add borders, and ensure centered fit.
    - Remove the `.material-symbols-rounded` (cloud icon) from the pill content.
