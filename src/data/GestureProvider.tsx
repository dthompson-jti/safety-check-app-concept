// src/data/GestureProvider.tsx
import { useMotionValue } from 'framer-motion';
import { GestureContext } from './GestureContext';

export const GestureProvider = ({ children }: { children: React.ReactNode }) => {
    const filmStripProgress = useMotionValue(0);
    const sideMenuProgress = useMotionValue(0);

    return (
        <GestureContext.Provider value={{ filmStripProgress, sideMenuProgress }}>
            {children}
        </GestureContext.Provider>
    );
};