// src/data/useCountdown.ts
import { useAtomValue } from 'jotai';
import { SafetyCheckStatus } from '../types';
import { fastTickerAtom, throttledTickerAtom, slowTickerAtom } from './atoms';

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

  // Rule 1: Under 1 minute (show seconds with one decimal place)
  if (diffSeconds < 60) {
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
 * OPTIMIZATION:
 * - Uses 1fps ticker for items > 5 mins out.
 * - Uses 10fps ticker for items < 5 mins out.
 * - Uses 24fps ticker (via fastTicker) only for critical last-minute items.
 */
export const useCountdown = (dueTime: Date, status: SafetyCheckStatus): string => {
  // UPDATED: Added 'due' to the list of statuses that show a timer
  const isActionable = status === 'early' || status === 'pending' || status === 'due-soon' || status === 'due' || status === 'late';

  // 1. Determine Urgency
  const nowForCalc = Date.now();
  const diffSeconds = (dueTime.getTime() - nowForCalc) / 1000;

  // 2. Select Ticker based on Urgency
  // - Critical (< 60s): Fast Ticker (24fps) for smooth decimals
  // - Urgent (< 5m): Throttled Ticker (10fps)
  // - Normal (> 5m): Slow Ticker (1fps)
  let tickerAtom = slowTickerAtom;

  if (diffSeconds < 60 && diffSeconds > -60) {
    tickerAtom = fastTickerAtom;
  } else if (diffSeconds < 300) {
    tickerAtom = throttledTickerAtom;
  }

  // 3. Subscribe
  const nowTime = useAtomValue(tickerAtom);

  if (!isActionable) {
    if (status === 'missed') return 'Missed';
    return '';
  }

  return formatTime(dueTime, nowTime);
};