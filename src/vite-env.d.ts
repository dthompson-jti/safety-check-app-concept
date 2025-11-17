/// <reference types="vite/client" />

// This interface provides robust type definitions for Vite's environment variables,
// ensuring `import.meta.env` is always correctly typed in TypeScript.
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  // Environment variables can be strings, booleans, or not defined.
  [key: string]: string | boolean | undefined;
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
}


declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key:string]: string };
  export default classes;
}

// Defines the type for the third-party QR scanner component.
declare module '@yudiel/react-qr-scanner' {
  import { ComponentType } from 'react';
  
  interface ScannerProps {
    onDecode: (result: string) => void;
    onError: (error: unknown) => void;
    constraints?: MediaTrackConstraints;
    scanDelay?: number;
  }

  export const Scanner: ComponentType<ScannerProps>;
}