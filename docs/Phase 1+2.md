Phase 1: Core Experience & Information Architecture
This phase focuses on foundational enhancements to the primary schedule view, improving usability, information clarity, and user feedback.
1. Expandable Header with Status Overview
Requirement: The existing FloatingHeader will be enhanced to support an expanded state. When active, this state reveals a new, secondary "Status Overview Bar" that visualizes the counts of Late, Due Soon, Due, and Completed checks. This feature is for display only and will not implement filtering. When the counts change, the corresponding pill in the bar must flash to draw attention to the update.
Implementation Spec:
Layout: The FloatingHeader.tsx component will be modified to handle a dynamic height. The new StatusOverviewBar.tsx component will be rendered inside it. When this bar is visible, the total height of the header will increase, pushing the main content view down.
State: A new Jotai atom will control the visibility of the Status Overview Bar. Derived atoms in appDataAtoms.ts will efficiently calculate the counts for each status.
Animation: The StatusOverviewBar will monitor for changes in the count props. When a count updates, a brief, high-craft flash/pulse animation (similar to the card status change animation) will be applied to the specific pill to provide clear visual feedback.
2. In-Place & Haptic Feedback System
Requirement: Replace the primary reliance on success toasts with immediate, in-place visual feedback. Introduce optional haptic feedback for key events.
Implementation Spec:
In-Place Feedback: A new recentlyCompletedCheckIdAtom will be created. When a check is saved, the corresponding CheckCard.tsx will read this atom and display a transient success state (e.g., "Completed" badge with icon) for 2 seconds before the list re-sorts.
Haptic Feedback: A new useHaptics.ts hook will be created to provide standardized vibration patterns. A new hapticsEnabledAtom will make this feature configurable. The setting for this will be located on the main Settings page.
3. Check Card Layout Refinement
Requirement: The layout of the CheckCard component will be polished for better visual consistency.
Implementation Spec:
The time/countdown display will be vertically anchored to the bottom of the card using Flexbox properties in CheckCard.module.css.
The time display's font color for cards in the default "Due" (pending) state will be updated to var(--surface-fg-tertiary) for a more subtle appearance.
4. Mock Data Curation
Requirement: The application's seed data must be curated to use a standardized set of fictional references.
Implementation Spec:
The mockResidents and mockChecks arrays in src/data/appDataAtoms.ts will be modified.
Keep: Aliens, The Expanse, The Witcher, John Wick, Terminator, Dune.
Add: Harry Potter, Star Wars.
Add Names: The provided list of new character names will be added and distributed among the approved themes.
Phase 2: Workflow Enhancements & User Customization
This phase builds upon the refined core experience by adding powerful new workflow actions and user customization options.
1. Header Action Button: Popover Menu
Requirement: The + button located in the FloatingHeader will trigger a popover menu presenting two distinct actions.
Implementation Spec:
The + button in FloatingHeader.tsx will be wrapped in the existing Popover.tsx component.
The popover's content will be an ActionMenu.tsx component configured with two items: "Add Supplemental Check" and "Write NFC Tag".
The terminology "FAB" will be removed from all documentation; this component will be referred to as the "Header Action Button".
2. High-Visibility Offline Banner
Requirement: Implement a top-most application banner to clearly communicate network status. The banner must take up physical space, shifting the FloatingHeader and all other content down, not overlaying it. It must provide clear state information and user actions.
Implementation Spec:
Layout: A new OfflineBanner.tsx component will be created and rendered in AppShell.tsx above the MainLayout. Its presence will programmatically shift the FloatingHeader down.
States & Actions: The banner will be driven by the connectionStatusAtom and will display the following states:
Offline: Shows an "Offline" message, a warning icon, and a "Sync Now" button.
Syncing: Triggered by the "Sync Now" button. Shows a "Syncing..." message, a spinner icon, and a disabled button. This state will resolve to either 'Online' or 'Offline' after a simulated delay.
The developer tools will be updated to allow for triggering all connection states for testing.
3. List/Card View Toggle in Settings
Requirement: Implement a user setting on the main Settings page to switch between the default "Card View" and a more compact "List View" for the schedule.
Implementation Spec:
A new scheduleViewModeAtom ('card' | 'list') will be created.
ScheduleListView.tsx will be refactored to read this atom and conditionally render either the existing CheckCard.tsx or a new, more compact CheckListItem.tsx component.
The UI toggle control for this atom will be added directly to the SettingsOverlay.tsx component as part of its flattened layout.
4. Flattened Settings Page Layout
Requirement: The Settings page will be redesigned to have a flat information architecture, removing all drill-down navigation. All settings will be available on a single, scrollable page organized by clear group headers.
Implementation Spec:
The SettingsOverlay.tsx component will be refactored to remove the slide-in navigation for "Admin Tools". The AdminSettingsView.tsx component will be deprecated, and its contents will be merged directly into SettingsOverlay.tsx.
The page will be structured with group headers as follows:
User Info: Display the current user's name.
View Settings:
List/Card View Toggle
Haptic Feedback Toggle
Admin Tools:
Write NFC Tag
Scan Mode (QR/NFC)
Session:
Log Out button