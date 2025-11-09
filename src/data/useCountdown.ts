import { useState, useEffect, useRef } from 'react';
import { SafetyCheckStatus } from '../types';

const formatTime = (due: Date, now: Date): string => {
  const diffSeconds = (due.getTime() - now.getTime()) / 1000;
  const diffMinutes = Math.abs(diffSeconds) / 60;

  if (diffSeconds < 0) {
    if (diffMinutes >= 60) {
      const hours = diffMinutes / 60;
      // Format to one decimal place, but remove .0 if it's a whole number.
      const formattedHours = parseFloat(hours.toFixed(1)).toString();
      return `Overdue ${formattedHours}h`;
    }
    const absMinutes = Math.floor(diffMinutes);
    if (absMinutes < 1) return 'Overdue';
    return `Overdue ${absMinutes}m`;
  }

  if (diffMinutes >= 60) {
    const hours = diffMinutes / 60;
    const formattedHours = parseFloat(hours.toFixed(1)).toString();
    return `${formattedHours}h`;
  }

  if (diffSeconds < 60) {
    return `${Math.floor(diffSeconds)}s`;
  }
  
  if (diffSeconds < 300) { // Up to 5 minutes, show seconds
    const mins = Math.floor(diffSeconds / 60);
    const secs = Math.floor(diffSeconds % 60);
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  }

  const mins = Math.ceil(diffSeconds / 60);
  return `${mins}m`;
};

/**
 * A high-performance hook that provides a dynamically formatted countdown string.
 * It uses requestAnimationFrame for smooth sub-second updates without causing
 * unnecessary re-renders for sub-minute timers.
 * @param dueTime The target Date object for the countdown.
 * @param status The current business status of the check. The hook will only
 * run its animation loop for actionable statuses.
 * @returns A formatted string representing the time remaining.
 */
export const useCountdown = (dueTime: Date, status: SafetyCheckStatus): string => {
  const [now, setNow] = useState(() => new Date());
  // The ref must be initialized with a value. Using `null` is the idiomatic
  // React pattern for refs that will be assigned a value after the initial render.
  const animationFrameId = useRef<number | null>(null);

  const isActionable = status === 'pending' || status === 'due-soon' || status === 'late';

  useEffect(() => {
    if (!isActionable) {
      return;
    }

    // Use a requestAnimationFrame loop for smooth, high-performance updates
    // that don't trigger excessive React re-renders.
    const animate = () => {
      setNow(new Date());
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    // The cleanup function is critical to prevent memory leaks by stopping
    // the animation loop when the component unmounts.
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActionable]);

  // Return static text for non-actionable states to avoid running the timer.
  switch (status) {
    case 'complete':
    case 'supplemental':
      return '';
    case 'missed':
      return 'Missed';
    default:
      return formatTime(dueTime, now);
  }
};