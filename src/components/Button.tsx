// src/components/Button.tsx
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'on-solid' | 'destructive';
  size?: 'xs' | 's' | 'm' | 'lg';
  iconOnly?: boolean;
  asChild?: boolean;
  /** Show loading spinner and disable button */
  loading?: boolean;
  /** Text to show when loading (default: children) */
  loadingText?: string;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'm',
      iconOnly = false,
      asChild = false,
      loading = false,
      loadingText,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const combinedClassName = `btn ${className || ''}`;

    // Icon sizes match .material-symbols-rounded in buttons.css
    const spinnerSize = size === 'xs' ? 16 : size === 'lg' ? 24 : 20;

    return (
      <Comp
        className={combinedClassName}
        data-variant={variant}
        data-size={size}
        data-icon-only={iconOnly}
        data-loading={loading}
        disabled={disabled || loading}
        aria-busy={loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size={spinnerSize} />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);