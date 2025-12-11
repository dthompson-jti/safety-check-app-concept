import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

type Theme = 'light' | 'dark-a' | 'dark-b' | 'dark-c';

// The atom holds the user's theme preference.
const themeAtom = atom<Theme>((() => {
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
    const [theme, setTheme] = useAtom(themeAtom);

    useEffect(() => {
        const root = document.documentElement;

        // Apply the theme
        if (theme === 'light') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', theme);
        }

        // Persist choice
        try {
            localStorage.setItem('app-theme', theme);
        } catch (e) {
            // Ignore storage errors
        }
    }, [theme]);

    return { theme, setTheme };
};
