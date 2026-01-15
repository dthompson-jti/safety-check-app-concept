# Implementation Plan - Blocking Error Pattern (Completed 2026-01-15)

## Goal Description
Evolve the specific Forbidden error page into a **Generic Blocking Error Pattern**. This allows the application to handle various failure states (403, 5xx, Offline, Timeout) using a consistent full-screen UI.

## Error States & Wording

| Type | Headline | Body | Error Code | Icon |
| :--- | :--- | :--- | :--- | :--- |
| **Forbidden** | Access Denied | Connection was blocked by the server. Check your VPN connection or account permissions, then try again. | 403 Forbidden | `vpn_lock` |
| **Unavailable** | Server Unavailable | The application server may be down or undergoing maintenance. Try again later. | 503 Service Unavailable | `dns` |
| **Offline** | You're Offline | No internet connection detected. Application data cannot be loaded. | Connection Failed | `cloud_off` |
| **Timeout** | Connection Timeout | The server responded too slowly. It may be under heavy load or your connection is weak. | Request Timeout | `timer_off` |

## Visual Layout (ASCII)
```text
+------------------------------------------+
|                                          |
|                                          |
|                [ ICON ]                  |
|          (Material: vpn_lock)            |
|               Size: 64px                 |
|                                          |
|          Connection Restricted           |
|         (Text-Header-24px-Bold)          |
|                                          |
|      We cannot reach the secure server.   |
|     (Body-16px, fg-secondary)            |
|                                          |
|     Please ensure your VPN is active     |
|             and try again.               |
|                                          |
|          +--------------------+          |
|          |  Retry Connection  |          |
|          |    (Button-MD)     |          |
|          +--------------------+          |
|                                          |
|                                          |
+------------------------------------------+
```

### Data Layer
#### [MODIFY] [atoms.ts](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/data/atoms.ts)
- Replace `isForbiddenErrorVisibleAtom` with `blockingErrorTypeAtom`.
- Type: `BlockingErrorType = null | 'forbidden' | 'unavailable' | 'offline' | 'timeout'`.

### Components
#### [RENAME] `ForbiddenErrorPage` -> `BlockingErrorPage`
- Component takes `type: BlockingErrorType` from atom.
- Maps type to metadata (Icon, Title, Msg, Code).

#### [MODIFY] [NetworkBarrier.tsx](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/features/Shell/NetworkBarrier.tsx)
- Pulls `errorType` from `blockingErrorTypeAtom`.
- If `errorType !== null` -> Render `<BlockingErrorPage />`.

#### [MODIFY] [DeveloperModal.tsx](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/features/Overlays/DeveloperModal.tsx)
- Add a **Segmented Control** or multiple toggles to trigger specific error states.

## Verification Plan

### Manual Verification
1.  **Open Developer Tools**:
    - Tap the specialized gesture or key combo (if available) or look for the "Developer" trigger.
    - Locate the "Simulation" section.
2.  **Toggle Error State**:
    - Turn ON "Force Forbidden State".
    - **Expectation**: The full-screen "Forbidden" error page appears immediately.
3.  **Verify Content**:
    - Check Headline: "Unable to connect..."
    - Check Icon: Shield/Lock.
    - Check Theme: Verify colors adapt to Light/Dark mode (if toggled).
4.  **Dismiss**:
    - Turn OFF "Force Forbidden State" (might need a hidden "X" or just use the dev menu again if accessible, OR the "Retry" button clears it if it's just a simulation).
    - *Note*: Since the error page is full screen, we need to ensure the Developer Modal remains accessible or the "Retry" button clears the *forced* state for testing.
