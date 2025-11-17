/// <reference types="vite/client" />

// DEFINITIVE FIX: Explicitly define the ImportMeta interface to include Vite's 
// environment variables. This provides a robust type definition that ensures
// `import.meta.env` is always available to TypeScript.
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  // DEFINITIVE FIX: Replaced `any` with a more specific type to resolve the linter error.
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

// FIX: The final, definitive declaration based on the console log evidence.
// The module has a named export called 'Scanner'.
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