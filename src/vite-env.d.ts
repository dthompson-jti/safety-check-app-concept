/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:pwa-register/react' {
  import type { RegisterSWOptions } from 'vite-plugin-pwa/types'
  // Simplified type definition based on usage
  export interface RegisterSWHook {
    needRefresh: [boolean, (needRefresh: boolean) => void]
    offlineReady: [boolean, (offlineReady: boolean) => void]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
  export function useRegisterSW(options?: RegisterSWOptions): RegisterSWHook
}