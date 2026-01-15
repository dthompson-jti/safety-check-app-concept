# Accessibility Strategy & Compliance

## 1. Compliance Goal
The project aims for **WCAG 2.1 Level AA** compliance. Accessibility is not an afterthought but a core "High-Craft" requirement.

### Key Targets
*   **Contrast:** Minimum **4.5:1** for normal text, **3:1** for large text and UI components (borders, icons).
*   **Keyboard:** Full navigability without a mouse.
*   **Semantics:** Proper ARIA roles and landmarks for screen reader support.
*   **Touch Targets:** Minimum **44x44 CSS pixels** for interactive controls (WCAG 2.5.5).

### Touch Target Implementation
The application uses design tokens to enforce touch target minimums:

| Token | Size | Use Case |
|:------|:-----|:---------|
| `--control-height-md` | 44px (2.75rem) | **Standard controls** (buttons, inputs) |
| `--control-height-sm` | 36px (2.25rem) | Secondary controls (with padding expansion) |
| `--control-height-lg` | 48px (3rem) | Navigation buttons (header icons) |
| `--control-min-touch` | 56px (3.5rem) | "Golden Row" list items |

**Micro-Interaction Pattern:** For visually small elements (chip close buttons, inline actions), use CSS `::after` pseudo-element to expand the invisible hit area to 44px while keeping the visual size compact.

## 2. Tooling & Auditing

We use a layered approach to verification, combining static analysis for design tokens with runtime analysis for rendered DOM.

### A. Static Analysis: The "Contrast Audit" Script
Because our design system uses CSS Variables and distinct themes (`light`, `dark-a`, `dark-b`, `dark-c`), standard browser tools often miss potential failures (e.g., a dark mode token that hasn't been rendered yet).

**Tool:** `contrast_audit.cjs` (Custom Script)
*   **What it does:** Parses `primitives.css` and `semantics.css` directly to calculate the mathematical contrast ratio of every defined background/foreground pair logic.
*   **When to use:** Whenever adding or modifying a semantic token.
*   **How to run:**
    ```bash
    node contrast_audit.cjs
    ```
*   **Interpreting Results:** Focus on the "Worst Violations" table. Ignore "theoretical" failures for pairs that are never actually used (e.g., `text-on-brand` vs `surface-bg-error`).

### B. Automated Runtime Analysis (Proposed)
We are moving away from browser-agent auditing toward standard engineering tools (See `docs/IDEA-002-automated-audit-tooling.md`).

**1. Static Linting:** `eslint-plugin-jsx-a11y`
*   **Target:** `package.json`, React components.
*   **Goal:** Catch semantic errors (missing alt, invalid ARIA) in the IDE.

**2. Headless Auditing:** `pa11y-ci`
*   **Target:** Rendered DOM via CLI.
*   **Goal:** Catch contrast and structural issues in the build pipeline (`npm run test:a11y`).
*   **Shift:** This replaces manual "Axe" runs for routine checks.

### C. Manual Analysis: Axe DevTools / Lighthouse
Retained for deep-dive debugging of specific interactive flows that CLIs miss.

---

## 3. Dark Mode Strategy
Our dark modes require specific care because "light mode" assumptions often break.

### The "Shift to 400" Rule
Status colors (Red, Yellow, Green, Blue) that are legibly dark (`600-700` weight) on white backgrounds become invisible on dark backgrounds (`grey-900`).
*   **Rule:** In dark mode themes, always override status text tokens to lighter `400` weights.
*   **Reference:** See `docs/SPEC-Dark-Mode.md` for specific mappings.

### Primary Brand Buttons
Standard "White Text on Brand Blue" often fails in dark mode if the brand color isn't adjusted.
*   **Rule:** Dark themes must use `theme-800` (Background) + `grey-50` (Text) to ensure 4.5:1 contrast.

---

## 4. Remediation Workflow
When an accessibility issue is found:

1.  **Isolate:** Is it a design token issue (color) or a structural issue (DOM)?
2.  **Fix:**
    *   **Color:** Update `semantics.css` overrides. **Verify with `contrast_audit.cjs`**.
    *   **Structure:** update the React component (e.g., change `div` to `button`, add `aria-label`).
3.  **Verify:** Re-run the relevant tool to close the loop.
