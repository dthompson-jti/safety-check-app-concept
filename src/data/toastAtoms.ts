// src/data/toastAtoms.ts
import { atom } from 'jotai';
import { nanoid } from 'nanoid';

export type ToastVariant = 'neutral' | 'success' | 'alert' | 'info' | 'warning';

export interface Toast {
  id: string;
  stableId?: string; // Optional ID for aggregation/deduplication
  timestamp: number; // Used to reset timer on updates
  message: string;
  icon: string;
  variant: ToastVariant;
  // New features for PWA Update
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

export const toastsAtom = atom<Toast[]>([]);

export const addToastAtom = atom(
  null,
  (get, set, {
    message,
    icon,
    variant = 'neutral',
    stableId,
    action,
    persistent
  }: {
    message: string;
    icon: string;
    variant?: ToastVariant;
    stableId?: string;
    action?: { label: string; onClick: () => void };
    persistent?: boolean;
  }) => {
    const currentToasts = get(toastsAtom);
    const now = Date.now();

    // Strategy 1: Stable ID Aggregation
    // If a stableId is provided, we look for an existing toast with that ID.
    // If found, we update it in place (message, icon, variant, timestamp).
    // This allows the UI to update the text/timer without unmounting the component.
    if (stableId) {
      const existingIndex = currentToasts.findIndex(t => t.stableId === stableId);
      if (existingIndex !== -1) {
        const updatedToasts = [...currentToasts];
        updatedToasts[existingIndex] = {
          ...updatedToasts[existingIndex],
          message,
          icon,
          variant,
          action,      // Update action if provided
          persistent,  // Update persistence if provided
          timestamp: now // Reset timer
        };
        set(toastsAtom, updatedToasts);
        return;
      }
    }

    // Strategy 2: Strict Mode Deduplication (Legacy)
    // Prevents double-invocation effects in React 18 Strict Mode from showing duplicates.
    // Only applies if no stableId was provided.
    const newToast: Toast = {
      id: nanoid(),
      stableId,
      timestamp: now,
      message,
      icon,
      variant,
      action,
      persistent
    };

    if (currentToasts.length > 0 && currentToasts[currentToasts.length - 1].message === message && !stableId) {
      const updatedToasts = [...currentToasts.slice(0, -1), newToast];
      set(toastsAtom, updatedToasts);
    } else {
      set(toastsAtom, [...currentToasts, newToast]);
    }
  }
);

// This atom allows a toast to remove itself from the global state when it closes.
export const removeToastAtom = atom(
  null,
  (_get, set, toastId: string) => {
    set(toastsAtom, (currentToasts) =>
      currentToasts.filter((t) => t.id !== toastId)
    );
  }
);