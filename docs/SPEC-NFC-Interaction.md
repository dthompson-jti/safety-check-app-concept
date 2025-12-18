# NFC Interaction & State Machine Spec

## 1. Core Concept: "Radiating Connection"
The NFC scanning experience is designed to feel like a "heartbeat" or "radar" emanating from the application footer, searching for a connection. It dominates the bottom visual field but remains strictly contained within the UI chrome.

## 2. State Machine

```
idle → scanning → success → idle (loop)
         ↓        ↑
       timeout ───┘
```

### State Transitions
| From | To | Trigger | Effect |
|:-----|:---|:--------|:-------|
| `idle` | `scanning` | User taps "Scan" button | Start timeout timer, show visualizer |
| `scanning` | `success` | NFC tag detected | Clear timeout, play success animation |
| `scanning` | `timeout` | Timer expires | Show retry button |
| `success` | `idle` | Animation completes | If simple mode: restart scan; else: open form |
| `timeout` | `idle` | User taps retry | Restart scan |
| `scanning` | `idle` | User cancels | Clear timeout, return to start |

## 3. Simulation Controls

### Developer Tools Panel
Located in Developer Tools modal, these controls simulate NFC hardware states:

| Control | Behavior | Toast Message |
|:--------|:---------|:--------------|
| **Force NFC Failure** | Tag read fails, timeout restarts | "Tag not read. Hold phone steady against the tag." |
| **Force NFC Blocked** | Scan cannot start | "NFC Blocked / Allow NFC in app settings" |
| **Force NFC Turned Off** | Scan cannot start | "NFC is turned off / Open NFC Settings to turn on" |
| **Scanner Timeout** | Configurable timeout duration | (Uses configured timeout) |

### Scan Simulation
- **Tap footer area during scan**: Simulates successful NFC tag read
- Previously used a floating FAB button, now integrated into the footer itself

## 4. Visual States

### 4.1 Idle State
- **Visual**: Blue "Scan" button with sensors icon
- **Tap**: Transitions to scanning state

### 4.2 Scanning State ("Ready to scan")
- **Label**: "Ready to Scan" (centered, semantic blue)
- **Ring Animation**: Optional (controlled by Future Ideas flag)
  - When enabled: Expanding blue rings with radial attenuation
  - When disabled: Just the label, no rings
- **Interaction**: Tap anywhere on footer to simulate tag read

### 4.3 Success State
- **Visual**: Green ring converging with animated checkmark
- **Duration**: ~700ms total
- **Behavior**:
  - If `simpleSubmitEnabled`: Auto-complete check, show toast, restart scanning
  - If `simpleSubmitEnabled` is off: Open `CheckEntryView` form

### 4.4 Timeout State
- **Visual**: Warning button with timer_off icon
- **Label**: "Timed out — Tap to retry"
- **Tap**: Restarts scanning with fresh timeout

## 5. Error States

### NFC Blocked
- **Condition**: `simulation.nfcBlocked` is true in hardwareSimulationAtom
- **Trigger**: User taps "Scan" button
- **Behavior**: Scan does not start, warning toast shown
- **Toast**: "NFC Blocked / Allow NFC in app settings"

### NFC Turned Off
- **Condition**: `simulation.nfcTurnedOff` is true in hardwareSimulationAtom
- **Trigger**: User taps "Scan" button
- **Behavior**: Scan does not start, warning toast shown
- **Toast**: "NFC is turned off / Open NFC Settings to turn on"

### NFC Read Failure
- **Condition**: `simulation.nfcFails` is true in hardwareSimulationAtom
- **Trigger**: During active scan, tag is presented
- **Behavior**: Scan continues, error toast shown, timeout resets
- **Toast**: "Tag not read. Hold phone steady against the tag."

## 6. Layout & Cropping

### Container
- **Reference Frame**: The AppFooter's inner content area
- **Cropping**: Animation clipped to footer bounds (`overflow: hidden`)
- **Bleed**: Rings expand beyond visible area but are hard-clipped

### Centering
- **Origin Point**: Geometric center of the visible footer surface
- **Vertical**: Centered within footer content height
- **Horizontal**: Centered within screen width

## 7. Token Mapping

| Element | Token | Description |
|:--------|:------|:------------|
| Ring Stroke (Scanning) | `--surface-border-info` | Semantic blue |
| Ring Stroke (Success) | `--surface-fg-success-primary` | Green |
| Label Text | `--surface-fg-info-primary` | Semantic dark blue |
| Label Halo | `--surface-bg-secondary` | Background-matching shadow |
| Button (Idle) | Primary button tokens | Blue "Scan" button |
| Button (Timeout) | Warning button tokens | Orange/red retry button |

## 8. Accessibility

- **Reduced Motion**: Ring animation and label pulse disabled when `prefers-reduced-motion: reduce`
- **Touch Targets**: All buttons meet WCAG 44x44px minimum
- **ARIA**: Timeout button includes appropriate labels

## 9. Implementation Files

| File | Purpose |
|:-----|:--------|
| `useNfcScan.ts` | State machine, simulation handling, callbacks |
| `NfcScanButton.tsx` | Visual states, feature flag integration |
| `atoms.ts` | `nfcScanStateAtom`, `hardwareSimulationAtom` |
| `DeveloperModal.tsx` | Simulation controls UI |
