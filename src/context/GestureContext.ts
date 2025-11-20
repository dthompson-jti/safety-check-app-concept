import { createContext, useContext } from 'react';
import { MotionValue } from 'framer-motion';

export interface GestureContextType {
    /**
     * Represents the drag progress between Time (0) and Route (1).
     * 0 = Time View
     * 1 = Route View
     * Values can be between 0 and 1 during drag.
     */
    filmStripProgress: MotionValue<number>;

    /**
     * Represents the drag progress of the Side Menu.
     * 0 = Closed
     * 1 = Open
     */
    sideMenuProgress: MotionValue<number>;
}

export const GestureContext = createContext<GestureContextType | null>(null);

export const useGestureContext = () => {
    const context = useContext(GestureContext);
    if (!context) {
        throw new Error('useGestureContext must be used within a GestureProvider');
    }
    return context;
};
