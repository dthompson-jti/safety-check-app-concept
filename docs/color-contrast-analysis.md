# Color Contrast + Hierarchy Analysis

Generated: 2026-02-27T20:16:45.520Z

Rules used:
- PASS: ratio >= 4.5
- WARN: 3.0 <= ratio < 4.5
- FAIL: ratio < 3.0
- hierarchy check expects fg-primary > fg-secondary > fg-tertiary with >=0.5 contrast spacing on same background

## Mode: light
- pass=18, warn=0, fail=0, unresolved=1

### Pairing Results
- [PASS] Surface primary text on primary background
  - tokens: `--surface-fg-primary` on `--surface-bg-primary`
  - colors: `#181d27` on `#ffffff`
  - ratio: 16.88
- [PASS] Surface secondary text on primary background
  - tokens: `--surface-fg-secondary` on `--surface-bg-primary`
  - colors: `#414651` on `#ffffff`
  - ratio: 9.46
- [PASS] Surface tertiary text on primary background
  - tokens: `--surface-fg-tertiary` on `--surface-bg-primary`
  - colors: `#535862` on `#ffffff`
  - ratio: 7.14
- [PASS] Surface primary text on secondary background
  - tokens: `--surface-fg-primary` on `--surface-bg-secondary`
  - colors: `#181d27` on `#f9f9f9`
  - ratio: 16.04
- [PASS] Surface secondary text on secondary background
  - tokens: `--surface-fg-secondary` on `--surface-bg-secondary`
  - colors: `#414651` on `#f9f9f9`
  - ratio: 8.99
- [PASS] Surface tertiary text on secondary background
  - tokens: `--surface-fg-tertiary` on `--surface-bg-secondary`
  - colors: `#535862` on `#f9f9f9`
  - ratio: 6.78
- [PASS] On-solid text on theme solid
  - tokens: `--surface-fg-on-solid` on `--surface-bg-theme-solid`
  - colors: `#ffffff` on `#276fe3`
  - ratio: 4.70
- [PASS] On-solid text on secondary solid
  - tokens: `--surface-fg-on-solid` on `--surface-bg-secondary-solid`
  - colors: `#ffffff` on `#414651`
  - ratio: 9.46
- [PASS] Alert text on alert surface
  - tokens: `--surface-fg-alert-primary` on `--surface-bg-alert-primary`
  - colors: `#bb2e28` on `#fff3f2`
  - ratio: 5.48
- [PASS] Warning text on warning surface
  - tokens: `--surface-fg-warning-primary` on `--surface-bg-warning-primary`
  - colors: `#a84000` on `#fffaeb`
  - ratio: 5.92
- [PASS] Success text on success surface
  - tokens: `--surface-fg-success-primary` on `--surface-bg-success-primary`
  - colors: `#017647` on `#e6ffef`
  - ratio: 5.41
- [PASS] Info text on info surface
  - tokens: `--surface-fg-info-primary` on `--surface-bg-info-primary`
  - colors: `#026aa2` on `#f0f9ff`
  - ratio: 5.49
- [PASS] Control primary text on primary control
  - tokens: `--control-fg-primary` on `--control-bg-primary`
  - colors: `#181d27` on `#ffffff`
  - ratio: 16.88
- [PASS] Control secondary text on secondary control
  - tokens: `--control-fg-secondary` on `--control-bg-secondary`
  - colors: `#414651` on `#f9f9f9`
  - ratio: 8.99
- [PASS] Control on-solid text on theme control
  - tokens: `--control-fg-on-solid` on `--control-bg-theme`
  - colors: `#ffffff` on `#155aca`
  - ratio: 6.27
- [PASS] Control alert text on alert control
  - tokens: `--control-fg-alert` on `--control-bg-alert`
  - colors: `#bb2e28` on `#fff3f2`
  - ratio: 5.48
- [PASS] Control warning text on warning control
  - tokens: `--control-fg-warning` on `--control-bg-warning`
  - colors: `#a84000` on `#fffaeb`
  - ratio: 5.92
- [UNRESOLVED] Control success text on success control
  - tokens: `--control-fg-success` on `--control-bg-success`
  - colors: `N/A` on `#e6ffef`
  - ratio: N/A
- [PASS] Control info text on info control
  - tokens: `--control-fg-info` on `--control-bg-info`
  - colors: `#026aa2` on `#f0f9ff`
  - ratio: 5.49

### Hierarchy Checks
- [PASS] --surface-bg-primary -> primary=16.88, secondary=9.46, tertiary=7.14
- [PASS] --surface-bg-secondary -> primary=16.04, secondary=8.99, tertiary=6.78

## Mode: dark
- pass=18, warn=0, fail=0, unresolved=1

### Pairing Results
- [PASS] Surface primary text on primary background
  - tokens: `--surface-fg-primary` on `--surface-bg-primary`
  - colors: `#f1f1f1` on `#161a24`
  - ratio: 15.40
- [PASS] Surface secondary text on primary background
  - tokens: `--surface-fg-secondary` on `--surface-bg-primary`
  - colors: `#d5d7da` on `#161a24`
  - ratio: 12.06
- [PASS] Surface tertiary text on primary background
  - tokens: `--surface-fg-tertiary` on `--surface-bg-primary`
  - colors: `#a4a7ae` on `#161a24`
  - ratio: 7.22
- [PASS] Surface primary text on secondary background
  - tokens: `--surface-fg-primary` on `--surface-bg-secondary`
  - colors: `#f1f1f1` on `#0e1017`
  - ratio: 16.82
- [PASS] Surface secondary text on secondary background
  - tokens: `--surface-fg-secondary` on `--surface-bg-secondary`
  - colors: `#d5d7da` on `#0e1017`
  - ratio: 13.18
- [PASS] Surface tertiary text on secondary background
  - tokens: `--surface-fg-tertiary` on `--surface-bg-secondary`
  - colors: `#a4a7ae` on `#0e1017`
  - ratio: 7.89
- [PASS] On-solid text on theme solid
  - tokens: `--surface-fg-on-solid` on `--surface-bg-theme-solid`
  - colors: `#ffffff` on `#276fe3`
  - ratio: 4.70
- [PASS] On-solid text on secondary solid
  - tokens: `--surface-fg-on-solid` on `--surface-bg-secondary-solid`
  - colors: `#ffffff` on `#414651`
  - ratio: 9.46
- [PASS] Alert text on alert surface
  - tokens: `--surface-fg-alert-primary` on `--surface-bg-alert-primary`
  - colors: `#ffa298` on `#5e1812`
  - ratio: 6.73
- [PASS] Warning text on warning surface
  - tokens: `--surface-fg-warning-primary` on `--surface-bg-warning-primary`
  - colors: `#f4c04b` on `#471c03`
  - ratio: 8.70
- [PASS] Success text on success surface
  - tokens: `--surface-fg-success-primary` on `--surface-bg-success-primary`
  - colors: `#7ddfa7` on `#003921`
  - ratio: 8.08
- [PASS] Info text on info surface
  - tokens: `--surface-fg-info-primary` on `--surface-bg-info-primary`
  - colors: `#7cd4fd` on `#03344f`
  - ratio: 7.89
- [PASS] Control primary text on primary control
  - tokens: `--control-fg-primary` on `--control-bg-primary`
  - colors: `#f1f1f1` on `#161a24`
  - ratio: 15.40
- [PASS] Control secondary text on secondary control
  - tokens: `--control-fg-secondary` on `--control-bg-secondary`
  - colors: `#d5d7da` on `#0e1017`
  - ratio: 13.18
- [PASS] Control on-solid text on theme control
  - tokens: `--control-fg-on-solid` on `--control-bg-theme`
  - colors: `#f1f1f1` on `#174b9f`
  - ratio: 7.31
- [PASS] Control alert text on alert control
  - tokens: `--control-fg-alert` on `--control-bg-alert`
  - colors: `#ffa298` on `#42110c`
  - ratio: 8.26
- [PASS] Control warning text on warning control
  - tokens: `--control-fg-warning` on `--control-bg-warning`
  - colors: `#f4c04b` on `#4e1d09`
  - ratio: 8.31
- [UNRESOLVED] Control success text on success control
  - tokens: `--control-fg-success` on `--control-bg-success`
  - colors: `N/A` on `#002817`
  - ratio: N/A
- [PASS] Control info text on info control
  - tokens: `--control-fg-info` on `--control-bg-info`
  - colors: `#7cd4fd` on `#022438`
  - ratio: 9.67

### Hierarchy Checks
- [PASS] --surface-bg-primary -> primary=15.40, secondary=12.06, tertiary=7.22
- [PASS] --surface-bg-secondary -> primary=16.82, secondary=13.18, tertiary=7.89

