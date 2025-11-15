// src/components/ActionListItem.tsx
import React from 'react';
import styles from './ActionListItem.module.css';

type ActionListItemProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<'button'>;

export const ActionListItem = React.forwardRef<HTMLButtonElement, ActionListItemProps>(
  ({ children, className, ...props }, ref) => {
    const combinedClassName = [styles.actionListItem, className || ''].join(' ').trim();

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);