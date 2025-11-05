/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// FIX: A definitive module declaration that matches the robust namespace import strategy.
// This tells TypeScript that we will import an object which contains a QrScanner property.
declare module '@yudiel/react-qr-scanner' {
  import { ComponentType } from 'react';
  
  interface QrScannerProps {
    onDecode: (result: string) => void;
    onError: (error: unknown) => void;
    constraints?: MediaTrackConstraints;
    scanDelay?: number;
  }

  // This describes the shape of the module when using `import * as ...`
  export const QrScanner: ComponentType<QrScannerProps>;
}