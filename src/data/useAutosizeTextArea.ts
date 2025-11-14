// src/data/useAutosizeTextArea.ts
import { useLayoutEffect } from 'react';

// Updates the height of a <textarea> when the value changes.
export const useAutosizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string
) => {
  useLayoutEffect(() => {
    if (textAreaRef) {
      // We need to reset the height momentarily to get the correct scrollHeight for the new text
      textAreaRef.style.height = '0px';
      const scrollHeight = textAreaRef.scrollHeight;

      // We then set the height directly, outside of the render loop
      textAreaRef.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, value]);
};