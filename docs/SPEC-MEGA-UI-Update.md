# Design PRD: Safeguard Room Checks (Desktop Companion)

## Executive Summary
This document defines the design specifications for the "Mega UI Update" of the Desktop Companion app. It strictly adheres to the **Design System Law** established by the reference project (`screen-studio-prototype-public`).

## 1. Header Region

### 1.1 Action Buttons (Export & Overflow)
**Current State:**
- **Style:** Custom `.outlineButton` and `.iconButton` classes in `DesktopHeader.module.css`. (Non-standard)
- **Tokens:** Uses raw propertys `border: 1px solid var(--surface-border-secondary)`.

**Proposed State:**
- **Component:** `Button` (Ported from Reference).
- **Variant:** `Secondary` (`data-variant="secondary"`).
- **Tokens (Verified in Reference `buttons.css`):**
  - Background: `var(--control-bg-secondary)`
  - Text: `var(--surface-fg-primary)`
  - Border: `var(--control-border-secondary)`
  - Interaction: Hover `var(--control-bg-secondary-hover)`, Pressed `var(--control-bg-secondary-pressed)`.

### 1.2 Side Panel Trigger Configuration
**Current State:**
- **Visual:** Simple `.iconButton`.
- **Behavior:** Overlay `DetailPanel`. `App.tsx` renders `<DetailPanel>` conditionally over content.

**Proposed State:**
- **Visual:** `Button` (Variant: `Secondary`, Icon: `side_navigation`).
- **State:** Toggles `active` class (Standard Button `active` state supports `data-state="on"` or similar? *checked in `buttons.css`: `.btn.active` exists*).
- **Layout Behavior (Push):**
  - **Grid System:** Convert `App.module.css` `.contentArea` to `display: grid`.
  - **Columns:** `grid-template-columns: 1fr auto`.
  - **Panel:** Placed in the second column.
  - **Result:** Main content resizes (shrinks) to fit 1fr, Panel takes fixed width (e.g., 400px). No overlay.

## 2. Search & Filter Bar

### 2.1 Search Input
**Current State:**
- **Style:** `.searchContainer` (Gray Bg).
- **Location:** `DesktopToolbar.module.css`.

**Proposed State:**
- **Component:** `SearchInput` (Reference).
- **Variant:** `Standalone` (`data-variant="standalone"`).
- **Tokens:**
  - Bg: `var(--surface-bg-primary)` (**White**).
  - Border: `var(--surface-border-primary)` (Light Grey).
  - Focus: `var(--control-focus-ring-standard)` (Blue Ring).
- **Note:** Must port `SearchInput.tsx` and `SearchInput.module.css` from Reference.

### 2.2 Filter Button
**Standardization:**
- Replace custom `.iconButton` with `Button` (Variant: `Secondary`, Icon: `filter_list`).

## 3. Data Table Architecture

### 3.1 Architecture Overview
The Reference Project uses `buttons.css` and `forms.css` but lacks a dedicated `DataTable` component. We will build a **Desktop-Specific Table** adhering to the tokens.

### 3.2 Column Dividers
**Specification:**
- Vertical dividers are required.
- **Implementation:** `th, td { border-right: 1px solid var(--surface-border-secondary); }`
- **Exclusion:** `&:last-child { border-right: none; }`.

### 3.3 Sticky Actions Column
**Specification:**
- The "Three Dots" menu column must be sticky.
- **Z-Index:** Must be higher than scrolling content but lower than headers. `z-index: 5`.
- **Shadow:** Left-side shadow implementation required for depth perception when scrolling.
  - Token: `box-shadow: -10px 0 8px -8px rgba(0,0,0,0.15);` (Or use `var(--surface-shadow-sm)` adapted).

### 3.4 Row Actions
**Specification:**
- **Always Visible**.
- **Component:** `Button` (Variant: `Tertiary` or `Quaternary`, Size: `s`).
- **Icon:** `more_vert`.

## 4. Visual Components

### 4.1 Resident Status Badge
**Current:** Orange Square Container + White Icon.
**Proposed:**
- **Container:** Removed (Transparent).
- **Icon:** `var(--surface-fg-primary)` (Dark Grey/Black).
- **Alignment:** Centered in cell.

## 5. Mobile Impact Assessment (Safety Check)
> [!IMPORTANT]
> **Status: SAFE**
> - **Files Modified:** `src/desktop/*` exclusively.
> - **Shared Tokens:** `src/styles/semantics.css` in Target matches Reference structure.
> - **Verification:** `App.module.css` is specific to the Desktop Entry point. Mobile uses `src/App.tsx` (Root) or mobile-specific layouts which are untouched.

## 6. Token Gap Analysis
**Findings:**
1.  **Matched Tokens:** `semantics.css` in `safety-check-app-concept` appears to be a direct fork of the reference. Most tokens (`--control-bg-secondary`, `--surface-bg-primary`) exist.
2.  **Missing Tokens:**
    - `var(--surface-bg-brand-solid)` (Used in Resizer?) - *Exists in `semantics.css` line 21.*
    - `var(--control-bg-quaternary-hover)` - *Exists in `semantics.css` line 113.*
3.  **Action Items:**
    - No new tokens need to be defined in `semantics.css`.
    - We rely 100% on existing definitions.

## 7. Component Porting List
The following components must be copied from Reference (`screen-studio-prototype-public`) to Target (`safety-check-app-concept/src/desktop/components`):
1.  `Button.tsx` + `buttons.css` (or ensure `buttons.css` is imported globally).
2.  `SearchInput.tsx` + `SearchInput.module.css`.
3.  `ResizablePanel.tsx` (Optional, if we want dragging resizing for the Side Panel, otherwise use Grid). *User asked for "Push", Resizable is a "Nice to have". We will start with Grid.*
