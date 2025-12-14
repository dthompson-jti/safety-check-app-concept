import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

type Theme = 'light' | 'dark-a' | 'dark-b' | 'dark-c';

// The atom holds the user's theme preference.
export const themeAtom = atom<Theme>((() => {
    try {
        const stored = localStorage.getItem('app-theme') as Theme | null;
        if (stored === 'light' || stored === 'dark-a' || stored === 'dark-b' || stored === 'dark-c') {
            return stored;
        }
        return 'light'; // Default to light
    } catch {
        return 'light';
    }
})());

export const useTheme = () => {
    const [theme, _setTheme] = useAtom(themeAtom);

    const setTheme = (newTheme: Theme) => {
        console.log(`[useTheme] setTheme called: ${theme} -> ${newTheme}`);
        _setTheme(newTheme);
    };

    useEffect(() => {
        const root = document.documentElement;

        console.log(`[useTheme] Applying theme: ${theme}`);
        // Apply the theme
        if (theme === 'light') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', theme);
        }

        // Persist choice
        try {
            localStorage.setItem('app-theme', theme);
            console.log(`[useTheme] Persisted theme to localStorage: ${theme}`);
        } catch {
            // Ignore storage errors
        }
    }, [theme]);

    return { theme, setTheme };
};
