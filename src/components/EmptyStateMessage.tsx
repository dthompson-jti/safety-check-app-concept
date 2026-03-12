// src/components/EmptyStateMessage.tsx
import { ReactNode } from 'react';
import styles from './EmptyStateMessage.module.css';

interface EmptyStateMessageProps {
  icon?: string;
  iconFilled?: boolean;
  titleTone?: 'primary' | 'quaternary';
  title: ReactNode;
  message?: ReactNode;
  action?: ReactNode;
}

/**
 * A standardized, reusable component for displaying an empty state message.
 * It's designed to be flexible, supporting custom titles, messages, icons, and actions.
 * DEFINITIVE FIX: The deprecated `NoSearchResults` component has been fully removed.
 * This is now the single source of truth for all empty states.
 */
export const EmptyStateMessage = ({
  icon = 'search_off',
  iconFilled = true,
  titleTone = 'primary',
  title,
  message,
  action,
}: EmptyStateMessageProps) => {
  const iconClassName = iconFilled
    ? 'material-symbols-rounded large-feature-icon'
    : `material-symbols-rounded ${styles.placeholderIcon}`;
  const titleClassName = titleTone === 'quaternary'
    ? `${styles.emptyStateTitle} ${styles.emptyStateTitleQuaternary}`
    : `${styles.emptyStateTitle} ${styles.emptyStateTitlePrimary}`;

  return (
    <div className={styles.emptyStateContainer}>
      <span className={iconClassName}>{icon}</span>
      <h3 className={titleClassName}>{title}</h3>
      {message && <p className={styles.emptyStateMessage}>{message}</p>}
      {action && <div className={styles.actionContainer}>{action}</div>}
    </div>
  );
};
