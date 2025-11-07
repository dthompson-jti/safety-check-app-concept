// src/data/useCountdown.ts
import { useState, useEffect, useRef } from 'react';
import { SafetyCheckStatus } from '../types';

const formatTime = (due: Date, now: Date): string => {
  const diffSeconds = (due.getTime() - now.getTime()) / 1000;

  if (diffSeconds < 0) {
    const absMinutes = Math.floor(Math.abs(diffSeconds) / 60);
    if (absMinutes < 1) return 'Overdue';
    return `Overdue ${absMinutes}m`;
  }
  if (diffSeconds < 60) {
    return `${diffSeconds.toFixed(1)}s`;
  }
  if (diffSeconds < 300) {
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