# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- **Sync Error Toasts:** Implemented dedicated "Fetch" (warning) and "Push" (alert) error toasts with neutral wording.
- **Dev Tools:** Added "Sync error: Fetch" and "Sync error: Push" triggers to the Developer Tools "Toast Playground".
- Generic Blocking Error Pattern (403, 5xx, Offline, Timeout)
- Segmented control in Developer Modal for error simulation
- `bg-quinary` icon styling with 50% opacity for system errors
- Contrast Audit Tool (`scripts/audit-contrast.js`) with multi-screen navigation and OKLCH support.

### Changed
- **Toast Styling:** Refined toast UI for better centering (`align-items: center`) and reduced vertical padding (`12px`).
- **Cleanup:** Removed unused `errorCode` properties from the entire toast stack (UI, data, hooks).
- **Cleanup:** Removed vestigial debug keyboard shortcuts from the App shell.
- **Avatar Accessibility**: Optimized OKLCH lightness (L=0.497) and chroma (C=0.19) for WCAG AA compliance.
- **Avatar Craft**: Applied `line-height: 1` to initials inside circular avatars for better optical centering.
- **User Settings**: Refactored avatar previews to use centralized color utility.

- Legacy `ForbiddenErrorPage` and associated styling
- `enableDynamicAvatarColor` feature flag

### Changed
- **User Settings**: Promoted `UserSettingsModal` to production; removed legacy `SettingsModal`.
- **Theming**: Standardized on "Dark C" as the primary dark theme; deprecated "Dark A" and "Dark B".
- **Badges**: Updated semantic tint tokens (700/300) and borders (subtle) for better accessibility.
- **Error Pages**: Refactored `ForbiddenErrorPage` into `BlockingErrorPage`.
- **Typography**: Updated error code typography to 14px Mono with natural casing.
- **Layout**: Tightened message block spacing and optimized outer gaps in error pages.

---

## [1.0.0] - 2026-01-12

### Added
- Initial project setup and prototype foundation
