Of course. This is a perfect use case for a UX specification. It defines the *experience* and the *why* behind the interaction, providing clear, non-technical success criteria for the engineering implementation.

---

## **UX Specification: Safety Check Completion Animation**

**Version:** 1.0
**Date:** 2023-10-27
**Author:** AI Assistant

### 1. Overview & Goal

This document specifies the user experience for the animation sequence when a caregiver completes a safety check. The primary goal is to provide **clear, confident, and non-disruptive feedback** that the action was successful, maintaining the user's focus and flow for their next task. The animation should feel polished, responsive, and reliable.

### 2. Guiding Principles

The animation design is governed by the following UX principles:

*   **Principle of Immediate Feedback:** The system must instantly acknowledge the user's "Save" action. There should be no perceptible delay between the tap and the initial visual response.
*   **Principle of Focused Change (The "Rock Solid" Principle):** When a user acts on a single item, only that item should initially change. All other elements on the screen—specifically the cards above and below the target—must remain perfectly static to avoid distraction and prevent a sense of instability.
*   **Principle of Clear State Transition:** The animation must unambiguously communicate the item's state change from "actionable" (e.g., `Due Soon`, `Late`) to "completed." This is achieved through a change in visual styling and a confirmation "pulse."
*   **Principle of Graceful Dismissal:** Completed tasks should exit the main workspace in a clean, predictable manner. The item should animate off-screen, clearly signaling that it has been archived and no longer requires the user's attention.
*   **Principle of Uninterrupted Flow:** The final list adjustment must be smooth and directional, guiding the user's eye naturally to the next actionable item without jarring jumps or reflows.

### 3. The User Journey (Interaction Storyboard)

This storyboard breaks down the animation into distinct, sequential stages from the user's perspective.

#### **Initial State:**
The user is viewing the list of safety checks in either the "Time" or "Route" view. The list is stable and not in motion.

---

#### **Stage 1: Confirmation (The Pulse)**

*   **Trigger:** The user successfully saves a check from the `Check Form View`.
*   **System Response (Immediate, `T=0ms`):**
    1.  The `Check Form View` slides away, revealing the list.
    2.  The `Check Card` (or `CheckListItem`) that was just completed **instantly changes its visual style** to the "Completed" state (e.g., grey background, green status badge).
    3.  Crucially, the card **remains in its original position and category** in the list. If it was the third item in the "Due Soon" group, it stays the third item in the "Due Soon" group, but now it *looks* complete.
    4.  A soft, green "pulse" or "glow" animation emanates from the card, lasting approximately 1.2 seconds.
    5.  **All other items on the screen (headers, other cards) remain completely static.** There is zero wiggle, wobble, or reflow.
*   **User Perception:** *"My action was successful. The system has registered the completion, and I can see exactly which item I just finished. The rest of my list is stable."*

---

#### **Stage 2: Dismissal (The Exit)**

*   **Trigger:** The "Pulse" animation from Stage 1 completes.
*   **System Response (`T=1200ms`):**
    1.  The completed card begins to animate off the screen.
    2.  The animation is a compound motion: it slides horizontally to the right while its vertical height simultaneously collapses to zero.
    3.  **The items above and below the exiting card remain static during this motion.**
*   **User Perception:** *"The task is done and is now being archived. It's cleanly moving out of my workspace."*

---

#### **Stage 3: Reflow (The Consolidation)**

*   **Trigger:** The "Exit" animation from Stage 2 is in progress.
*   **System Response (`T=1200ms` to `T=1600ms`):**
    1.  As the exiting card's height animates to zero, the space it occupied smoothly closes up.
    2.  The cards located **below** the exiting card smoothly animate upwards to fill the empty space.
    3.  The cards and headers located **above** the exiting card remain **rock solid and do not move.**
*   **User Perception:** *"The list is tidying itself up. My focus is now naturally drawn to the next item, which has smoothly moved into position."*

### 4. Motion & Timing Specification

| Stage         | Duration | Easing Curve               | Description                                                                                             |
| :------------ | :------- | :------------------------- | :------------------------------------------------------------------------------------------------------ |
| **1. Pulse**  | 1200ms   | `cubic-bezier(0.16, 1, 0.3, 1)` | A soft glow expands and fades from the card's center. Feels energetic but gentle.                 |
| **2. Exit**   | 400ms    | `cubic-bezier(0.16, 1, 0.3, 1)` | The card accelerates quickly off-screen. The motion feels decisive and clean.                          |
| **3. Reflow** | 400ms    | `cubic-bezier(0.16, 1, 0.3, 1)` | The list items below slide up smoothly, perfectly synchronized with the vertical collapse of the exiting card. |

**Total Animation Duration:** ~1.6 seconds from Save to final stable list.