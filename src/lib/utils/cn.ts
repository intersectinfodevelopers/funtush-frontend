import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and merges conflicting Tailwind CSS classes
 * This utility is essential for component styling with conditional classes
 *
 * @example
 * cn('px-2 py-1', 'px-3') // 'py-1 px-3' (px-3 overrides px-2)
 * cn('text-lg', condition && 'font-bold')
 *
 * @param inputs - Class names, objects, or arrays of class values
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
