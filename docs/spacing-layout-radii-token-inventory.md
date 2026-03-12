# safety-check-app-concept Token Inventory: Spacing/Layout + Radii

Generated: 2026-02-28 20:20:15 -08:00

Scope: Tokens referenced via `var(--token)` in project source (`src/**` + `index.html`).

## Spacing / Gap / Layout / Padding / Margin Tokens

| Token | Usages | Fully Mapped Resolution | Resolved Value | Notes |
|---|---:|---|---|---|
| `--avatar-size-md` | 2 | --avatar-size-md = 3rem | 3rem | - |
| `--avatar-size-sm` | 2 | --avatar-size-sm = 2.5rem | 2.5rem | - |
| `--breakpoint-mobile` | 1 | --breakpoint-mobile = 768px | 768px | - |
| `--control-action-height` | 1 | --control-action-height = var(--control-height-md) -> --control-height-md = 2.75rem | 2.75rem | - |
| `--control-height-lg` | 11 | --control-height-lg = 3rem | 3rem | - |
| `--control-height-md` | 9 | --control-height-md = 2.75rem | 2.75rem | - |
| `--control-height-sm` | 4 | --control-height-sm = 2.25rem | 2.25rem | - |
| `--control-height-xs` | 3 | --control-height-xs = 1.25rem | 1.25rem | - |
| `--control-min-touch` | 8 | --control-min-touch = 3.5rem \\|\\| --control-min-touch = 44px | 3.5rem \\|\\| 44px | Multiple definitions (2) |
| `--control-width-checkbox` | 4 | --control-width-checkbox = 1.25rem | 1.25rem | - |
| `--control-width-switch` | 1 | --control-width-switch = 2.25rem | 2.25rem | - |
| `--control-width-thumb` | 2 | --control-width-thumb = 1rem | 1rem | - |
| `--footer-action-height` | 6 | --footer-action-height = 3rem | 3rem | - |
| `--footer-height` | 5 | --footer-height = var(--geom-footer-height-default) -> --geom-footer-height-default = 80px | 80px | - |
| `--form-footer-height` | 1 | --form-footer-height = var(--geom-form-footer-height-default) -> --geom-form-footer-height-default = var(--spacing-24) -> --spacing-24 = MULTI | MULTI(--spacing-24) | Unclear: dependency has multiple definitions |
| `--geom-footer-height-default` | 1 | --geom-footer-height-default = 80px | 80px | - |
| `--geom-form-footer-height-default` | 2 | --geom-form-footer-height-default = var(--spacing-24) -> --spacing-24 = MULTI | MULTI(--spacing-24) | Unclear: dependency has multiple definitions |
| `--geom-header-height-default` | 2 | --geom-header-height-default = 56px | 56px | - |
| `--header-height` | 3 | --header-height = var(--geom-header-height-default) -> --geom-header-height-default = 56px | 56px | - |
| `--icon-size-lg` | 7 | --icon-size-lg = 1.5rem | 1.5rem | - |
| `--icon-size-md` | 12 | --icon-size-md = 1.25rem | 1.25rem | - |
| `--icon-size-sm` | 2 | --icon-size-sm = 1rem | 1rem | - |
| `--line-height-trim` | 4 | --line-height-trim = 1 | 1 | - |
| `--list-leading-width` | 1 | --list-leading-width = 3rem | 3rem | - |
| `--max-width-card` | 3 | --max-width-card = 25rem | 25rem | - |
| `--max-width-empty-state` | 3 | --max-width-empty-state = 20rem | 20rem | - |
| `--max-width-scanner` | 3 | --max-width-scanner = 18.75rem | 18.75rem | - |
| `--modal-header-height` | 5 | --modal-header-height = 3.75rem | 3.75rem | - |
| `--radius-full` | 3 | --radius-full = 9999px | 9999px | - |
| `--sheet-handle-height` | 3 | --sheet-handle-height = 0.25rem | 0.25rem | - |
| `--sheet-handle-width` | 2 | --sheet-handle-width = 2rem | 2rem | - |
| `--side-menu-min-width` | 1 | --side-menu-min-width = 13.75rem | 13.75rem | - |
| `--space-3` | 2 | --space-3 = var(--spacing-3) -> --spacing-3 = MULTI | MULTI(--spacing-3) | Unclear: dependency has multiple definitions |
| `--spacing-0` | 6 | --spacing-0 = 0px | 0px | - |
| `--spacing-0-5` | 1 | --spacing-0-5 = var(--spacing-0p5) -> --spacing-0p5 = MULTI | MULTI(--spacing-0p5) | Unclear: dependency has multiple definitions |
| `--spacing-0p25` | 7 | --spacing-0p25 = 1px | 1px | - |
| `--spacing-0p5` | 18 | --spacing-0p5 = 0.125rem \\|\\| --spacing-0p5 = 2px | 0.125rem \\|\\| 2px | Multiple definitions (2) |
| `--spacing-1` | 41 | --spacing-1 = 0.25rem \\|\\| --spacing-1 = 4px | 0.25rem \\|\\| 4px | Multiple definitions (2) |
| `--spacing-10` | 7 | --spacing-10 = 2.5rem \\|\\| --spacing-10 = 40px | 2.5rem \\|\\| 40px | Multiple definitions (2) |
| `--spacing-12` | 7 | --spacing-12 = 3rem \\|\\| --spacing-12 = 48px | 3rem \\|\\| 48px | Multiple definitions (2) |
| `--spacing-120` | 6 | --spacing-120 = 30rem \\|\\| --spacing-120 = 480px | 30rem \\|\\| 480px | Multiple definitions (2) |
| `--spacing-140` | 6 | --spacing-140 = 35rem \\|\\| --spacing-140 = 560px | 35rem \\|\\| 560px | Multiple definitions (2) |
| `--spacing-16` | 7 | --spacing-16 = 4rem \\|\\| --spacing-16 = 64px | 4rem \\|\\| 64px | Multiple definitions (2) |
| `--spacing-160` | 6 | --spacing-160 = 40rem \\|\\| --spacing-160 = 640px | 40rem \\|\\| 640px | Multiple definitions (2) |
| `--spacing-180` | 6 | --spacing-180 = 45rem \\|\\| --spacing-180 = 720px | 45rem \\|\\| 720px | Multiple definitions (2) |
| `--spacing-192` | 6 | --spacing-192 = 48rem \\|\\| --spacing-192 = 768px | 48rem \\|\\| 768px | Multiple definitions (2) |
| `--spacing-1h` | 1 | --spacing-1h = var(--spacing-1p5) -> --spacing-1p5 = MULTI | MULTI(--spacing-1p5) | Unclear: dependency has multiple definitions |
| `--spacing-1p5` | 21 | --spacing-1p5 = 0.375rem \\|\\| --spacing-1p5 = 6px | 0.375rem \\|\\| 6px | Multiple definitions (2) |
| `--spacing-2` | 123 | --spacing-2 = 0.5rem \\|\\| --spacing-2 = 8px | 0.5rem \\|\\| 8px | Multiple definitions (2) |
| `--spacing-20` | 6 | --spacing-20 = 5rem \\|\\| --spacing-20 = 80px | 5rem \\|\\| 80px | Multiple definitions (2) |
| `--spacing-24` | 9 | --spacing-24 = 6rem \\|\\| --spacing-24 = 96px | 6rem \\|\\| 96px | Multiple definitions (2) |
| `--spacing-256` | 6 | --spacing-256 = 1024px \\|\\| --spacing-256 = 64rem | 1024px \\|\\| 64rem | Multiple definitions (2) |
| `--spacing-2p5` | 1 | --spacing-2p5 = 0.625rem | 0.625rem | - |
| `--spacing-3` | 120 | --spacing-3 = 0.75rem \\|\\| --spacing-3 = 12px | 0.75rem \\|\\| 12px | Multiple definitions (2) |
| `--spacing-32` | 6 | --spacing-32 = 128px \\|\\| --spacing-32 = 8rem | 128px \\|\\| 8rem | Multiple definitions (2) |
| `--spacing-320` | 6 | --spacing-320 = 1280px \\|\\| --spacing-320 = 80rem | 1280px \\|\\| 80rem | Multiple definitions (2) |
| `--spacing-360` | 6 | --spacing-360 = 1440px \\|\\| --spacing-360 = 90rem | 1440px \\|\\| 90rem | Multiple definitions (2) |
| `--spacing-4` | 101 | --spacing-4 = 16px \\|\\| --spacing-4 = 1rem | 16px \\|\\| 1rem | Multiple definitions (2) |
| `--spacing-40` | 6 | --spacing-40 = 10rem \\|\\| --spacing-40 = 160px | 10rem \\|\\| 160px | Multiple definitions (2) |
| `--spacing-400` | 6 | --spacing-400 = 100rem \\|\\| --spacing-400 = 1600px | 100rem \\|\\| 1600px | Multiple definitions (2) |
| `--spacing-48` | 6 | --spacing-48 = 12rem \\|\\| --spacing-48 = 192px | 12rem \\|\\| 192px | Multiple definitions (2) |
| `--spacing-480` | 6 | --spacing-480 = 120rem \\|\\| --spacing-480 = 1920px | 120rem \\|\\| 1920px | Multiple definitions (2) |
| `--spacing-5` | 11 | --spacing-5 = 1.25rem \\|\\| --spacing-5 = 20px | 1.25rem \\|\\| 20px | Multiple definitions (2) |
| `--spacing-56` | 6 | --spacing-56 = 14rem \\|\\| --spacing-56 = 224px | 14rem \\|\\| 224px | Multiple definitions (2) |
| `--spacing-6` | 17 | --spacing-6 = 1.5rem \\|\\| --spacing-6 = 24px | 1.5rem \\|\\| 24px | Multiple definitions (2) |
| `--spacing-64` | 6 | --spacing-64 = 16rem \\|\\| --spacing-64 = 256px | 16rem \\|\\| 256px | Multiple definitions (2) |
| `--spacing-8` | 22 | --spacing-8 = 2rem \\|\\| --spacing-8 = 32px | 2rem \\|\\| 32px | Multiple definitions (2) |
| `--spacing-80` | 6 | --spacing-80 = 20rem \\|\\| --spacing-80 = 320px | 20rem \\|\\| 320px | Multiple definitions (2) |
| `--spacing-96` | 6 | --spacing-96 = 24rem \\|\\| --spacing-96 = 384px | 24rem \\|\\| 384px | Multiple definitions (2) |
| `--spacing-px` | 2 | --spacing-px = var(--spacing-0p25) -> --spacing-0p25 = 1px | 1px | - |
| `--visual-viewport-height` | 4 | --visual-viewport-height = UNRESOLVED | UNRESOLVED(--visual-viewport-height) | Unclear: no token definition found in repo styles; Unclear: unresolved dependency in mapping |

## Radii Tokens

| Token | Usages | Fully Mapped Resolution | Resolved Value | Notes |
|---|---:|---|---|---|
| `--radius-2xl` | 11 | --radius-2xl = 1rem | 1rem | - |
| `--radius-3` | 1 | --radius-3 = var(--radius-md) -> --radius-md = 0.5rem | 0.5rem | - |
| `--radius-full` | 3 | --radius-full = 9999px | 9999px | - |
| `--radius-lg` | 12 | --radius-lg = 0.625rem | 0.625rem | - |
| `--radius-md` | 24 | --radius-md = 0.5rem | 0.5rem | - |
| `--radius-pill` | 7 | --radius-pill = 9999px | 9999px | - |
| `--radius-sm` | 36 | --radius-sm = 0.375rem | 0.375rem | - |
| `--radius-xl` | 4 | --radius-xl = 0.75rem | 0.75rem | - |
| `--radius-xs` | 4 | --radius-xs = 0.125rem | 0.125rem | - |
