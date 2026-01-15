# Implementation Plan - Resolve Avatar Contrast Violation

The recent contrast audit identified a violation on the `UserAvatar` component. The current OKLCH lightness (L=0.65) is too bright to maintain a 4.5:1 ratio with white text.

## Proposed Changes

### [Component] Data Layer
#### [MODIFY] [users.ts](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/data/users.ts)
- Lower the constant lightness `L` from `0.65` to `0.50` in the `getAvatarColor` function.
- This ensures a minimum contrast ratio of ~6:1 with white text across all hues.

### [Component] Audit Tooling
#### [MODIFY] [audit-contrast.js](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/scripts/audit-contrast.js)
- Enhance color parsing to support modern CSS color strings (or at least handle the failure gracefully by trusting `axe-core`'s native results more than the fallback).

## Verification Plan

### Automated Tests
- Run `npm run audit:contrast` and verify that the `UserAvatar` component (`._avatar_...`) now passes with a ratio > 4.5:1.
- Confirm that the reported BG color is no longer incorrectly skipping the OKLCH background.

### Manual Verification
- Visually inspect the avatars in both Light and Dark modes to ensure they still look vibrant but are easier to read.
