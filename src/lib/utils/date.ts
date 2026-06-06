import {
  format,
  formatDistance,
  formatRelative,
  parseISO,
  isValid,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';

/**
 * Format date with pattern
 * @example formatDate(new Date(), 'MMM dd, yyyy') // 'Jan 15, 2024'
 */
export function formatDate(date: Date | string, pattern: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, pattern) : '';
}

/**
 * Format time HH:mm
 * @example formatTime(new Date('2024-01-15T14:30:00')) // '14:30'
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, 'HH:mm') : '';
}

/**
 * Format datetime
 * @example formatDateTime(new Date()) // 'Jan 15, 2024 14:30'
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, 'MMM dd, yyyy HH:mm') : '';
}

/**
 * Get relative time string
 * @example getRelativeTime(Date.now() - 3600000) // 'about 1 hour ago'
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? formatDistance(dateObj, new Date(), { addSuffix: true }) : '';
}

/**
 * Parse ISO string to Date
 * @example parseDate('2024-01-15T14:30:00Z')
 */
export function parseDate(dateString: string): Date | null {
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Get date range for current month
 * @returns [start, end]
 */
export function getCurrentMonthRange(): [Date, Date] {
  return [startOfMonth(new Date()), endOfMonth(new Date())];
}

/**
 * Get date range for current year
 * @returns [start, end]
 */
export function getCurrentYearRange(): [Date, Date] {
  return [startOfYear(new Date()), endOfYear(new Date())];
}

/**
 * Add days to date
 * @example addDaysToDate(new Date(), 5)
 */
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) && dateObj < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) && dateObj > new Date();
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return false;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}
