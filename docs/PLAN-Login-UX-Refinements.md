# Plan: Login UX & Input Hygiene Refinements

## 1. Problem Statement
The current login form lacks specific attributes required for a polished, high-craft mobile experience. Users report issues with:
- **Case Sensitivity:** Usernames visually appear mixed-case, implying case sensitivity.
- **Keyboard Interference:** Mobile keyboards (especially on Android) aggressively auto-capitalize and auto-correct fields, frustrating entry of non-dictionary usernames (e.g., "bcorbin") and passwords.

## 2. Analysis & Recommendations

To achieve a "native-quality" web input experience, we must manage the browser's assistance features aggressively.

### A. The "Raw Input" Contract
For authentication fields (Username/Password), the goal is to **disable** smart assistants.

| Attribute | Recommended Value | Reasoning |
|:---|:---|:---|
| `autoCapitalize` | `"none"` | Prevents "Dave" vs "dave" ambiguity. Essential for passwords. |
| `autoCorrect` | `"off"` | Prevents changing "bcorbin" to "Bobbin" or "Corbin". |
| `spellCheck` | `false` | Removes distracting red squiggles under usernames. |
| `autoComplete` | `"username"` / `"current-password"` | Enables password managers (1Password, iCloud Keychain). |

### B. Keyboard & Focus Management
Mobile keyboards should facilitate flow between fields.

- **Username Field:** Should show the "Next" key to jump to password.
    - `enterKeyHint="next"`
- **Password Field:** Should show the "Go" / "Log In" key to submit.
    - `enterKeyHint="done"` or `enterKeyHint="go"`

### C. Visual Case Insensitivity
Since appropriate backend lookup matches `findUser` logic (which is already case-insensitive), the generic "Username" field should visually reinforce this by forcing lowercase.

- **CSS:** `.usernameInput { text-transform: lowercase; }`
- **Logic:** While CSS handles the *look*, strictly speaking, `autoCapitalize="none"` handles the *keyboard*. We do not need to forcibly `.toLowerCase()` the state on change if the lookup function already handles it, but doing so provides a 1:1 match between state and display.

## 3. Implementation Plan

### 1. Update Component: `LoginView.tsx`

Refine `<TextInput>` props for both fields.

**Username Field:**
```tsx
<TextInput
  /* ...existing */
  autoCapitalize="none"
  autoCorrect="off"    // [NEW]
  spellCheck={false}   // [NEW]
  autoComplete="username" // [NEW]
  enterKeyHint="next"  // [NEW]
  className={styles.usernameInput} // [NEW] Use CSS Module class
/>
```

**Password Field:**
```tsx
<TextInput
  /* ...existing */
  autoCapitalize="none" // [Req]
  autoCorrect="off"     // [NEW] - Safety against aggressive keyboards
  autoComplete="current-password" // [NEW]
  enterKeyHint="go"     // [NEW]
/>
```

### 2. Update Styles: `LoginView.module.css`

Add the visual transformation for the username.

```css
.usernameInput {
  text-transform: lowercase;
}
```

### 3. Focus Flow (Optional but Recommended)
Ensure hitting "Enter" (Next) in Username explicitly focuses the Password field ref, although standard browser behavior often handles this with `tabIndex` / DOM order. Given `LoginView` structure, it should work naturally, but testing is required.

## 4. Verification

1.  **Android/iOS Keyboard Test:**
    - Focus Username -> Keyboard should NOT show prediction bar (if possible) and should NOT shift to caps.
    - Type "bcorbin" -> Should not correct to "Corbin".
    - Press "Next" (if available) -> Should focus Password.
2.  **Password Field Test:**
    - Focus Password -> Keyboard should be lowercase initially.
3.  **Password Manager Test:**
    - Verify keychain suggestion appears (due to `autoComplete` attributes).
