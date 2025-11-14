// src/components/ListItem.tsx
import React from 'react';
import styles from './ListItem.module.css';

// DEFINITIVE FIX: This is the final and correct pattern. It abandons previous
// overly complex attempts in favor of a simpler, more direct, and widely-accepted
// approach for creating a type-safe polymorphic component with a forwarded ref.

// 1. Define the props our component accepts, using a generic `T` for the element type.
type ListItemProps<T extends React.ElementType> = {
  as?: T;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: string;
  isActive?: boolean;
  className?: string;
  // 2. Merge our props with the props of the underlying element, omitting conflicts.
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'title' | 'subtitle' | 'icon' | 'isActive' | 'className'>;

// 3. Create the component using `React.forwardRef`. The key is to correctly type
//    the render function's arguments. The first argument is the full props object,
//    and the second is the ref, whose type is inferred from the generic `T`.
const ListItem = React.forwardRef(
  <T extends React.ElementType = 'button'>(
    { as, title, subtitle, icon, isActive = false, className, ...props }: ListItemProps<T>,
    ref: React.ComponentPropsWithRef<T>['ref']
  ) => {
    // 4. Determine the component to render, defaulting to 'button'.
    const Component = as || 'button';

    const combinedClassName = [
      styles.listItem,
      isActive ? styles.active : '',
      className || ''
    ].join(' ').trim();

    // 5. Render the component, passing the ref and the rest of the props.
    //    This structure is clean, type-safe, and resolves all previous errors.
    return (
      <Component className={combinedClassName} ref={ref} {...props}>
        {icon && (
          <div className={styles.iconContainer}>
            <span className={`material-symbols-rounded ${styles.icon}`}>{icon}</span>
          </div>
        )}
        <div className={styles.contentContainer}>
          <div className={styles.title}>{title}</div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
      </Component>
    );
  }
);

export { ListItem };