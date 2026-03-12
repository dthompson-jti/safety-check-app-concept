# Detailed Gap Report: Cross-Project vs Figma

Generated: 2026-02-27T20:16:45.525Z

## Executive Summary
- Core canonical tokens are synchronized and identical across both projects.
- Remaining gaps are primarily outside core convergence scope: excluded Figma families, invalid export data, and raw geometry literals.

## 1) Figma Coverage Breakdown
- Figma full export counts: primitives=548, semantics-light=412, semantics-dark=412, typography=32
- In-scope core counts: primitives=170, semantics-light=189, semantics-dark=189, typography=22
- Excluded families (explicitly non-core this cycle):
  - primitives old/ext/remap: 378
  - semantics light old/ext/remap: 223
  - semantics dark old/ext/remap: 223
- Invalid export data requiring upstream correction:
  - placeholder #ff00ff tokens: light=30, dark=28
  - typography NaNrem tokens: 10

### Invalid Typography Tokens
- `--font-family-font-family-display` = `NaNrem`
- `--font-family-font-family-body` = `NaNrem`
- `--font-weight-regular` = `NaNrem`
- `--font-weight-regular-italic` = `NaNrem`
- `--font-weight-medium` = `NaNrem`
- `--font-weight-medium-italic` = `NaNrem`
- `--font-weight-semibold` = `NaNrem`
- `--font-weight-semibold-italic` = `NaNrem`
- `--font-weight-bold` = `NaNrem`
- `--font-weight-bold-italic` = `NaNrem`

## 2) Cross-Project Canonical Sync Status
- figma-primitives-core.css: MATCH
- figma-semantics-core.css: MATCH
- figma-typography-core.css: MATCH
- geometry-foundation.css: MATCH
- token-bridges.css: MATCH

## 3) Core Alignment Status (After Sync)
- Primitives core: aligned in both projects
- Semantics light core: aligned in both projects
- Semantics dark core: aligned in both projects
- Typography valid core: aligned in both projects

## 4) Remaining Project Gaps
### safeguard-desktop
- unresolved token usages: 0
- raw geometry literal findings: 13
- raw geometry literal details:
  - src/desktop/components/DesktopHeader.module.css:7 -> `height: 44px !important;`
  - src/desktop/components/DetailPanel.module.css:24 -> `width: 2px !important;`
  - src/desktop/components/DetailPanel.module.css:54 -> `width: 2px !important;`
  - src/desktop/components/DetailPanel.module.css:76 -> `height: 44px !important;`
  - src/desktop/components/SideBar/LeftNavigationSubTitle.module.css:5 -> `padding: 0 16px 0 34px;`
  - src/desktop/components/SideBar/LeftNavigationSubTitle.module.css:7 -> `margin: 4px 0;`
  - src/desktop-enhanced/components/NavigationPanel.module.css:3 -> `height: 32px !important;`
  - src/desktop-enhanced/components/NavigationPanel.module.css:4 -> `width: 32px !important;`
  - src/desktop-enhanced/components/NavigationPanel.module.css:21 -> `height: 44px !important;`
  - src/desktop-enhanced/components/TreeView.module.css:12 -> `border-radius: 0 6px 6px 0;`
  - src/desktop-enhanced/components/TreeView.module.css:57 -> `left: calc(12px + 4px - 1px);`
  - src/desktop-enhanced/components/TreeView.module.css:164 -> `padding: 2px 8px;`
  - src/desktop-enhanced/Layout.module.css:55 -> `width: 2px !important;`

### safety-check-app-concept
- unresolved token usages: 0
- raw geometry literal findings: 4
- raw geometry literal details:
  - src/features/Shell/NfcScanButton.module.css:323 -> `right: calc(50% + 80px);`
  - src/features/Shell/NfcScanButton.module.css:329 -> `left: calc(50% + 80px);`
  - src/features/Workflow/CheckEntryView.module.css:353 -> `padding: 20px 24px;`
  - src/styles/buttons.css:216 -> `width: 1px 1px 2px 1px;`

## 5) Cross-Project Behavioral Gaps
- Theme model mismatch: desktop supports `light|dark`; concept supports `system|light|dark`.
- Theme storage-key mismatch: desktop uses prefixed key; concept uses `app-theme`.

## 6) Review Artifacts
- Structured token-by-token review: [figma-delta-structured.md](/c:/Users/dthompson/Documents/CODE/design-tokens-canonical/reports/figma-delta-structured.md)
- Desktop audit report: [token-audit-report.md](/c:/Users/dthompson/Documents/CODE/safeguard-desktop/docs/token-audit-report.md)
- Concept audit report: [token-audit-report.md](/c:/Users/dthompson/Documents/CODE/safety-check-app-concept/docs/token-audit-report.md)

