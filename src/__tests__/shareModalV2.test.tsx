import { beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ShareModal } from '../components/editor/ShareModal'

const { listPerms, setOfficePrivate, upsertPermission, removePermission } = vi.hoisted(() => ({
  listPerms: vi.fn(),
  setOfficePrivate: vi.fn(),
  upsertPermission: vi.fn(),
  removePermission: vi.fn(),
}))
vi.mock('../lib/offices/permissionsRepository', () => ({
  listPermissions: (...a: unknown[]) => listPerms(...a),
  setOfficePrivate: (...a: unknown[]) => setOfficePrivate(...a),
  upsertPermission: (...a: unknown[]) => upsertPermission(...a),
  removePermission: (...a: unknown[]) => removePermission(...a),
}))
vi.mock('../stores/uiStore', () => ({
  useUIStore: (sel: (s: unknown) => unknown) =>
    sel({ shareModalOpen: true, setShareModalOpen: () => {} }),
}))
vi.mock('../stores/projectStore', () => ({
  useProjectStore: (sel: (s: unknown) => unknown) =>
    sel({
      officeId: 'o1',
      currentProject: { id: 'o1', slug: 'hq', isPrivate: false, teamId: 't1' },
      setCurrentProject: () => {},
    }),
}))
vi.mock('../lib/auth/session', () => ({
  useSession: () => ({ status: 'authenticated', user: { id: 'u1', email: 'a@b.c' } }),
}))

beforeEach(() => {
  listPerms.mockReset()
  setOfficePrivate.mockReset()
  upsertPermission.mockReset()
  removePermission.mockReset()
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
})

describe('ShareModal v2', () => {
  it('changes visibility to restricted access', async () => {
    listPerms.mockResolvedValue([])
    setOfficePrivate.mockResolvedValue(undefined)
    render(
      <MemoryRouter initialEntries={['/t/acme/o/hq/map']}>
        <Routes>
          <Route path="/t/:teamSlug/o/:officeSlug/*" element={<ShareModal />} />
        </Routes>
      </MemoryRouter>,
    )
    fireEvent.click(await screen.findByLabelText(/restricted access/i))
    await waitFor(() => expect(setOfficePrivate).toHaveBeenCalledWith('o1', true))
  })

  it('surfaces direct access and legacy public-link sections with copy feedback', async () => {
    listPerms.mockResolvedValue([])
    render(
      <MemoryRouter initialEntries={['/t/acme/o/hq/map']}>
        <Routes>
          <Route path="/t/:teamSlug/o/:officeSlug/*" element={<ShareModal />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/direct access is the primary workflow/i)).toBeInTheDocument()
    expect(screen.getByText(/public read-only links/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /copy office url/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /copied office url/i })).toBeInTheDocument(),
    )
  })
})
