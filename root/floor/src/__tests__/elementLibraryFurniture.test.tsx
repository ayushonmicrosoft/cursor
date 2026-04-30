import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import {
  ElementLibrary,
  buildLibraryElement,
  type LibraryItem,
} from '../components/editor/LeftSidebar/ElementLibrary'
import { useLibraryCollapse } from '../hooks/useLibraryCollapse'
import { useLibraryFavorites } from '../hooks/useLibraryFavorites'
import { useRecentLibraryItems } from '../hooks/useRecentLibraryItems'

// The library hides itself behind a view-only placard for non-editors.
// Tests don't need a real permission system to pass, so stub `useCan` to
// always return true — we're just checking that the new Furniture section
// + its four tiles render.
vi.mock('../hooks/useCan', () => ({
  useCan: () => true,
}))

describe('ElementLibrary — Furniture section', () => {
  beforeEach(() => {
    // Expand every category by default so the new Furniture section's
    // tiles render without clicking a chevron first.
    useLibraryCollapse.setState({
      collapsed: {
        Tables: false,
        Desks: false,
        Rooms: false,
        Seating: false,
        Structure: false,
        Facilities: false,
        Furniture: false,
        'Premium Props': false,
        Other: false,
      },
    })
    useLibraryFavorites.setState({ favorites: new Set<string>() })
    useRecentLibraryItems.setState({ recents: [] })
  })

  it('renders a Furniture section heading', () => {
    render(<ElementLibrary />)
    // The section title is a button (chevron toggle) in the sidebar.
    expect(screen.getByRole('button', { name: /Furniture/i })).toBeInTheDocument()
  })

  it('renders Sofa, Plant, Printer, and Whiteboard tiles', () => {
    render(<ElementLibrary />)
    // Tiles carry their label as plain text inside the draggable wrapper.
    // Use getAllByText to tolerate duplicates (e.g. the existing decor/whiteboard)
    // and assert the new ones exist.
    expect(screen.getByText('Sofa')).toBeInTheDocument()
    expect(screen.getByText('Plant')).toBeInTheDocument()
    expect(screen.getByText('Printer')).toBeInTheDocument()
    // Whiteboard label may appear twice (the legacy decor/whiteboard tile
    // still exists under Facilities). The new Furniture-section tile is
    // enough; assert at least one.
    expect(screen.getAllByText('Whiteboard').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the Premium Props section for higher-fidelity office details', () => {
    render(<ElementLibrary />)
    const heading = screen.getByRole('button', { name: /Premium Props/i })
    const section = heading.closest('div.mb-3') as HTMLElement | null
    expect(section).not.toBeNull()
    const scope = within(section!)
    expect(scope.getByText('Monitor')).toBeInTheDocument()
    expect(scope.getByText('Task Lamp')).toBeInTheDocument()
    expect(scope.getByText('Credenza')).toBeInTheDocument()
    expect(scope.getByText('Bookshelf')).toBeInTheDocument()
    expect(scope.getByText('Area Rug')).toBeInTheDocument()
  })

  it('persists export-safe asset metadata on placed premium props', () => {
    const item: LibraryItem = {
      type: 'monitor',
      label: 'Monitor',
      category: 'Premium Props',
      catalogId: 'built-in/monitor',
      qualityTier: 'premium-ready',
      tags: ['screen', 'desk'],
      materialHint: 'black glass + metal stand',
      assetSource: 'glb-ready',
    }

    const element = buildLibraryElement(item, 10, 20, 3)
    expect(element.assetMetadata).toMatchObject({
      catalogId: 'built-in/monitor',
      qualityTier: 'premium-ready',
      assetSource: 'glb-ready',
      materialHint: 'black glass + metal stand',
      exportSafe: true,
      license: 'built-in',
    })
    expect(element.assetMetadata?.tags).toEqual(['screen', 'desk'])
  })

  it('the four new tiles are grouped under the Furniture section', () => {
    render(<ElementLibrary />)
    const heading = screen.getByRole('button', { name: /Furniture/i })
    // The section container wraps both the heading button and the grid of
    // tiles; walk up to the wrapping <div class="mb-3"> that contains both.
    const section = heading.closest('div.mb-3') as HTMLElement | null
    expect(section).not.toBeNull()
    const scope = within(section!)
    expect(scope.getByText('Sofa')).toBeInTheDocument()
    expect(scope.getByText('Plant')).toBeInTheDocument()
    expect(scope.getByText('Printer')).toBeInTheDocument()
    expect(scope.getByText('Whiteboard')).toBeInTheDocument()
  })
})
