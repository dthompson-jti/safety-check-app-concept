// src/components/TextInput.tsx
import React from 'react';

// This component relies on global styles from `src/styles/forms.css`.
// It accepts all standard props for an <input> element.
export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return <input ref={ref} {...props} />;
});