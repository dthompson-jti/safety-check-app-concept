// src/main.tsx
// This is the application's entry point.
// NOTE: This file is at the root of /src, so imports from sibling directories
// like /state or /components will start with './'.

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'jotai'
import App from './App.tsx'
import './styles/index.css'

// --- VERSION BOMB ---
// This forces a clear of localStorage if the version doesn't match.
// Useful for clearing out old/incompatible data from previous prototypes.
const APP_VERSION = 'v5'; // Increment this to wipe everyone's data
const STORAGE_VERSION_KEY = 'app_version_marker';

try {
  const currentVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  if (currentVersion !== APP_VERSION) {
    console.warn(`Version mismatch (found ${currentVersion}, expected ${APP_VERSION}). Clearing storage.`);
    localStorage.clear();
    localStorage.setItem(STORAGE_VERSION_KEY, APP_VERSION);
    // Optional: Reload to ensure clean slate if we were already mid-load, 
    // but since this is top-level, we should be fine.
  }
} catch (e) {
  console.error('Failed to check/clear storage version:', e);
}
// --------------------

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>,
)