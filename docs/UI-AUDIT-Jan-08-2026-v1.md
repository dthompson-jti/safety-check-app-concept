# UI Audit

## Group 1: Direct Configuration Changes

### 1.1 Foundations (Theme & Tokens)
*   **Primary Color**
    *   Prototype: `#155ACA` (Brand Blue)
    *   Dev: `#202F3F` (Slate)
    *   Fix: Update `primary.main` palette.
*   **Card Background**
    *   Prototype: `#F9F9F9` (Grey-20)
    *   Dev: `#FFFFFF` (White)
    *   Fix: Update Paper/Card background to off-white.
*   **Success Color**
    *   Prototype: `#E6FFEF` (Vibrant Pastel)
    *   Dev: `#EDF7ED` (MUI Light)
    *   Fix: Update `success.light` / `success.main` tokens.
*   **Global Radius**
    *   Prototype: **8px** (Cards), **12px** (Sheets)
    *   Dev: **4px** (Global)
    *   Fix: Update global `shape.borderRadius` to `8px`.
*   **Fonts**
    *   Prototype: `Inter` (Variable)
    *   Dev: System Default
    *   Fix: Import `Inter` via Google Fonts/local asset. (ensure variable font is used)
*   **H1 Headline**
    *   Prototype: **24px / 600** (SemiBold)
    *   Dev: **20px / 400** (Regular)
    *   Fix: Update `typography.h1` definition.
*   **H3 Label**
    *   Prototype: **14px / 600** (SemiBold)
    *   Dev: **20px / 600** (SemiBold)
    *   Fix: Downsize `typography.h3` to match label usage.

### 1.2 Component Styles (Simple Overrides)
*   **Button Height**
    *   Prototype: **44px** (Fixed)
    *   Dev: **36.5px** (MUI Medium)
    *   Fix: Force min-height on `MuiButton`.
*   **Button Radius**
    *   Prototype: **999px** (Pill)
    *   Dev: **4px**
    *   Fix: Update Button `borderRadius`.
*   **Button Shadow**
    *   Prototype: `inset` (Pressed Look)
    *   Dev: `elevation-1`
    *   Fix: Replace `boxShadow` in theme overrides.
*   **Input Height**
    *   Prototype: **38-44px**
    *   Dev: **56px** (Standard Box)
    *   Fix: Adjust Input `size` / `padding`.
*   **Focus Ring**
    *   Prototype: **2px** Offset Blue
    *   Dev: **1px** Inset
    *   Fix: Update focus styles in `MuiOutlinedInput`.
*   **Shadows**
    *   Prototype: Tinted Blue-Grey (`#0A0C12`)
    *   Dev: Generic Black
    *   Fix: Update `shadows` array in theme.

---

## Group 2: Bigger stuff

### 2.1 System Architecture
*   **Icons**
    *   Prototype: **Material Symbols (Font)** - Variable, Rounded.
    *   Size: **20px** (`icon-size-md`) - Optimized for mobile density.
    *   Dev: **MUI Icons (SVG)** - Static, Sharp.
    *   Size: **24px** (Standard) - Larger.

*   **Motion Engines**
    *   Prototype: **Framer Motion** (Physics-based).
        *   Views: `cubic-bezier(0.16, 1, 0.3, 1)` (Expo-Out Custom).
        *   Toasts: `Spring(400, 30)` (Snap-back).
    *   Dev: **CSS Transitions** (Time-based).
        *   Defaults: `ease-in-out` / `linear`.


### 2.2 Layout Patterns
*   **Header Visuals**
    *   Prototype: **Frosted Glass**. `blur(8px)` + `rgba(249, 249, 249, 0.75)`.
    *   Dev: **Solid Opaque**. Primary Color (`#202F3F`).

*   **Header Layout**
    *   Prototype: **Flexbox (Space-Between)** 
    *   Dev: **CSS Grid** 
*   **Header Height**
    *   Prototype: **60px**
    *   Dev: **56px** (4px Difference)
*   **Padding**
    *   Prototype: **8px** specifically for Header Top/Bottom & Card Gaps.
    *   Dev: **16px** Global Padding.

### 2.3 Feature Missing Gaps
*   **Dark Mode**: **Not done yet**. Full support missing (Palette, Elevation, Tokens).
*   **User Avatar**: **Missing**. Profile access point in Header.
*   **Search Input**: **Missing**. Dedicated 'Search' component in lists.
*   **Interactions**: **Missing**. Swipe-to-action on list items; 'Press Scale' feedback on tappables.

### 2.4 Token System Comparison
*   **Prototype (Semantic > Primitive)**
    *   Structure: **Strict Separation**. Logic tokens (`bg-card`) map to Primitive tokens (`grey-20`).
    *   Tech: Relies on CSS variables. Dark mode is a simple variable re-assignment at the root.
*   **Current Dev (MUI Theme)**
    *   Structure: **Direct Values**. Components often reference hex codes directly.