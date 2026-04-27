import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { NarrowScreenBanner } from '../components/editor/NarrowScreenBanner'

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

function renderBanner(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="/t/:teamSlug/o/:officeSlug/*" element={<NarrowScreenBanner />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  setViewportWidth(1366)
})

describe('NarrowScreenBanner', () => {
  it('shows mobile inspection guidance on narrow map viewports', () => {
    setViewportWidth(768)
    renderBanner('/t/acme/o/hq/map')

    expect(screen.getByRole('status')).toHaveTextContent(
      'You can inspect sample offices on mobile, but full editing works best above 1180px.',
    )
    expect(screen.getByRole('link', { name: /open roster/i })).toBeInTheDocument()
  })

  it('does not render outside map routes', () => {
    setViewportWidth(768)
    renderBanner('/t/acme/o/hq/roster')

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('stays dismissed after closing', () => {
    setViewportWidth(768)
    renderBanner('/t/acme/o/hq/map')

    fireEvent.click(screen.getByRole('button', { name: /dismiss narrow-screen warning/i }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(localStorage.getItem('narrowScreenBannerDismissed')).toBe('1')
  })
})
