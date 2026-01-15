---
title: View Only Mode
status: Draft
type: PRD
authors: [Antigravity]
---

# PRD: View Only (Supervisor) Mode

## 1. Discovery
**User Problem**: Supervisors need to monitor the completion status of checks in real-time without the risk of accidentally completing checks or modifying data. They need a "safe" view that provides visibility but removes actionability.

**Scope**:
-   **Global State**: Introduce a "View Only" mode flag.
-   **Footer**: Replace the "Scan/Action" button with a non-interactive "Mode Bar".
-   **Schedule View**: Disable interactivity on check cards (Concept 6: List Only).

## 2. Design Options

### 2.1 Footer: "The Mode Bar"
We will use a **Full-Width Bar** pattern (identical layout to the standard Scan Button) rather than a floating toast. This conveys that "View Only" is a persistent application state, not a temporary alert.

**Visual Specs**:
-   **Layout**: Full width, centered content, matching `var(--footer-action-height)` (56px).
-   **Styling**: "Neutral Blocked" aesthetic.
    -   Background: `var(--surface-bg-tertiary)` (Grey 40).
    -   Border: `1px solid var(--surface-border-secondary)` (Grey 200).
    -   Text: `var(--surface-fg-secondary)` (Grey 700).
    -   Radius: `var(--spacing-3)` (12px).
    -   Typography: `var(--font-weight-semibold)` `var(--font-size-md)`.
    -   Cursor: `default`.
-   **Content**:
    -   Icon: `visibility` (Material Symbol, filled).
    -   Text: "View Only Mode".

### 2.2 Schedule View: Read-Only Cards
**Concept**: The Schedule View renders the standard checks (Missed, Due, Upcoming), but the cards are **not clickable**.

**Behavior**:
-   **Interaction**: `pointer-events: none` (or disabled handlers) on the card.
-   **Visuals**:
    -   No hover/active scale effects.
    -   Cursor remains default.
    -   Status badges and animations remain active.

## 3. Specification

### 3.1 State Management
-   **Atom**: `isViewOnlyModeAtom` (boolean, default `true` for prototype).
-   **Location**: `src/data/atoms.ts` -> `appConfigAtom` (as a persistent config).

### 3.2 Component Updates

#### `AppFooter.tsx`
-   Read `isViewOnlyMode`.
-   If true, render `<div className={styles.viewOnlyBar}>...</div>`.
-   This replaces the `NfcScanButton` or `PrototypingButton`.

#### `CheckCard.tsx`
-   Prop: `isReadOnly?: boolean`.
-   Logic:
    -   `onClick`: No-op if `isReadOnly`.
    -   `whileTap`: `{}` (empty) if `isReadOnly`.
    -   `aria-disabled`: `true` if `isReadOnly`.
    -   Style: Ensure `cursor: default` applies.

## 4. Verification Plan
-   **Visual Check**: Footer bar matches the height and roundedness of the scan button perfectly.
-   **Consistency Check**: Text color usage (`surface-fg-secondary`) matches other neutral UI elements (e.g. secondary text).
-   **Interaction Check**: No feedback when tapping check cards.
