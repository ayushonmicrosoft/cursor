import { describe, it, expect, vi, beforeEach } from 'vitest'
import { currentUserOfficeRole } from '../lib/offices/currentUserOfficeRole'

const { mockResults } = vi.hoisted(() => ({
  mockResults: {
    offices: { data: { team_id: 'team-1' } as unknown, error: null as unknown },
    team_members: { data: { role: 'member' } as unknown, error: null as unknown },
    office_permissions: { data: null as unknown, error: null as unknown },
  },
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: keyof typeof mockResults) => {
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        maybeSingle: vi.fn(() => Promise.resolve(mockResults[table])),
      }
      return chain
    }),
  },
}))

beforeEach(() => {
  mockResults.offices.data = { team_id: 'team-1' }
  mockResults.offices.error = null
  mockResults.team_members.data = { role: 'member' }
  mockResults.team_members.error = null
  mockResults.office_permissions.data = null
  mockResults.office_permissions.error = null
})

describe('currentUserOfficeRole', () => {
  it('treats team admins as office owners even with a lower explicit office role', async () => {
    mockResults.team_members.data = { role: 'admin' }
    mockResults.office_permissions.data = { role: 'viewer' }

    const role = await currentUserOfficeRole('office-1', 'user-1')

    expect(role).toBe('owner')
  })

  it('returns the explicit office_permissions role when one exists', async () => {
    mockResults.office_permissions.data = { role: 'viewer' }

    const role = await currentUserOfficeRole('office-1', 'user-1')

    expect(role).toBe('viewer')
  })

  it('accepts expanded editor roles from office_permissions', async () => {
    mockResults.office_permissions.data = { role: 'space-planner' }

    const role = await currentUserOfficeRole('office-1', 'user-1')

    expect(role).toBe('space-planner')
  })

  it('falls back to editor when no explicit override exists', async () => {
    const role = await currentUserOfficeRole('office-1', 'user-1')

    expect(role).toBe('editor')
  })

  it('returns null on Supabase error', async () => {
    mockResults.offices.error = new Error('boom')

    const role = await currentUserOfficeRole('office-1', 'user-1')

    expect(role).toBeNull()
  })
})
