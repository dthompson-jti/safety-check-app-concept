# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

- **Read-only Footer:** Updated "View only" footer to "Read only" with a more compact vertical profile for better visual balance.
- **VPN Connection Simulation:** Added mock account `jsiemens` / `vpn` to simulate connection failures.
- **Persistent VPN Error Alert:** Implemented a persistent inline alert for "Access Denied" (VPN) errors on the login screen, replacing the transient toast pattern.
- **Error Messaging:** Refined VPN error wording with detailed guidance: "Check your VPN connection or account permissions, then try again."
- **Contrast Scanner:** Refactored automated accessibility tooling into `scripts/contrast-scanner` with expanded coverage (Settings, Scan View) and improved logging.

### Added
- VPN simulation mock credentials on Login screen.

### Changed
- **VPN Error Presentation:** Transitioned from a toast notification to a structured inline alert for better proximity and visibility during auth failures.

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
