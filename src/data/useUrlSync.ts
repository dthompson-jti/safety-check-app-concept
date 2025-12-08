// src/data/useUrlSync.ts
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { appViewAtom, AppView } from './atoms';

// DEFINITIVE FIX: A type guard to safely check if a string is a valid AppView.
const isAppView = (view: string | null): view is AppView => {
  if (!view) return false;
  return ['sideMenu', 'dashboardTime'].includes(view);
}

/**
 * A custom hook to synchronize the application's active view
 * with the URL's `view` query parameter.
 */
export const useUrlSync = () => {
  const [view, setView] = useAtom(appViewAtom);

  // Effect 1: Read from URL on initial component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewFromUrl = params.get('view');

    if (isAppView(viewFromUrl)) {
      setView(viewFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 2: Write to URL when the active view changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('view', view);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [view]);
};