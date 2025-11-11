// src/data/useCountdown.ts
import { useState, useEffect, useRef } from 'react';
import { SafetyCheckStatus } from '../types';

const formatTime = (due: Date, now: Date): string => {
  const diffSeconds = (due.getTime() - now.getTime()) / 1000;

  // --- Overdue Logic ---
  if (diffSeconds < 0) {
    const totalMinutes = Math.abs(diffSeconds) / 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    if (totalMinutes < 1) return 'Overdue';

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return `Overdue ${parts.join(' ')}`;
  }

  // --- Upcoming Logic ---
  
  // Rule 1: Under 1 minute (show seconds with one decimal place for urgency)
  if (diffSeconds < 60) {
    // Clamp at 0 to prevent showing "-0.0s" before the overdue logic kicks in.
    const seconds = Math.max(0, diffSeconds);
    return `${seconds.toFixed(1)}s`;
  }

  // Rule 2: Under 5 minutes (show minutes and seconds)
  if (diffSeconds < 300) { 
    const mins = Math.floor(diffSeconds / 60);
    const secs = Math.floor(diffSeconds % 60);
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  }

  // Rule 3: Under 1 hour (show minutes only)
  if (diffSeconds < 3600) {
    const mins = Math.ceil(diffSeconds / 60);
    return `${mins}m`;
  }
  
  // Rule 4: Over 1 hour (show hours and minutes)
  const totalMinutes = diffSeconds / 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(' ');
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
  const animationFrameId = useRef<number | null>(null);

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