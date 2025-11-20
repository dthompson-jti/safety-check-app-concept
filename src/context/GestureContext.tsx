import { createContext, useContext } from 'react';
import { MotionValue, useMotionValue } from 'framer-motion';

interface GestureContextType {
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

const GestureContext = createContext<GestureContextType | null>(null);

export const useGestureContext = () => {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error('useGestureContext must be used within a GestureProvider');
  }
  return context;
};

export const GestureProvider = ({ children }: { children: React.ReactNode }) => {
  const filmStripProgress = useMotionValue(0);
  const sideMenuProgress = useMotionValue(0);

  return (
    <GestureContext.Provider value={{ filmStripProgress, sideMenuProgress }}>
      {children}
    </GestureContext.Provider>
  );
};
