// src/components/LoadingSpinner.tsx
// Material Symbols "progress_activity" converted to SVG (300° arc)
// Uses currentColor for theme adaptability

import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  /** Size in pixels (default: 20) */
  size?: number;
  /** Additional class name */
  className?: string;
}

/**
 * LoadingSpinner - A minimalist spinning arc indicator.
 * Used for action feedback (buttons, transitions) rather than boot/branding.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 20,
  className,
}) => (
  <svg
    className={`${styles.spinner} ${className || ''}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M12 22a9.81 9.81 0 0 1-3.875-.775 10.59 10.59 0 0 1-3.2-2.15 10.591 10.591 0 0 1-2.15-3.2A9.81 9.81 0 0 1 2 12c0-1.383.258-2.675.775-3.875a10.275 10.275 0 0 1 2.15-3.175 10.015 10.015 0 0 1 3.2-2.15A9.546 9.546 0 0 1 12 2c.283 0 .517.1.7.3.2.183.3.417.3.7s-.1.525-.3.725A.948.948 0 0 1 12 4c-2.217 0-4.108.783-5.675 2.35C4.775 7.9 4 9.783 4 12c0 2.217.775 4.108 2.325 5.675C7.892 19.225 9.783 20 12 20c2.217 0 4.1-.775 5.65-2.325C19.217 16.108 20 14.217 20 12a.95.95 0 0 1 .275-.7c.2-.2.442-.3.725-.3s.517.1.7.3c.2.183.3.417.3.7a9.546 9.546 0 0 1-.8 3.875 10.015 10.015 0 0 1-2.15 3.2c-.9.9-1.958 1.617-3.175 2.15-1.2.517-2.492.775-3.875.775Z"
    />
  </svg>
);
