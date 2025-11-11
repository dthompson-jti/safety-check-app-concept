// src/components/TextInput.tsx
import React from 'react';

/**
 * A styled text input that integrates with the application's global form styles.
 * It accepts all standard props for an <input> element and adds a custom
 * prop for managing validation state.
 */
export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    /**
     * If true, applies a `data-invalid` attribute to the input, which is
     * targeted by global CSS in `src/styles/forms.css` to apply an error
     * state appearance (e.g., a red border).
     */
    isInvalid?: boolean;
  }
>(({ isInvalid, ...props }, ref) => {
  return <input ref={ref} {...props} data-invalid={isInvalid} />;
});