# IDEA-002: Automated Accessibility Audit Tooling

**Status:** Proposed
**Area:** DevOps / QA / Accessibility
**Impact:** High (Developer Velocity & Reliability)

## 1. The Problem

The current accessibility workflow relies on "Browser Agent" sessions or manual audits using the Axe DevTools extension.

*   **Slow & Expensive:** Running a browser agent takes time and tokens.
*   **Fragile:** Browser automation can crash or behave inconsistently.
*   **Reactive:** Issues are found *after* code is written and the agent runs.

## 2. Proposed Solution

Move the primary "linting" of accessibility to the local development environment using fast, standard engineering tools.

### A. Static Analysis: `eslint-plugin-jsx-a11y`
Catch errors in the IDE as you type.

*   **Checks:** Missing `alt` text, invalid ARIA attributes, non-interactive handlers.
*   **Workflow:** Runs automatically with `npm run lint`.
*   **Cost:** 0ms (Instant).

### B. Runtime Analysis: `pa11y-ci`
Catch errors in the rendered DOM using a headless browser.

*   **Checks:** Color contrast, empty links, focus management.
*   **Workflow:** Runs via `npm run test:a11y` against the local dev server.
*   **Cost:** ~5-10s (Fast).

## 3. Implementation Plan

1.  **Dependencies:**
    *   `npm install -D eslint-plugin-jsx-a11y`
    *   `npm install -D pa11y-ci`

2.  **Configuration:**
    *   Update `eslint.config.js` to include the accessible recommendation preset.
    *   Create `.pa11yci` file with target URLs (Login, Dashboard) and ignore rules for known false positives.

3.  **Scripts:**
    *   Add `"test:a11y": "pa11y-ci"` to `package.json`.

## 4. Verification

*   **Success Metric:** A developer can verify accessibility compliance locally in under 10 seconds without using an AI agent.
