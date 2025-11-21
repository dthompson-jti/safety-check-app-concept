// src/data/useVisualViewport.ts
import { useEffect } from 'react';

/**
 * A hook that syncs the application's layout height with the Visual Viewport API.
 * This is critical for mobile web apps to handle virtual keyboards correctly.
 * 
 * It sets a CSS variable `--visual-viewport-height` on the <html> element.
 * 
 * Contract:
 * - Components using full-screen layouts should set `height: var(--visual-viewport-height, 100dvh)`.
 */
export const useVisualViewport = () => {
  useEffect(() => {
    // Feature detection
    if (!window.visualViewport) {
      return;
    }

    const updateViewport = () => {
      // Use requestAnimationFrame to sync with the browser's paint cycle,
      // reducing visual jitter on Android when the keyboard slides up.
      requestAnimationFrame(() => {
        const height = window.visualViewport?.height;
        
        if (height) {
          // Set the height of the visible area
          document.documentElement.style.setProperty('--visual-viewport-height', `${height}px`);
        }
      });
    };

    // Initial set
    updateViewport();

    // Listeners
    // 'resize' fires when the keyboard opens/closes or orientation changes.
    // 'scroll' fires when the user pans the viewport while zoomed or keyboard is open.
    window.visualViewport.addEventListener('resize', updateViewport);
    window.visualViewport.addEventListener('scroll', updateViewport);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('scroll', updateViewport);
      // Clean up to prevent side effects if the component unmounts (though usually this runs globally)
      document.documentElement.style.removeProperty('--visual-viewport-height');
    };
  }, []);
};