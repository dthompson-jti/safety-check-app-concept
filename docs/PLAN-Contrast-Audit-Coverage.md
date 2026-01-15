# Plan: Contrast Scanner 100% Coverage

## 1. Discovery & Objective
The current contrast scanner (`scripts/contrast-scanner/index.js`) covers approximately 40% of the application (Dashboard, Settings, Scan View). To ensure WCAG AA compliance across the entire user journey, we need to expand the automated audit to capture missing views, transient states, and edge cases.

**Current Coverage:**
- ✅ Dashboard (Time View)
- ✅ User Settings
- ✅ Scan View (Camera)
- ✅ Dashboard Dark Mode

**Missing Coverage (Targets):**
- ❌ Login View
- ❌ Facility Selection View
- ❌ Side Menu (Open State)
- ❌ Check Entry Form (The core workflow)
- ❌ Status Selection Sheet (Bottom sheet)
- ❌ Empty States (No checks due)
- ❌ Error States (Offline/Blocking)
- ❌ Historic View (Table)

## 2. Technical Approach
We will refactor `scripts/contrast-scanner/index.js` into a modular scenario-based runner. Instead of a single monolithic function, we will define discrete `AuditScenarios` that can be executed sequentially.

### Hybrid Navigation Strategy
- **Primary**: Use Puppeteer `click()` events to navigate naturally. This ensures buttons and interactables function as expected.
- **Secondary**: Use `page.evaluate()` to force specific React states (via LocalStorage or DOM manipulation) for hard-to-reach edge cases (Empty States, Error Screens).

## 3. Implementation Steps

### Phase 1: Modular Refactor
Refactor `runAudit` to iterate through an array of scenario functions.
```javascript
const scenarios = [
  auditStartup,
  auditDashboard,
  auditWorkflow,
  auditEdgeCases
];
```

### Phase 2: Scenario Definitions

#### A. Startup Flow
1. **Login View**: Clear LocalStorage, reload. Capture Login screen.
2. **Facility Selection**: Click "Shortcut Login". Capture Facility Selection modal.

#### B. Dashboard & Navigation
3. **Side Menu**: Authenticate/Select Facility. Click hamburger menu. Capture Side Menu.
4. **Dashboard**: Already covered.

#### C. Core Workflow (Form)
5. **Check Form**: Locate first `.checkCard`. Click it. Capture `CheckEntryView`.
6. **Sheet / Modal**: Inside Form, click "Mark All" (if available) or trigger a select. Capture `StatusSelectionSheet`.
7. **Manual Check**: From dashboard, open "Manual Check" sheet (FAB or Menu). Capture `ManualCheckSelectorSheet`.

#### D. Edge Cases (State Injection)
8. **Empty State**: In browser context, set `atom` state for checks to `[]` or filter to a non-existent query. Capture `EmptyStateMessage`.
9. **Blocking Error**: In browser context, trigger the `blockingErrorTypeAtom` to `'offline'`. Capture `BlockingErrorPage`.

### Phase 3: Helper Improvements
- **Animation Handling**: Introduce a standard `waitForAnimations()` helper that waits for `framer-motion` settling (or simply fixed delays).
- **Selector Robustness**: Use `aria-label` selectors where possible to implicitly audit accessibility labeling.

## 4. Execution Plan

### Step 1: Refactor Structure
- Break `index.js` into functions.
- Ensure report generator handles multiple screenshots/results cleanly.

### Step 2: Implement "Startup" & "Menu" Scenarios
- Add Login and Side Menu coverage.
- Verify basic navigation auditing.

### Step 3: Implement "Workflow" Scenarios
- Add Check Entry Form and Sheets.
- This is the most complex part due to animation timings.

### Step 4: Implement "Edge Case" Scenarios
- Use `page.evaluate` to manipulate Jotai state (or clear DOM/Localstorage) to force Empty/Error states.

## 5. Verification
- Run `node scripts/contrast-scanner/index.js`
- Review `docs/audit-results.md`
- Confirm all 8+ targets listed above appear in the report.
