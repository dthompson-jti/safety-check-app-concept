// src/components/EmptyStateMessage.tsx
import { ReactNode } from 'react';
// REMOVED: Unused 'Button' import.
import styles from './EmptyStateMessage.module.css';

interface EmptyStateMessageProps {
  icon?: string;
  title?: string;
  message?: string;
  action?: ReactNode; // A more flexible prop for custom actions
}

/**
 * A standardized, reusable component for displaying an empty state message.
 * It's designed to be flexible, supporting custom titles, messages, icons, and actions.
 */
export const EmptyStateMessage = ({
  icon = 'search_off',
  title = 'No Results Found',
  message,
  action,
}: EmptyStateMessageProps) => {
  return (
    <div className={styles.container}>
      <span className={`material-symbols-rounded ${styles.icon}`}>{icon}</span>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.actionContainer}>{action}</div>}
    </div>
  );
};

/**
 * A specialized version of EmptyStateMessage for the common "No search results" scenario.
 */
export const NoSearchResults = ({ query }: { query: string }) => {
  return (
    <EmptyStateMessage
      title="No Results Found"
      message={`Your search for "${query}" did not return any results. Please try a different term.`}
    />
  );
};