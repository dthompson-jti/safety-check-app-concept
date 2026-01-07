// src/components/Select.tsx
import React, { useState } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import styles from './Select.module.css';

interface SelectProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  icon?: string;
  disabled?: boolean;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, icon, disabled, ...props }, forwardedRef) => {
    return (
      <RadixSelect.Item
        className="menuItem"
        {...props}
        ref={forwardedRef}
        disabled={disabled}
      >
        <div className="menuCheckmark">
          <RadixSelect.ItemIndicator>
            <span className="material-symbols-rounded">check</span>
          </RadixSelect.ItemIndicator>
          {icon && (
            <span className={`material-symbols-rounded ${styles.selectItemIcon}`}>{icon}</span>
          )}
        </div>
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      </RadixSelect.Item>
    );
  }
);

SelectItem.displayName = 'SelectItem';

export const Select = ({ children, value, onValueChange, placeholder, disabled }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <RadixSelect.Root
      value={value}
      onValueChange={onValueChange}
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        className={styles.selectTrigger}
        aria-label={placeholder}
        data-focused={isOpen}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className={styles.selectIcon}>
          <span className="material-symbols-rounded">expand_more</span>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className="menuPopover"
          position="popper"
          sideOffset={5}
        >
          <RadixSelect.ScrollUpButton className={styles.scrollButton}>
            <span className="material-symbols-rounded">expand_less</span>
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className={styles.selectViewport}>
            {children}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className={styles.scrollButton}>
            <span className="material-symbols-rounded">expand_more</span>
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};