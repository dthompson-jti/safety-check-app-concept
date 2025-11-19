// src/data/useVisualViewport.ts
import { useEffect } from 'react';

/**
 * A hook that listens to the Visual Viewport API to determine the true visible height
 * of the screen, which is essential for handling mobile keyboards.
 * 
 * It sets a CSS custom property `--visual-viewport-height` on the document root.
 */
export const useVisualViewport = () => {
  useEffect(() => {
    const handler = () => {
      if (!window.visualViewport) return;
      
      // We set the variable to the exact height of the visual viewport.
      // This accounts for the on-screen keyboard pushing content up.
      const height = window.visualViewport.height;
      document.documentElement.style.setProperty('--visual-viewport-height', `${height}px`);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handler);
      window.visualViewport.addEventListener('scroll', handler);
      // Initial set
      handler();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handler);
        window.visualViewport.removeEventListener('scroll', handler);
      }
    };
  }, []);
};