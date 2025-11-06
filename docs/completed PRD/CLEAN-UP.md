### CLEANUP-VERIFICATION.md
# Verification Checklist: Removal of Vestigial 'Screen Builder' Code

## Objective
This ticket is to verify that all code related to the legacy "Screen Builder" / "Form Editor" concept has been completely removed from the project. The goal is to simplify the codebase, leaving only the files and dependencies necessary for the functional Safety Check PWA prototype.

## Verification Steps

### 1. File Deletions
Confirm that the following files and any associated `.module.css` or `.d.ts` files have been permanently deleted from the `src` directory.

-   [ ] `src/components/DataBindingModal.tsx`
-   [ ] `src/components/DataBindingPicker.tsx`
-   [ ] `src/components/StaticBindingDisplay.tsx`
-   [ ] `src/components/EditableText.tsx`
-   [ ] `src/components/InlineTextInput.tsx`
-   [ ] `src/components/NameEditorPopover.tsx`
-   [ ] `src/components/ScreenToolbar.tsx`
-   [ ] `src/components/SelectableListItem.tsx`
-   [ ] `src/components/navigator.js`
-   [ ] `src/data/useEditable.ts`
-   [ ] `src/data/navigator.d.ts`
-   [ ] `src/data/generalComponentsMock.ts`

### 2. Code Modifications
Review the following files to ensure all references to the deleted code have been removed.

-   [ ] **`src/types.ts`**: Verify that all "original project" types have been removed. The file should only contain types relevant to the Safety Check PWA (`ListItem`, `Resident`, `SafetyCheckStatus`, `SafetyCheck`). Specifically, ensure these are gone:
    *   `BoundData`
    *   `AppearanceProperties`
    *   `BaseComponent`
    *   `LayoutComponent`
    *   `FormComponent`
    *   `CanvasComponent`
    *   `DraggableComponent`
    *   `ComponentGroup`
    *   `ComponentNode`
    *   `DropdownItem`

-   [ ] **`package.json`**: Review the `dependencies` and `devDependencies` lists. While unlikely, confirm if any packages were solely used by the deleted components and can now be removed.

### 3. Regression Testing (Definition of Done)
After confirming the code and files have been removed, perform a full smoke test of the existing P