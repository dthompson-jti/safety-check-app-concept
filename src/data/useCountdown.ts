// src/data/useCountdown.ts
import { useState, useEffect, useRef } from 'react';
import { SafetyCheckStatus } from '../types';

const formatTime = (due: Date, now: Date): string => {
  const diffSeconds = (due.getTime() - now.getTime()) / 1000;

  // Handle past-due (late) checks
  if (diffSeconds < 0) {
    const absMinutes = Math.floor(Math.abs(diffSeconds) / 60);
    if (absMinutes < 1) return 'Overdue';
    return `Overdue ${absMinutes}m`;
  }

  // Handle imminent checks (< 1 minute) with high precision
  if (diffSeconds < 60) {
    return `${diffSeconds.toFixed(1)}s`;
  }

  // Handle approaching checks (< 5 minutes)
  if (diffSeconds < 300) {
    const mins = Math.floor(diffSeconds / 60);
    const secs = Math.floor(diffSeconds % 60);
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  }

  // Handle upcoming checks (> 5 minutes)
  const mins = Math.ceil(diffSeconds / 60);
  return `${mins}m`;
};

/**
 * A high-performance hook that provides a dynamically formatted countdown string.
 * It uses requestAnimationFrame for smooth sub-second updates without causing
 * unnecessary re-renders.
 * @param dueTime The target Date object for the countdown.
 * @param status The current business status of the check. The hook will only
 * run its animation loop for actionable statuses.
 * @returns A formatted string representing the time remaining.
 */
export const useCountdown = (dueTime: Date, status: SafetyCheckStatus): string => {
  // =======================================================================
  //                       *** THE DEFINITIVE FIX ***
  // The error occurs because useState was called without an initial value.
  // This line provides the necessary initial value, resolving the error.
  // =======================================================================
  const [now, setNow] = useState(() => new Date());
  const animationFrameId = useRef<number>();

  const isActionable = status === 'pending' || status === 'due-soon' || status === 'late';

  useEffect(() => {
    if (!isActionable) {
      return;
    }

    const animate = () => {
      setNow(new Date());
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActionable]);

  // Return static text for non-actionable states
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