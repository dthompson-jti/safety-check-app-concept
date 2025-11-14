// src/components/EmptyStateMessage.tsx
import { ReactNode } from 'react';
import styles from './EmptyStateMessage.module.css';

interface EmptyStateMessageProps {
  icon?: string;
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
  title,
  message,
  action,
}: EmptyStateMessageProps) => {
  return (
    <div className={styles.emptyStateContainer}>
      <span className={`material-symbols-rounded large-feature-icon`}>{icon}</span>
      <h3 className={styles.emptyStateTitle}>{title}</h3>
      {message && <p className={styles.emptyStateMessage}>{message}</p>}
      {action && <div className={styles.actionContainer}>{action}</div>}
    </div>
  );
};