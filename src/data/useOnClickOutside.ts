// src/data/useOnClickOutside.ts
import { useEffect, RefObject } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

/**
 * A hook that triggers a handler when a user clicks outside of a specified element.
 * @param ref A React ref attached to the element to monitor.
 * @param handler The function to call on an outside click.
 */
export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: AnyEvent) => void,
): void {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      const el = ref.current;
      // Do nothing if the click is inside the ref's element or its descendants.
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    // The `useEffect` hook runs *after* the render and browser paint, which means
    // the click event that may have opened the component has already finished its
    // propagation. We can therefore safely attach the listener immediately without
    // race conditions, removing the need for flags or timeouts.
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // The cleanup function removes the listeners to prevent memory leaks.
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Re-attach the listener if the ref or handler changes.
}