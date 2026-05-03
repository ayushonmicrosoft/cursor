import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type Konva from 'konva'
import { ExportDialog } from '../components/editor/ExportDialog'
import { useUIStore } from '../stores/uiStore'
import { useProjectStore } from '../stores/projectStore'
import { useToastStore } from '../stores/toastStore'
import { setActiveStage } from '../lib/stageRegistry'
import type { Project } from '../types/project'

// Hoisted mocks so the export libraries never touch the real DOM
// (no jsPDF.save, no download, no canvas rasterising).
const { exportPdfMock, exportPngMock } = vi.hoisted(() => ({
  exportPdfMock: vi.fn(),
  exportPngMock: vi.fn(),
}))
vi.mock('../lib/exportPdf', () => ({ exportPdf: exportPdfMock }))
vi.mock('../lib/exportPng', () => ({ exportPng: exportPngMock }))

function openDialog(projectName = 'my-plan') {
  const project: Project = {
    id: 'p1',
    ownerId: 'u1',
    name: projectName,
    slug: projectName,
    buildingName: null,
    floors: [],
    activeFloorId: '',
    canvasSettings: {
      gridSize: 12,
      scale: 1,
      scaleUnit: 'ft',
      showGrid: true,
      showDimensions: false,
    },
    thumbnailUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  useProjectStore.setState({ currentProject: project })
  useUIStore.setState({ exportDialogOpen: true })
}

function closeDialog() {
  useUIStore.setState({ exportDialogOpen: false })
}

describe('ExportDialog PDF + PNG wiring', () => {
  beforeEach(() => {
    exportPdfMock.mockReset()
    exportPngMock.mockReset()
    setActiveStage(null)
    closeDialog()
    useToastStore.setState({ items: [] })
  })

  it('clicking Export button calls exportPdf with stage + project filename when PDF is selected', async () => {
    const fakeStage = { __brand: 'stage' } as unknown as Konva.Stage
    setActiveStage(fakeStage)
    openDialog('office-plan')
    render(<ExportDialog />)

    const exportButtons = screen.getAllByRole('button', { name: /export/i })
    const exportButton = exportButtons[exportButtons.length - 1]
    fireEvent.click(exportButton)

    await waitFor(() => expect(exportPdfMock).toHaveBeenCalledTimes(1))
    const [stageArg, opts] = exportPdfMock.mock.calls[0]
    expect(stageArg).toBe(fakeStage)
    expect(opts.fileName).toMatch(/office-plan.*\.pdf/)
    expect(useUIStore.getState().exportDialogOpen).toBe(false)
  })

  it('clicking Export button calls exportPng when PNG is selected', async () => {
    const fakeStage = { __brand: 'stage' } as unknown as Konva.Stage
    setActiveStage(fakeStage)
    openDialog('office-plan')
    render(<ExportDialog />)

    fireEvent.click(screen.getByText('PNG Image'))

    const exportButtons = screen.getAllByRole('button', { name: /export/i })
    const exportButton = exportButtons[exportButtons.length - 1]
    fireEvent.click(exportButton)

    await waitFor(() => expect(exportPngMock).toHaveBeenCalledTimes(1))
    const [stageArg, opts] = exportPngMock.mock.calls[0]
    expect(stageArg).toBe(fakeStage)
    expect(opts.fileName).toMatch(/office-plan.*\.png/)
    expect(useUIStore.getState().exportDialogOpen).toBe(false)
  })

  it('displays format selection options', () => {
    openDialog()
    render(<ExportDialog />)

    expect(screen.getByText('PDF Floor Plan')).toBeInTheDocument()
    expect(screen.getByText('PNG Image')).toBeInTheDocument()
    expect(screen.getByText(/csv employee roster/i)).toBeInTheDocument()
    expect(screen.getByText(/json project data/i)).toBeInTheDocument()
  })

  it('allows switching between export formats', () => {
    openDialog()
    render(<ExportDialog />)

    fireEvent.click(screen.getByText('PNG Image'))

    const pngButton = screen.getByText('PNG Image').closest('button')
    expect(pngButton?.className).toContain('border-blue')
  })

  it('shows advanced options toggle', () => {
    openDialog()
    render(<ExportDialog />)

    expect(screen.getByText(/advanced options/i)).toBeInTheDocument()
  })

  it('expands advanced options when clicked', () => {
    openDialog()
    render(<ExportDialog />)

    fireEvent.click(screen.getByText(/advanced options/i))

    expect(screen.getByText(/paper size/i)).toBeInTheDocument()
    expect(screen.getByText(/orientation/i)).toBeInTheDocument()
    expect(screen.getByText(/print quality \(dpi\)/i)).toBeInTheDocument()
  })

  it('shows advanced export controls and progress while exporting', async () => {
    const fakeStage = { __brand: 'stage' } as unknown as Konva.Stage
    setActiveStage(fakeStage)
    openDialog('office-plan')
    render(<ExportDialog />)

    fireEvent.click(screen.getByText(/advanced options/i))
    expect(screen.getByText(/paper size/i)).toBeInTheDocument()
    expect(screen.getByText(/orientation/i)).toBeInTheDocument()
    expect(screen.getByText(/print quality \(dpi\)/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /export pdf floor plan/i }))
    await waitFor(() => expect(exportPdfMock).toHaveBeenCalledTimes(1))
  })
})
