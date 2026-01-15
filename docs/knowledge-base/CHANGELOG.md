# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- Generic Blocking Error Pattern (403, 5xx, Offline, Timeout)
- Segmented control in Developer Modal for error simulation
- `bg-quinary` icon styling with 50% opacity for system errors

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
