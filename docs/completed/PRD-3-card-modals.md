# Implementation Plan & Architecture Analysis

## 1. Toast Experience Overhaul
**Problem:** The current system blindly triggers toasts for every state change event, regardless of user context. "Missed" checks for Unit B trigger toasts while the user is viewing Unit A. Additionally, waking the device causes a "Toast Hurricane" where dozens of checks expire simultaneously.

**Options Considered:**
*   **Option A (Debouncing):** Queue toasts and only release them every 2 seconds. *Critique: Adds latency, doesn't solve the relevance issue.*
*   **Option B (Aggregation):** Group simultaneous errors into a single message (e.g., "5 checks missed"). *Critique: Good, but complex to implement inside a React effect loop without a dedicated reducer.*
*   **Option C (Context-Aware Filtering):** Only allow lifecycle toasts for checks belonging to the currently selected Facility/Unit. *Critique: Best UX. Users don't care about missed checks in a unit they aren't supervising right now.*

**Recommended Path (Context-Aware + Aggregation):**
We will modify `useCheckLifecycle.ts`.
1.  **Context Gating:** It will now read `selectedFacilityGroupAtom` and `selectedFacilityUnitAtom`. If a check expires that *doesn't* match the current context, it will silently update the store but **skip the toast**.
2.  **Tick Batching:** Inside the `useEffect` loop, we will count the number of missed checks in the current tick. If count > 1, we dispatch a single "Multiple checks missed" toast instead of $N$ toasts.
3.  **Dismissal:** We will add a `toast-id` based dismissal to the `ToastContainer` (logic already partially exists in `Toast.tsx`, needs verification it handles rapid-fire dismissal).

## 2. Special Status Badge Reversion
**Problem:** The text-based badges ("SR", "MSR") are cognitive overload for the high-frequency scanning view. The user desires the legacy visual shorthand.

**Recommended Path:**
1.  **Revert DOM Structure:** In `CheckCard.tsx` -> `ResidentListItem`, remove the text `span` logic.
2.  **Implement Solid Icon:** Insert the `<span class="material-symbols-rounded">warning</span>`.
3.  **CSS Styling:** Ensure `font-variation-settings: 'FILL' 1` is applied to this specific icon class in `CheckCard.module.css` to meet the "Solid Fill" requirement.
4.  **Logic:** If *any* classification exists for a resident, show the icon. Do not show specific codes.

## 3. Card Margin/Padding Stabilization
**Problem:** "Flash of Unstyled Content" (FOUC) or hydration mismatch causes the card to render with asymmetric padding (space for the bar) even when the bar is disabled, before snapping to correct padding.

**Options Considered:**
*   **Option A (JS Layout Effect):** Force a repaint on mount. *Critique: Bad for performance, causes visible jump.*
*   **Option B (CSS Defaults):** Invert the CSS logic. *Critique: Best for stability.*

**Recommended Path (CSS Inversion):**
Currently, the CSS likely defaults to the "Indented" state and removes it if `data-indicators-visible='false'`. We will invert this.
1.  **Default State:** The `.checkCard` class will default to **symmetric padding** (12px/var(--spacing-3)) on all sides.
2.  **Modifier State:** We will exclusively apply the extra left padding (`padding-left: var(--spacing-5)`) *only* when `[data-indicators-visible='true']`.
3.  This ensures that if the atom takes 50ms to load, the card renders in its "clean" state first, which is less jarring than rendering "broken" space.

## 4. Modal Entrance Animations
**Problem:** Modals snap into existence without the "Slide In" animation, but slide out correctly.

**Root Cause:**
The `AnimatePresence` component tracks items leaving the DOM (Exit), but for an item to animate *in*, the component being mounted must define `initial` and `animate` states.
*   `FacilitySelectionModal` uses `FullScreenModal`, which likely lacks the `initial` prop on its internal motion wrapper, or `App.tsx` renders these modals conditionally *without* an `AnimatePresence` wrapper around the modal roots.

**Recommended Path:**
1.  **App.tsx (Root Level):** Ensure the conditional rendering of `SettingsModal` and `DeveloperModal` is wrapped in `<AnimatePresence mode="wait">`.
2.  **Motion Wrapper:** Wrap the content of `SettingsModal` and `DeveloperModal` in a standard motion container (like `NfcWriteView` uses) with:
    *   `initial={{ x: '100%' }}`
    *   `animate={{ x: 0 }}`
    *   `exit={{ x: '100%' }}`
    *   `transition={{ type: 'tween', ... }}`
3.  **FacilitySelectionModal:** Verify `FullScreenModal` passes the `initial="enter"` prop correctly to its internal motion div. (Based on provided code, `FacilitySelectionModal` manages its own internal animation for steps, but the *modal container itself* needs the entry animation).

---

# Affect Files

The following files are identified for modification or context:

1.  **`src/data/useCheckLifecycle.ts`**
    *   *Action:* Add logic to filter notifications based on currently selected Facility/Unit. Implement batching for multiple misses in one tick.

2.  **`src/features/Schedule/CheckCard.tsx`**
    *   *Action:* Replace text-based classification badges with the solid warning icon pattern.

3.  **`src/features/Schedule/CheckCard.module.css`**
    *   *Action:* Update padding rules to default to symmetric; add 'FILL' variation for the warning icon.

4.  **`src/features/Overlays/SettingsModal.tsx`**
    *   *Action:* Wrap root div in `motion.div` with slide-in/slide-out variants.

5.  **`src/features/Overlays/DeveloperModal.tsx`**
    *   *Action:* Wrap root div in `motion.div` with slide-in/slide-out variants.

6.  **`src/components/FullScreenModal.tsx`** (Not provided in context, but critical)
    *   *Action:* Ensure the root overlay/content has `initial={{ x: '100%' }}` if it is handling the animation, or ensure it accepts props to control this.

7.  **`src/App.tsx`** (Not provided in context, but critical)
    *   *Action:* Ensure `AnimatePresence` wraps the conditional logic for `isSettingsModalOpenAtom` and `isDevToolsModalOpenAtom`.

8.  **`src/data/toastAtoms.ts`**
    *   *Action:* Review for potential `removeToast` optimization if "Dismiss All" functionality is added (though batching in `useCheckLifecycle` usually negates the need for "Dismiss All").