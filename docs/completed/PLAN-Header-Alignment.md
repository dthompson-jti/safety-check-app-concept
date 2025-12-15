# Plan: Universal Header Alignment Remediation

## 1. Executive Summary
We have identified a pattern of optical misalignment in the application's headers. The text often appears "shifted up" relative to the icons. This is caused by a combination of manual `translateY` adjustments and default `line-height` behavior. We will remove these manual adjustments and implement a standard `line-height: 1` strategy to achieve precise "Vertical Trim" alignment.

## 2. In-Scope Components

### A. Modals (`FullScreenModal`)
- **Current State:** Uses `transform: translateY(-2px)` on the title.
- **Issue:** This magic number over-corrects or conflicts with the button's centering, lifting the text too high.

### B. Workflow Views (`CheckEntryView`)
- **Current State:** Uses a similar `transform: translateY(-2px)` on the `.headerTitle`.
- **Issue:** Same as above. The text is physically lifted, breaking center alignment.

### C. Bottom Sheets (`BottomSheet`)
- **Current State:** No explicit alignment fix, relying on default flex behavior.
- **Issue:** May suffer from loose line-heights making alignment imprecise.

### D. App Header (`AppHeader`)
- **Current State:** Appears reasonably aligned but should be audited to ensure it matches the new standard.

## 3. Implementation Plan

### Step 1: Remove "Magic Numbers"
We will inspect all header CSS modules and remove any `transform: translateY(...)` or `margin-top` / `padding-bottom` hacks intended to vertically center text.
- **Target Files:**
  - `src/components/FullScreenModal.module.css`
  - `src/features/Workflow/CheckEntryView.module.css`
  - `src/components/BottomSheet.module.css` (verify)

### Step 2: Enforce `line-height: 1`
For all single-line header titles, we will set `line-height: 1`. This effectively trims the "leading" (vertical whitespace) from the font, allowing flexbox's `align-items: center` to center the *cap height* of the text against the icon buttons.
- **Rule:** `line-height: 1` is the new standard for Header Titles.
- **Safety:** For multi-line headers (rare in Modals), we will allow `line-height: 1.2`, but for the vast majority of our H2/H3 modal headers, `1` is safe and preferred.

### Step 3: Button Alignment Verification
We must ensure the *buttons* are the reference height providers.
- **Analysis:** Our `.btn` styles in `buttons.css` use `line-height: 1`.
- **Conclusion:** Matching the header title to `line-height: 1` will put them on the exact same typographic grid as the button labels and icons.

## 4. Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **Descender Clipping** | `line-height: 1` can clip 'g', 'y' if `overflow: hidden` is tight. Modals usually have enough padding. We will verify padding is sufficient. |
| **Multi-line Wrapping** | If a title wraps, lines will touch. **Mitigation:** Start with `line-height: 1`. If wrapping is a concern for specific long titles, we will use `line-height: 1.1` locally, but default to `1`. |
| **Material Symbols** | Icon fonts are generally well-centered. If they aren't, `line-height: 1` on the icon span might help (already present in `fonts.css`?). Yes, `fonts.css` sets `line-height: 1` for icons. This confirms our text should also match. |

## 5. Execution Steps
1.  **Modify `FullScreenModal.module.css`**: Remove transform, set `line-height: 1`.
2.  **Modify `CheckEntryView.module.css`**: Remove transform, set `line-height: 1`.
3.  **Modify `BottomSheet.module.css`**: Ensure `.header h2` has `line-height: 1`.
4.  **Audit `AppHeader.module.css`**: Ensure consistency.
5.  **Verify**: Open all 3 types of views and check alignment with a screen ruler/visual inspection.

## 6. Future Prevention
- Add a "Header Typography" section to `docs/STRATEGY-Typography.md` (or equivalent) documenting the `line-height: 1` rule for headers adjacent to buttons.
