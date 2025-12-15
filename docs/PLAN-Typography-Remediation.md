# Plan: Typography Remediation
> **Objective:** Standardization of application typography to `16px/14px` scale and `400/600` weight system.
> **Tracking Agent:** `Context Gathering & Planning`

## 1. Strategy
We will perform a "Token-First" refactor, replacing hardcoded values with semantic tokens. We will strictly impose the new Weight System to create a cleaner, higher-contrast UI hierarchy.

### Target Hierarchy
| Role | Size Token | Value (Basis) | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero / Title** | `--font-size-2xl` | 24px | **600** | Screen Titles |
| **Section Header** | `--font-size-lg` | 18px | **600** | Group headers |
| **Body (Normal)** | `--font-size-md` | 16px | **400** | Long form text, inputs |
| **UI / Secondary** | `--font-size-sm` | 14px | **500/600** | Buttons, Menu Items |
| **List Data** | `--font-size-sm` | 14px | **400** | Residents, Upcoming Times |
| **Caption** | `--font-size-xs` | 13px/12px | **400** | Timestamps, Metadata |

## 2. Review Items
> [!IMPORTANT]
> **Button Weight Increase:** All buttons move from 500 -> 600.
> **Menu Weight Increase:** Side Menu items move from 500 -> 600.
> **Card Reduction:** Room Names in cards move from 600 -> 500 to reduce visual noise.

## 3. Execution Steps

### Phase 1: Global Token Alignment
- [x] **[MODIFY]** `src/styles/primitives.css`
    - Check that `--font-size-2xs` maps to `0.75rem` (12px).
    - Ensure `--font-size-xs` maps to `0.8125rem` (13px) or `0.875rem` (14px) depending on need.
    - Confirm `--font-size-md` is `1rem` (16px).

### Phase 2: Component Hardening
- [x] **[MODIFY]** `src/styles/buttons.css`
    - Set `.btn` weight to `600`.
- [x] **[MODIFY]** `src/features/Shell/AppSideMenu.module.css`
    - Update `.title`: `1.5rem` -> `var(--font-size-2xl)`, Weight `600`.
    - Update `.menuItem`: Weight `600`.
- [x] **[MODIFY]** `src/features/Schedule/CheckCard.module.css`
    - Update `.locationText`: Weight `500`.
    - Update `.residentList`: Weight `400`.
    - Refactor `.timeDisplay` to use `400` default, `600` for urgent.

### Phase 3: Global Cleanup
- [x] **[SEARCH & DESTROY]** Find all `font-size: *rem` in `src/features/**/*.css` and replace with tokens.

## 4. Verification
*   **Visual Check:** Ensure buttons and menu items "pop" more (600 weight).
    *   *Note: Reverted AppSideMenu Title to 600 per user request. Items remain at 500/600 via list.css.*
*   **Visual Check:** Ensure check cards feel cleaner (lighter residents, room name not fighting for attention).
*   **Regression Check:** Verify `StatusBadge` size/weight (should be 500).
