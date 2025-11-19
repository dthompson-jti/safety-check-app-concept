// src/components/ActionListItem.tsx
import { ReactNode } from 'react';
import styles from './ActionListItem.module.css';

interface ActionListItemProps {
  /** Primary text label */
  label?: string;
  /** Secondary text label */
  subLabel?: string;
  /** Click handler */
  onClick: () => void;
  /** If true, displays a standard chevron_right on the right side */
  showChevron?: boolean;
  /** Custom icon to display on the right side (replaces chevron) */
  trailingIcon?: string;
  /** Icon to display on the left side (e.g., 'check') */
  leadingIcon?: string;
  /** 
   * If true, reserves fixed width space on the left. 
   * Use this to align text with other items that have leadingIcons.
   */
  indent?: boolean;
  /** 
   * If true, applies selected-state styling (colors/weight) to the leadingIcon.
   * Does not affect the background of the item itself.
   */
  isSelected?: boolean;
  /** Optional custom content to render in the main area instead of label/subLabel */
  children?: ReactNode;
}

/**
 * A flexible list item component used for menus, navigation, and selection lists.
 * Supports leading/trailing icons, text labels, and custom children.
 * Enforces a consistent height and tap target size for touch devices.
 */
export const ActionListItem = ({
  label,
  subLabel,
  onClick,
  showChevron = false,
  trailingIcon,
  leadingIcon,
  indent = false,
  isSelected = false,
  children,
}: ActionListItemProps) => {
  return (
    <button className={styles.item} onClick={onClick}>
      
      {/* Leading Area: Icon or Indentation spacer */}
      {(leadingIcon || indent) && (
        <div className={styles.leadingIconContainer}>
          {leadingIcon && (
            <span 
              className={`material-symbols-rounded ${styles.leadingIcon}`}
              data-selected={isSelected}
            >
              {leadingIcon}
            </span>
          )}
        </div>
      )}

      {/* Content Area: Standard labels or custom children */}
      {children ? (
        <div className={styles.content} style={{ width: '100%' }}>
          {children}
        </div>
      ) : (
        <div className={styles.content}>
          <span className={styles.label}>{label}</span>
          {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
        </div>
      )}
      
      {/* Trailing Area: Chevron or custom icon */}
      {!children && (showChevron || trailingIcon) && (
        <span className={`material-symbols-rounded ${styles.trailingIcon}`}>
          {trailingIcon || 'chevron_right'}
        </span>
      )}
    </button>
  );
};