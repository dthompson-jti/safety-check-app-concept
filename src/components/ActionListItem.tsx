// src/components/ActionListItem.tsx
import { ReactNode } from 'react';

interface ActionListItemProps {
  /** Primary text */
  label: string;
  /** Secondary text or complex content (like resident list) */
  subLabel?: ReactNode;
  /** Material Symbol name for the left icon */
  leadingIcon?: string;
  /** Custom element for the left side (overrides leadingIcon) */
  leadingElement?: ReactNode;
  /** Material Symbol name for the right icon (defaults to chevron_right if onClick present) */
  trailingIcon?: string;
  /** Custom element for the right side */
  trailingElement?: ReactNode;
  /** Whether the item is currently selected (adds visual cue) */
  isSelected?: boolean;
  /** Disables interaction */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Indent content if no leading icon is present? Default: false */
  indent?: boolean;
  /** Show chevron automatically if onClick is present? Default: true */
  showChevron?: boolean;
}

/**
 * The unified list item component for the application.
 * Uses the `list.css` layer for styling ("Golden Row" pattern).
 */
export const ActionListItem = ({
  label,
  subLabel,
  leadingIcon,
  leadingElement,
  trailingIcon,
  trailingElement,
  isSelected,
  disabled,
  onClick,
  indent = false,
  showChevron = true,
}: ActionListItemProps) => {

  // Logic: Determine Leading Content
  // Priority: Custom Element > Icon > Implicit Checkmark (if selected)
  let renderedLeading = leadingElement;
  if (!renderedLeading && leadingIcon) {
    renderedLeading = (
      <span className="material-symbols-rounded">{leadingIcon}</span>
    );
  } else if (!renderedLeading && isSelected) {
    renderedLeading = (
      <span className="material-symbols-rounded">check</span>
    );
  }

  // Logic: Determine Trailing Content
  // Priority: Custom Element > Icon > Implicit Chevron (if interactive)
  let renderedTrailing = trailingElement;
  if (!renderedTrailing && trailingIcon) {
    renderedTrailing = (
      <span className="material-symbols-rounded">{trailingIcon}</span>
    );
  } else if (!renderedTrailing && onClick && showChevron && !isSelected) {
    renderedTrailing = (
      <span className="material-symbols-rounded">chevron_right</span>
    );
  }

  return (
    <button
      className="list-item-root"
      onClick={onClick}
      disabled={disabled}
      aria-selected={isSelected}
      // CRITICAL: This attribute tells CSS whether to apply left padding to the content
      data-has-leading={!!renderedLeading || indent}
      type="button"
    >
      {(renderedLeading || indent) && (
        <div className="list-item-leading">
          {renderedLeading}
        </div>
      )}

      <div className="list-item-content">
        <div className="list-item-text-group">
          <span className="list-item-label">{label}</span>
          {subLabel && <span className="list-item-sublabel">{subLabel}</span>}
        </div>

        {renderedTrailing && (
          <div className="list-item-trailing">
            {renderedTrailing}
          </div>
        )}
      </div>
    </button>
  );
};