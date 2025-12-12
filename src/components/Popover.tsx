// src/components/Popover.tsx
import React from 'react';
import * as RadixPopover from '@radix-ui/react-popover';

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'default' | 'tooltip';
}

export const Popover = ({ trigger, children, open, onOpenChange, variant = 'default' }: PopoverProps) => {
  const contentClassName = variant === 'tooltip' ? 'popover-content-tooltip' : 'popover-content';

  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className={contentClassName}
          sideOffset={5}
          collisionPadding={8}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};