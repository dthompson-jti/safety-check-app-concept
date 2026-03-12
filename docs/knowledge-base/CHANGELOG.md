# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- Token audit tooling: `scripts/token-audit.mjs` and npm scripts `audit:tokens` / `audit:tokens:strict`.
- Generated Figma token CSS imports and generated token files under `src/styles/generated/`.
- New documentation and analysis reports: color reconciliation, Figma gap/delta mapping, spacing/radius inventory, token audit summary, and contrast analysis (`docs/*.md` additions).
- Additional local analysis artifacts currently uncommitted: `eslint_out.txt`, `lint_report.json`, `extract.js`, `extract.mjs`, `replace.mjs`, `path1_extracted.txt`, `path2_extracted.txt`, `test-svg.html`.

### Changed
- App context model expanded from `group -> unit` to `group -> facility -> unit` across data, selectors, modals, side-menu display, schedule filtering, and NFC provisioning state.
- Facility selection flow upgraded to a 3-step modal (group, facility, unit) with updated context banners and commit logic.
- Blocking-error behavior refined:
  - Added `unauthorized` blocking type and dev toggle support.
  - Updated `BlockingErrorPage` metadata/actions and unauthorized messaging.
  - Moved `NetworkBarrier` wrapping into `AppShell` main content path.
  - Hid footer during blocking errors.
  - Standardized logout to clear blocking state and updated logout callers to use shared `logoutAtom`.
  - Ensured successful login paths clear stale blocking errors.
- Login/session UX updates:
  - Added simulated `forbidden` and `unauthorized` login paths.
  - Updated copy from "Sign in" to "Log in" and refined VPN/access-denied wording.
  - Improved inline error presentation sizing/alignment in `LoginView`.
- Scan workflow behavior updates:
  - For Simple Scan OFF, transition to form immediately on successful scan (removed delayed/setTimeout path).
  - Removed `any` casts in duplicate-scan pending-check handling.
- Theming/token consolidation:
  - Standardized runtime theme target to `data-theme='dark'` (migrated `dark-c` and related selectors).
  - Updated semantic/background token usage (`surface-bg-secondary-translucent` and related replacements).
  - Updated utility token aliases to resolve directly from primitive token vars.
  - Updated contrast scanner dark-mode simulation and startup theme bootstrap in `index.html`.
- Visual/layout tuning across shell and workflow surfaces (header/footer glass surfaces, dark-mode selectors, hover/border tweaks, geometry token fallbacks, backdrop/chrome z-index handling).
- Documentation refreshes in `docs/completed/*`, `SPEC-Dark-Mode.md`, `STRATEGY-Accessibility.md`, and `AGENTS.md`.
- App version updated to `v4.48`.

### Removed
- `docs/knowledge-base/CriticalIcons copy.tsx` (obsolete duplicate).

---

## [1.0.0] - 2026-01-12

### Added
- Initial project setup and prototype foundation

