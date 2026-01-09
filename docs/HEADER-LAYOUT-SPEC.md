# Prototype Header Spec (Mobile)

## Key Dimensions
*   Total Height: `66px`
    *   Composition: `60px` Base (`--modal-header-height`) + `6px` Layout Adjustment.
*   Offline Height: `66px` (Fixed; contents swap in place).

## Padding & Spacing
*   Container Padding: `8px 16px` (Top/Bottom `8px`, Left/Right `16px`).
    *   Note: Top/Bottom padding matches `--spacing-2`.
*   Item Gap: `12px` (`--spacing-3`) between Flex items.


## Component Specs
*   Menu Button: `44px` x `44px` touch target.
*   Offline Pill:
    *   Total Height: `22px`
        *   Composition: `20px` Content Height + `2px` Border (Top/Bottom 1px).
    *   Padding:
        *   Container: `0 2px` (`--spacing-0p5`).
        *   Inner Content: `0 8px` (`--spacing-2`).
        *   Total Visual Side Padding: `10px`.
    *   Radius: `9999px` (`--radius-pill`).
    *   Bg Color: `grey-600` (Solid, `secondary-solid`).
    *   Text: `14px` Medium (`on-solid`).
