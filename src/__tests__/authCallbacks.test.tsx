import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthVerifyPage } from '../components/auth/AuthVerifyPage'
import { AuthResetPage } from '../components/auth/AuthResetPage'

const { rpcMock, updateUserMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  updateUserMock: vi.fn(),
}))
vi.mock('../lib/supabase', () => ({
  supabase: { rpc: rpcMock, auth: { updateUser: updateUserMock } },
}))

beforeEach(() => {
  rpcMock.mockReset()
  updateUserMock.mockReset()
  sessionStorage.clear()
})

describe('AuthVerifyPage', () => {
  it('navigates to the appropriate destination after verification', async () => {
    sessionStorage.setItem('pending_invite_token', 'tok-123')
    render(
      <MemoryRouter initialEntries={['/auth/verify']}>
        <Routes>
          <Route path="/auth/verify" element={<AuthVerifyPage />} />
          <Route path="/dashboard" element={<div>dashboard</div>} />
          <Route path="/t/:slug" element={<div>team-home</div>} />
        </Routes>
      </MemoryRouter>,
    )
    // AuthVerifyPage navigates away immediately to /dashboard (the default next)
    // We verify that by waiting for the dashboard route to render
    await waitFor(() => {
      expect(screen.getByText('dashboard')).toBeInTheDocument()
    })
  })
})

describe('AuthResetPage', () => {
  it('calls updateUser with new password', async () => {
    updateUserMock.mockResolvedValue({ data: {}, error: null })
    render(
      <MemoryRouter initialEntries={['/auth/reset']}>
        <AuthResetPage />
      </MemoryRouter>,
    )
    // Wave 17A added a confirm-password field, so the label regex now
    // matches two inputs; use the exact labels to disambiguate.
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'newpass!!' } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'newpass!!' } })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))
    await waitFor(() => expect(updateUserMock).toHaveBeenCalledWith({ password: 'newpass!!' }))
  })
})
