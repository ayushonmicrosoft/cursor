import { type Action } from '../lib/permissions'

/**
 * Returns whether the current viewer can perform `action`.
 *
 * In the new Admin-only architecture, this is unconditionally true.
 */
export function useCan(action: Action): boolean {
  return true
}
