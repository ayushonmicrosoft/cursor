import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines Tailwind classes safely without collisions.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
