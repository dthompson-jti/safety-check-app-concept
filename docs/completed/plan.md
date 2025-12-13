# Dark Mode Strategic Evaluation & Decision Record

This document records the architectural decisions for the Dark Mode rollout.

## Core Philosophy: "Elevation = Lightness"
In Light Mode, our app structure is:
*   **App Background:** `surface-bg-secondary` (Grey 20 / #F9F9F9)
*   **Card Surface:** `surface-bg-primary` (White / #FFFFFF)
*   **Result:** The "Card" is *lighter* than the background.

To maintain "High Craft" consistency, Dark Mode must follow the same physics:
*   **App Background:** `grey-950` (#0A0C12) -> *Deepest layer*
*   **Card Surface:** `grey-900` (#181D27) -> *Lighter layer*
*   **Modal/Float:** `grey-800` (#252B37) -> *Lightest layer*

This ensures that "Elevation by Lightness" is a universal constant in our design system, rather than inverting blindly.

---

## Decision 1: The Base Palette

### Option A: The "Midnight" (Neutral Grey) [SELECTED]
Uses the existing `primitives-grey` scale.
- **Pros:** Consistent with existing design tokens. Safe hue (Cool Grey 220°). No new primitives needed.
- **Cons:** None.

### Option B: The "Obsidian" (Tinted)
- **Rejected:** Tinted backgrounds often clash with user-defined brand colors (e.g., a Red brand on a Blue dark mode looks muddy). Neutral grey is the safest canvas for a white-label app.

---

## Decision 2: CSS Architecture

### Option A: Separate Files [REJECTED]
- **Reason:** Increases network requests or complexity. Harder to share variables.

### Option B: Data Attribute Override [SELECTED]
We will append a `[data-theme='dark']` block to `src/styles/semantics.css`.
- **Implementation:**
  ```css
  :root { ...defaults (light)... }
  
  [data-theme='dark'] {
    --surface-bg-primary: var(--primitives-grey-900); /* Card */
    --surface-bg-secondary: var(--primitives-grey-950); /* Body */
    /* ... */
  }
  ```
- **Pros:** Single source of truth. Instant context switching.

---

## Decision 3: State Management (The FOUC Problem)

### Option A: React `useEffect` [REJECTED]
- **Reason:** Causes a "Flash of White" on refresh because React hydrates after the initial paint.

### Option B: The "Script Injection" [SELECTED]
We will add a tiny blocking script in `index.html` <head>.
- **Code:**
  ```html
  <script>
    (function() {
      const stored = localStorage.getItem('app-theme');
      if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  </script>
  ```
- **Pros:** 0ms FOUC. The app is dark before the first pixel is painted.

---

## Blueprint: The Semantic Map

| Semantic Token | Light Mode (Ref) | Dark Mode (New) | Note |
| :--- | :--- | :--- | :--- |
| `surface-bg-secondary` (Body) | `grey-20` | `grey-950` (#0A0C12) | Deepest |
| `surface-bg-primary` (Card) | `white` | `grey-900` (#181D27) | Elevated 1 |
| `surface-bg-tertiary` (Item) | `grey-40` | `grey-800` (#252B37) | Elevated 2 |
| `surface-fg-primary` (Text) | `grey-900` | `grey-50` (#F1F1F1) | High Contrast |
| `surface-fg-secondary` | `grey-700` | `grey-300` (#D5D6D9) | Medium |
| `surface-border-primary` | `grey-300` | `grey-700` (#414651) | Subtle |

## Next Steps (Execution)
1.  **Modify `index.html`**: Add the FOUC-prevention script.
2.  **Update `semantics.css`**: Append the `[data-theme='dark']` block with the map above.
3.  **Update `DeveloperModal.tsx`**: Add a toggle to test the `localStorage` value.

---

## Comprehensive Dark Mode Audit

### Critical Issues (Must Fix First)
| File | Issue | Severity |
|:---|:---|:---|
| `DeveloperModal.tsx` | Duplicate `Button` import (L14-15) | Build-Breaking |
| `DeveloperModal.tsx` | Duplicate `activeToasts` declaration (L46-47) | Build-Breaking |

---

### Audit Findings by Category

#### 1. Scrollbars (`scrollbars.css`)
- **Issue:** Uses `--primitives-dark-tint-700` which **does not exist**. This is likely a typo or reference to a removed token.
- **Fix:** Replace with `--primitives-gray-tint-700`.

#### 2. Toast Close Button (`toast.css`)
- **Issue:** Hardcoded hover color `rgba(0, 0, 0, 0.05)` on line 91. Invisible on dark backgrounds.
- **Fix:** Replace with `var(--utility-alpha-black-10)` or a semantic token.

#### 3. Modal Backdrop (`modal.css`)
- **Issue:** Hardcoded `rgba(10, 12, 18, 0.7)` on line 6. Acceptable, but could be tokenized.
- **Status:** Low priority (works on both themes).

#### 4. Missing Control Token Overrides (`semantics.css`)
The dark theme only overrides `surface-*` tokens. Controls use `control-*` tokens that still reference light primitives.
| Token | Current (Light) | Needed (Dark) |
|:---|:---|:---|
| `--control-bg-primary` | White | Grey 800 |
| `--control-bg-secondary` | Grey 20 | Grey 900 |
| `--control-bg-selected` | Theme 50 | Theme 950 |
| `--control-fg-primary` | Grey 900 | Grey 50 |
| `--control-fg-secondary` | Grey 700 | Grey 300 |
| `--control-border-secondary` | Grey 600 | Grey 500 |

#### 5. Header/Footer Translucency (`semantics.css`)
- **Token:** `--surface-bg-header-translucent`
- **Current:** `rgba(249, 249, 249, 0.75)` (light)
- **Needed:** `rgba(10, 12, 18, 0.85)` (dark)

#### 6. Hover States (`semantics.css`)
Missing overrides for:
- `--surface-bg-primary_hover`
- `--surface-bg-secondary_hover`
- `--control-bg-primary-hover`
- `--control-bg-secondary-hover`

#### 7. Status Colors (Info/Warning/Error)
Pastel backgrounds designed for white surfaces are too bright on dark:
| Token | Current (Light) | Needed (Dark) |
|:---|:---|:---|
| `--surface-bg-warning-primary` | Yellow 50 | Yellow 950 |
| `--surface-bg-error-primary` | Red 50 | Red 950 |
| `--surface-bg-success` | Green 50 | Green 950 |
| `--surface-bg-info` | Blue 25 | Blue 950 |

#### 8. Checkbox SVG (`forms.css`)
- **Issue:** Checkbox checkmark is hardcoded white SVG (`stroke='%23FFFFFF'`).
- **Status:** Acceptable (white on theme color works in both modes).

#### 9. Tooltip (`tooltip.css`)
- **Issue:** Uses hardcoded `--primitives-grey-900` and `--primitives-grey-800` for background/border.
- **Impact:** Dark tooltip on dark background = invisible.
- **Fix:** Either invert in dark mode OR accept that tooltips are always dark (a valid pattern for "floating" elements).

#### 10. List Item Pressed State (`list.css`)
- **Issue:** Uses `--surface-bg-primary_pressed` which **does not exist** in semantics.css.
- **Fix:** Add token to semantics.css or replace with `--surface-bg-primary_hover`.

#### 11. Overlay Backdrops (Multiple Files)
Files using hardcoded `rgba(10, 12, 18, 0.7)` or similar:
- `modal.css`, `bottom-sheet.css`, `AppShell.module.css`, `BottomSheet.module.css`, `ManualCheckSelectorSheet.module.css`, `NfcWriteSheet.module.css`, `StatusSelectionSheet.module.css`
- **Status:** Acceptable. This dark overlay works on both light and dark backgrounds.

#### 12. Card Pulse Animation (`CheckCard.module.css`)
- **Issue:** Uses hardcoded `rgba(13, 147, 90, 0.6)` for green success pulse.
- **Status:** Acceptable (color is intentional "success" green).

---

### Complete File Audit Summary

| File Category | Status | Notes |
|:---|:---|:---|
| `primitives.css` | ✅ Correct | Token definitions |
| `utility.css` | ✅ Correct | Alpha token definitions |
| `semantics.css` | ⚠️ Needs Dark Overrides | See Findings #4-7 |
| `scrollbars.css` | ❌ Broken Token | Uses non-existent `--primitives-dark-tint-700` |
| `toast.css` | ⚠️ Hardcoded Hover | Line 91 |
| `tooltip.css` | ⚠️ Hardcoded Primitives | May be intentional dark pattern |
| `list.css` | ❌ Missing Token | `--surface-bg-primary_pressed` |
| `buttons.css` | ✅ Tokenized | Uses control tokens |
| `forms.css` | ✅ Tokenized | - |
| `toggles.css` | ✅ Tokenized | Uses control tokens |
| `tabs.css` | ✅ Tokenized | - |
| `menu.css` | ✅ Tokenized | - |
| `popover.css` | ✅ Tokenized | Uses solid-on-dark pattern |
| `bottom-sheet.css` | ✅ Acceptable | Hardcoded dark overlay |
| `modal.css` | ✅ Acceptable | Hardcoded dark overlay |
| Component Modules | ⚠️ Review Needed | Some have hardcoded overlays |

---

### Recommended Execution Order (Updated)
1. **Fix Build Errors:** Remove duplicate lines in `DeveloperModal.tsx`.
2. **Fix Broken Tokens:** `scrollbars.css` and `list.css`.
3. **Expand Dark Theme Block:** Add control, hover, status, and header tokens.
4. **Fix Toast Hover:** Replace hardcoded color.
5. **Decision: Tooltip Strategy** – Keep dark or invert?
6. **Verify in Browser:** Test all components visually.



