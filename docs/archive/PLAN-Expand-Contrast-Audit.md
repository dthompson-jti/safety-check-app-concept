# Expansion of Contrast Checking

## Goal Description
Expand the existing `scripts/audit-contrast.js` to cover critical workflow views and overlays, ensuring accessibility compliance across the core user journey beyond just the dashboard.

## User Review Required
> [!NOTE]
> This plan proposes expanding the Puppeteer script to programmatically trigger workflow states.

## Options
The following approaches were considered:

### Option 1: Broad Surface Expansion (Recommended)
Add automated navigation to:
- **Workflow Views**: `ScanView` (simulate QR scan), `CheckEntryView` (the form).
- **Overlays**: `ManualCheckSelectorSheet`, `DeveloperModal`.
- **Reasoning**: These are high-traffic areas critical to the user's job.

### Option 2: State Permutation Deep Dive
Focus on the Dashboard but exhaustively test every button state, toast message, and error state.
- **Reasoning**: Good for depth, but misses entire screens.

### Option 3: Full "Spider" Crawl
Attempt to click every interactable element on the page recursively.
- **Reasoning**: Hard to maintain and likely to get stuck in loops or nonsensical states.

**Recommendation**: Proceed with **Option 1** to ensure the primary user flows are accessible.

## Proposed Changes

### Scripts
#### [MODIFY] [audit-contrast.js](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/scripts/audit-contrast.js)
- Add scenarios to trigger `ScanView` (via mock or button click).
- Add scenarios to open `ManualCheckSelectorSheet`.
- Add scenarios to open `DeveloperModal`.
- Ensure each state is captured and audited before moving to the next.

## Verification Plan

### Automated Tests
Run the updated audit script:
```bash
npm run dev
node scripts/audit-contrast.js
```
Verify that the report includes new sections for:
- "Scan View"
- "Manual Check Sheet"
- "Developer Tools"

### Manual Verification
- Review the generated `docs/audit-results.md` to ensure reasonable capture of elements (not just empty pages).
