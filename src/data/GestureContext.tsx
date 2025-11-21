// src/data/GestureContext.tsx
import { createContext, useContext } from 'react';
import { MotionValue } from 'framer-motion';

export interface GestureContextType {
    filmStripProgress: MotionValue<number>;
    sideMenuProgress: MotionValue<number>;
}

export const GestureContext = createContext<GestureContextType | null>(null);

export const useGestureContext = (): GestureContextType => {
    const context = useContext(GestureContext);
    if (!context) {
        throw new Error('useGestureContext must be used within a GestureProvider');
    }
    return context;
};