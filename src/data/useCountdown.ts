// src/data/useCountdown.ts
import { useAtomValue } from 'jotai';
import { SafetyCheckStatus } from '../types';
import { fastTickerAtom } from './atoms';

/**
 * Formats the remaining time into a human-readable string.
 */
const formatTime = (due: Date, nowTime: number): string => {
  const diffSeconds = (due.getTime() - nowTime) / 1000;

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
 * 
 * It subscribes to the global `fastTickerAtom` (100ms heartbeat) instead of maintaining
 * its own `requestAnimationFrame` loop. This centralization prevents "React Thrashing"
 * when multiple timers are active, ensuring 60fps scrolling performance.
 * 
 * @param dueTime The target Date object for the countdown.
 * @param status The current business status of the check.
 * @returns A formatted string representing the time remaining.
 */
export const useCountdown = (dueTime: Date, status: SafetyCheckStatus): string => {
  // Subscribe to the global heartbeat
  const nowTime = useAtomValue(fastTickerAtom);

  // Optimization: If the status isn't actionable, we don't calculate time.
  const isActionable = status === 'pending' || status === 'due-soon' || status === 'late';

  if (!isActionable) {
    if (status === 'missed') return 'Missed';
    return ''; // Complete, supplemental, etc.
  }

  return formatTime(dueTime, nowTime);
};