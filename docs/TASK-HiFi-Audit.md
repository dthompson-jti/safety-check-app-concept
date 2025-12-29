# TASK: High-Fidelity Design System Audit

**Priority:** Critical
**Assignee:** QA / Senior Frontend Engineer
**Status:** Open

## Objective
Perform a 100% code-coverage audit of the `MEGA UI Update` implementation for the Desktop Companion app. The goal is to mathematically guarantee that the implementation matches the **Reference Project** (`screen-studio-prototype-public`) and the **Design PRD** without introducing regressions to the Mobile App.

## References
1.  **Design PRD:** `docs/SPEC-MEGA-UI-Update.md` (Source of Truth for Requirements)
2.  **External Reference Project:** `../screen-studio-prototype-public` (Source of Truth for Tokens/Styles)
3.  **Target Project:** `safety-check-app-concept` (The codebase being audited)

## Audit Scope
The audit is strictly limited to the `src/desktop/` directory and its dependencies.
**Critical Constraint:** The audit **MUST** verify that ZERO changes were made to mobile-specific files or shared logic that could break the mobile view.

## Methodology

### Step 1: Token Precision Audit
For every CSS class used in `src/desktop/**/*.module.css`, cross-reference against Reference Project's `src/styles/*.css`.

- [ ] **Buttons:** Verify `src/desktop/components/Button.tsx` (if ported) or usages match `buttons.css` from Reference exactly.
  - *Check:* `padding`, `height` (38px vs 36px?), `border-radius`.
  - *Check:* Hover/Active states use correct `*-hover` and `*-pressed` tokens.
- [ ] **Search Input:** Verify `src/desktop/components/SearchInput.tsx` matches Reference.
  - *Check:* `height: 38px`.
  - *Check:* Bg is `var(--surface-bg-primary)` (White), NOT secondary.
- [ ] **Borders:** Verify all dividers use `var(--surface-border-secondary)`.

### Step 2: Component Architecture Audit
- [ ] **Side Panel Push:**
  - *Verify:* `App.module.css` uses CSS Grid (`grid-template-columns`).
  - *Verify:* Panel does NOT use `position: absolute` or `fixed` (unless specifically strictly required for some internal reason not affecting layout flow).
  - *Verify:* Main content area resizes correctly when panel opens.
- [ ] **Table Actions:**
  - *Verify:* Right-most column has `position: sticky`.
  - *Verify:* Column has correct `z-index` (Stacking Context check).
  - *Verify:* Scroll shadow is present and correct opacity.

### Step 3: Regression Prevention (Mobile Safety)
- [ ] **File Check:** Run `git diff --stat` (or equivalent).
  - *Pass:* Only files in `src/desktop/` or new shared components in `src/components/` are modified.
  - *Fail:* Changes to `src/App.tsx`, `src/index.css` (existing rules), or `src/features/mobile/*`.
- [ ] **Shared Token Integrity:**
  - *Verify:* `src/styles/semantics.css` was NOT modified in a way that changes existing Mobile token values. (additions are okay, mutations are dangerous).

### Step 4: Visual QA (Pixel Peeping)
- [ ] **Header:** Buttons should be identical to Reference Project header buttons.
- [ ] **Search:** Input text alignment must match Reference.
- [ ] **Icons:** Ensure `material-symbols-rounded` are used consistently.
- [ ] **Typography:** Verify font sizes match `var(--font-size-sm)` (14px) and aren't hardcoded.

## Deliverables
1.  **Audit Report:** A markdown document listing every file checked.
    - Format: `[PASS/FAIL] FilePath - Notes`
2.  **Diff Patch:** If failures are found, provide a `.patch` file or specific code blocks to fix deviations.
3.  **Sign-off:** Explicit statement: *"I certify that the Desktop implementation is token-perfect with the Reference Project and Mobile flow is unaffected."*

---
*Note to Auditor: "Close enough" is not good enough. If the reference uses `--spacing-2` (8px) and we use `8px` hardcoded, that is a FAIL.*
