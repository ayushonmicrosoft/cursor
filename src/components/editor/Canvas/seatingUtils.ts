import type { SeatStatus } from '../../../types/seatAssignment'

// Helper functions that are not React components

export function seatStatusVisuals(el: { type: string; status?: SeatStatus }) {
  const status: SeatStatus = el.status || 'unassigned'
  return {
    status,
    opacityMul: status === 'decommissioned' ? 0.4 : 1,
  }
}