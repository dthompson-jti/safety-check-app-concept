import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

export type Theme = 'system' | 'light' | 'dark';

// The atom holds the user's theme preference.
export const themeAtom = atom<Theme>((() => {
    try {
        const stored = localStorage.getItem('app-theme') as Theme | null;
        if (stored === 'system' || stored === 'light' || stored === 'dark') {
            return stored;
        }
        return 'system'; // Default to system
    } catch {
        return 'system';
    }
})());

export const useTheme = () => {
    const [theme, _setTheme] = useAtom(themeAtom);

    const setTheme = (newTheme: Theme) => {
        _setTheme(newTheme);
    };

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (currentTheme: Theme) => {
            if (currentTheme === 'system') {
                const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (isSystemDark) {
                    root.setAttribute('data-theme', 'dark-c');
                } else {
                    root.removeAttribute('data-theme');
                }
            } else if (currentTheme === 'dark') {
                root.setAttribute('data-theme', 'dark-c');
            } else {
                root.removeAttribute('data-theme');
            }
        };

        applyTheme(theme);

        // System preference listener
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleSystemChange);

        // Persist choice
        try {
            localStorage.setItem('app-theme', theme);
        } catch {
            // Ignore storage errors
        }

        return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }, [theme]);

    return { theme, setTheme };
};
