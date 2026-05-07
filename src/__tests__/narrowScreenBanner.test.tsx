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
  it('shows hard guidance below 480px', () => {
    setViewportWidth(400)
    renderBanner('/t/acme/o/hq/map')

    expect(screen.getByRole('status')).toHaveTextContent(
      /rotate to landscape or use a tablet/i,
    )
    expect(screen.getByRole('link', { name: /open roster/i })).toBeInTheDocument()
    // Should not have dismiss button below 480px
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
  })

  it('shows mobile editor mode banner at 480px-1179px', () => {
    setViewportWidth(600)
    renderBanner('/t/acme/o/hq/map')

    expect(screen.getByRole('status')).toHaveTextContent(
      /mobile editor mode enabled/i,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      /full editing works best above \d+px/i,
    )
    expect(screen.getByRole('link', { name: /open roster/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dismiss mobile editor banner/i })).toBeInTheDocument()
  })

  it('does not show banner at 1180px+', () => {
    setViewportWidth(1366)
    renderBanner('/t/acme/o/hq/map')

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('does not render outside map routes', () => {
    setViewportWidth(600)
    renderBanner('/t/acme/o/hq/roster')

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('stays dismissed after closing (mobile editor mode)', () => {
    setViewportWidth(600)
    renderBanner('/t/acme/o/hq/map')

    fireEvent.click(screen.getByRole('button', { name: /dismiss mobile editor banner/i }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(localStorage.getItem('mobileEditorBannerDismissed')).toBe('1')
  })

  it('migrates legacy dismissed state to new key', () => {
    // Set legacy key
    localStorage.setItem('narrowScreenBannerDismissed', '1')
    
    setViewportWidth(600)
    renderBanner('/t/acme/o/hq/map')

    // Banner should be dismissed because of legacy migration
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(localStorage.getItem('mobileEditorBannerDismissed')).toBe('1')
  })

  it('updates when viewport changes', () => {
    setViewportWidth(1366)
    const { rerender } = renderBanner('/t/acme/o/hq/map')

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    // Resize to mobile range
    setViewportWidth(600)
    
    // Re-render to pick up the change
    rerender(
      <MemoryRouter initialEntries={['/t/acme/o/hq/map']}>
        <Routes>
          <Route path="/t/:teamSlug/o/:officeSlug/*" element={<NarrowScreenBanner />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
