# Typography Audit
> **Date:** 2025-12-14
> **Scope:** Entire Project (`src/`)
> **Focus:** Font Size, Weight, Family, and Semantic Hierarchy

## Executive Summary
The application's typography architecture is structurally sound but suffers from significant implementation drift. While the **Font Family** (`Inter`) is consistently applied via CSS variables, **Font Size** and **Font Weight** usage has become erratic, with frequent hardcoded values (`px`, `rem`) replacing semantic tokens.

This audit establishes a strict remediation path to enforce a **16px Body Standard** (Target Normal) and a **14px Minimum**, alongside a simplified **400/600** weight system.

## 1. Benchmarking & Standards
Research into iOS and Material Design 3 guidelines confirms the following best practices for mobile interfaces:
*   **Target Normal Body Size:** **16px** (1rem). Standard for optimal readability on touch devices.
*   **Minimum Legible Size:** **14px** (0.875rem). Acceptable for secondary lists, dense data, or UI labels, but should not be the primary text driver.
*   **Caption/Helper Size:** **12px** (0.75rem). Restricted to non-critical text (timestamps, copyright, metadata).

## 2. Findings

### A. Font Family
*   **Status:** ✅ **Compliant**
*   **Observation:** `var(--font-family-sans)` -> `Inter` is widely used. No rogue fonts detected.

### B. Font Size
*   **Status:** ⚠️ **Non-Compliant**
*   **Violation:** Widespread use of hardcoded sizes (`0.9rem`, `0.95rem`, `1.5rem`) instead of tokens.
*   **Violation:** Inconsistent base sizes. Some views use 14px (0.9rem approx) as body, others 16px.
*   **Critical Findings:**
    *   `AppSideMenu` title is hardcoded to `1.5rem` (should be `--font-size-2xl`).
    *   `OfflineBanner` uses `0.95rem` (should be `--font-size-md`).
    *   Various "subtle" adjustments like `0.85rem` drift from the 14px standard.

### C. Font Weight
*   **Status:** ⚠️ **Inconsistent**
*   **Violation:** Weights are "feely" rather than systematic. Usage of 300, 500, and 700 mixes arbitrarily.
*   **New Standard:** 
    *   **400 (Regular):** Body, Residents, Upcomming.
    *   **600 (Semi-Bold):** Headers, Buttons, Active States, Critical Data (Due/Missed).
    *   **500 (Medium):** Restricted use (Badges, specific UI labels).

## 3. Tech Debt & Optimization
*   **Color Tokens:** Some specialized text colors (e.g., `futureIdeasWarning`) use raw hex or one-off vars instead of `surface-fg-*`.
*   **Spacing:** Hardcoded px values (e.g., `padding: 2px`) found in `StatusBadge`.

## 4. Recommendations
1.  **Enforce 16px Base:** Adopt 1rem (16px) as the default for comfortable reading. Use 0.875rem (14px) strictly for "dense" modes or secondary info.
2.  **Strict Tokenization:** Eradicate all `font-size: *px` and `font-size: *rem` from feature CSS. All sizes must map to `primitives.css`.
3.  **Weight Consolidation:** Bulk update CSS to snap weights to 400 or 600.
