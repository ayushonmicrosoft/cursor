import { create } from 'zustand'
import type { SeatSwapRequest } from '../types/seatSwaps'

interface SeatSwapsState {
  requests: Record<string, SeatSwapRequest>
  approve: (id: string, resolvedBy: string) => void
  deny: (id: string, resolvedBy: string) => void
  cancel: (id: string) => void
  upsert: (request: SeatSwapRequest) => void
  clear: () => void
}

function resolveStatus(
  request: SeatSwapRequest,
  status: SeatSwapRequest['status'],
  resolvedBy: string | null,
): SeatSwapRequest {
  return {
    ...request,
    status,
    resolvedBy,
    resolvedAt: new Date().toISOString(),
  }
}

export const useSeatSwapsStore = create<SeatSwapsState>((set) => ({
  requests: {},

  approve: (id, resolvedBy) =>
    set((state) => {
      const request = state.requests[id]
      if (!request || request.status !== 'pending') return state
      return {
        requests: {
          ...state.requests,
          [id]: resolveStatus(request, 'approved', resolvedBy),
        },
      }
    }),

  deny: (id, resolvedBy) =>
    set((state) => {
      const request = state.requests[id]
      if (!request || request.status !== 'pending') return state
      return {
        requests: {
          ...state.requests,
          [id]: resolveStatus(request, 'denied', resolvedBy),
        },
      }
    }),

  cancel: (id) =>
    set((state) => {
      const request = state.requests[id]
      if (!request || request.status !== 'pending') return state
      return {
        requests: {
          ...state.requests,
          [id]: resolveStatus(request, 'canceled', null),
        },
      }
    }),

  upsert: (request) =>
    set((state) => ({
      requests: {
        ...state.requests,
        [request.id]: request,
      },
    })),

  clear: () => set({ requests: {} }),
}))
