// src/data/useScrollToFocused.ts
import { useEffect } from 'react';

interface UseScrollToFocusedOptions {
  /**
   * The container that should scroll. 
   * Must have `overflow-y: auto` (or scroll) and `position: relative`.
   * 
   * Typed structurally as { current: HTMLElement | null } to accept any 
   * RefObject<HTMLElement> or RefObject<HTMLDivElement> without variance issues.
   */
  containerRef: { current: HTMLElement | null };
  
  /**
   * Optional CSS variable name representing a sticky footer's height.
   * Used to calculate the "Safe Zone" bottom edge.
   * Example: '--form-footer-height'
   */
  footerOffsetVar?: string;
  
  /**
   * Extra padding to add when scrolling the element into view.
   * Defaults to 20px.
   */
  offset?: number;
}

/**
 * A "Guardian" hook that ensures focused input fields are never hidden
 * behind sticky footers or the software keyboard.
 */
export const useScrollToFocused = ({ 
  containerRef, 
  footerOffsetVar, 
  offset = 20 
}: UseScrollToFocusedOptions) => {
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      
      // Ensure the target is actually inside our container
      if (!container.contains(target)) return;

      // Wait a tick for the keyboard to animate/layout to update
      // (Especially important if the viewport is resizing simultaneously)
      requestAnimationFrame(() => {
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        
        // Calculate the effective bottom of the visible container.
        // Start with the container's physical bottom.
        let safeBottom = containerRect.bottom;

        // If a footer offset variable is provided, subtract that height.
        if (footerOffsetVar) {
          const footerHeightStr = getComputedStyle(document.documentElement)
            .getPropertyValue(footerOffsetVar);
          const footerHeight = parseInt(footerHeightStr, 10) || 0;
          safeBottom -= footerHeight;
        }

        // Check if the element is occluded at the bottom
        // We look at the target's bottom edge + offset
        const targetBottomEdge = targetRect.bottom + offset;

        if (targetBottomEdge > safeBottom) {
          // Calculate how much we need to scroll
          const scrollAmount = targetBottomEdge - safeBottom;
          
          // Scroll the container
          container.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
        } else if (targetRect.top < containerRect.top + offset) {
          // Handle top occlusion (less common with keyboards, but good for completeness)
          const scrollAmount = targetRect.top - (containerRect.top + offset);
          container.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
        }
      });
    };

    // We use capture: true to catch the focus event as it bubbles down/up, 
    // ensuring we catch it for any child input.
    container.addEventListener('focusin', handleFocus);

    return () => {
      container.removeEventListener('focusin', handleFocus);
    };
  }, [containerRef, footerOffsetVar, offset]);
};