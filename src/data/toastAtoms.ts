// src/data/toastAtoms.ts
import { atom } from 'jotai';
import { nanoid } from 'nanoid';

export interface Toast {
  id: string;
  message: string;
  icon: string;
}

export const toastsAtom = atom<Toast[]>([]);

export const addToastAtom = atom(
  null,
  (get, set, { message, icon }: { message: string; icon: string }) => {
    const currentToasts = get(toastsAtom);
    const newToast = { id: nanoid(), message, icon };

    // FIX: This logic specifically handles the double-invocation of effects in React 18's
    // Strict Mode (used in development). If the exact same toast message is sent twice
    // in rapid succession, we replace the first instance with the second. Because the
    // `id` (and therefore the React `key`) changes, the toast's entry animation and
    // timer are correctly re-triggered without showing a duplicate toast.
    if (currentToasts.length > 0 && currentToasts[currentToasts.length - 1].message === message) {
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
  (get, set, toastId: string) => {
    set(toastsAtom, (currentToasts) =>
      currentToasts.filter((t) => t.id !== toastId)
    );
  }
);