// src/data/useUrlSync.ts
import { useEffect } from 'react';
import { useAtom } from 'jotai'; 
import { activeViewAtom, AppView } from './atoms';

/**
 * A custom hook to synchronize the application's active view 
 * with the URL's `view` query parameter.
 */
export const useUrlSync = () => {
  const [view, setView] = useAtom(activeViewAtom);
  
  // Effect 1: Read from URL on initial component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewFromUrl = params.get('view') as AppView;

    if (viewFromUrl && ['dashboard', 'checks', 'history', 'settings'].includes(viewFromUrl)) {
      setView(viewFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Effect 2: Write to URL when the active view changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('view', view);
    
    const newUrl = `${window.location.pathname}?${params}`;
    window.history.replaceState({}, '', newUrl);
  }, [view]);
};