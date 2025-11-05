/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Add a module declaration for the QR scanner library to resolve the TypeScript error.
declare module '@yudiel/react-qr-scanner';