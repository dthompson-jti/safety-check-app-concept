### UI Specification: Task Overlays & Lists

This specification defines the "Should Be" state for the unified task overlay system used in **Manual Check Selection** and **NFC Tag Provisioning**.

#### 1. Global Overlay Container (`TaskOverlayLayout`)
*   **Z-Index:** `105` (Full Screen) or `101` (Sheet).
*   **Background:** `var(--surface-bg-secondary)`.
*   **Animation:** Slide Up (`y: 100%` -> `0%`) with spring physics.

#### 2. Standard Overlay Header
*   **Height:** `60px` (Fixed).
*   **Background:** `var(--surface-bg-tertiary)`.
*   **Border:** Bottom, 1px solid `var(--surface-border-secondary)`.
*   **Padding:** `0 var(--spacing-4)`.
*   **Typography:**
    *   **Title:** `<h3>`, 1.1rem, Weight 600, Color `var(--surface-fg-primary)`.
*   **Actions:**
    *   **Close Button:** Right-aligned, `Button` component, `variant="tertiary"`, `size="s"`.

#### 3. Sticky Control Area
*   **Position:** Sticky (`top: 0`), immediately below Header.
*   **Background:** `var(--surface-bg-secondary)`.
*   **Padding:** `var(--spacing-3) var(--spacing-4)`.
*   **Gap:** `var(--spacing-3)` between elements (e.g., Context Switcher & Search).
*   **Components:**
    *   **Search Input:** Height `44px`, `variant="standalone"`.
    *   **Context Switcher:** Compact Variant (Horizontal layout, reduced padding).

#### 4. List Content Area
*   **Background:** `var(--surface-bg-primary)`.
*   **Padding:** `var(--spacing-3) var(--spacing-4)`.
*   **Scroll Behavior:** Vertical scroll, `touch-action: pan-y`.
*   **Safe Area:** Must include `padding-bottom: env(safe-area-inset-bottom)`.

#### 5. List Items (`CheckCard` / `NfcRoomListItem`)
*   **Visual Style:** "Card" appearance (not flat list).
*   **Height:** Min `56px`.
*   **Background:** `var(--surface-bg-secondary)`.
*   **Border:** 1px solid `var(--surface-border-secondary)`.
*   **Radius:** `var(--radius-lg)`.
*   **Gap:** `4px` between items.
*   **Interaction:**
    *   **Hover:** Darker border (`--control-border-tertiary-hover`).
    *   **Active:** Scale down (0.99).

---

### Analysis: Why Tailwind Was Suspected

The suspicion that Tailwind CSS was erroneously involved arose from specific artifacts found in the `ManualCheckSelectorSheet.tsx` code during the debugging process.

**1. Specific Class Syntax**
The code contained class strings that are syntactic signatures of Tailwind CSS, specifically:
*   **`z-[100]`**: The square bracket notation for arbitrary values is unique to Tailwind's JIT compiler. Standard CSS or other utility libraries do not use this syntax.
*   **`bg-black/60`**: The slash notation for opacity modifier is a Tailwind convention.
*   **`inset-0`**: A shorthand utility specific to Tailwind (mapping to top/right/bottom/left: 0).

**2. The "Vaul" Library Context**
The component uses `vaul` (a drawer library). The official documentation and examples for `vaul` are written almost exclusively using Tailwind CSS. It is highly probable that the initial implementation was copy-pasted or adapted from these examples without translating the utility classes into the project's **CSS Module** architecture.

**3. The Failure Mode**
In a CSS Module environment (which hashes class names like `_header_1x9z`), raw string classes like `fixed` or `flex` are treated as plain text. Since no global stylesheet defined `.fixed` or `.flex`, the browser ignored them completely, resulting in an unstyled, invisible `<div>` at the bottom of the DOM—exactly the symptom observed.