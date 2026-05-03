import { useState, useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useElementsStore } from '../../stores/elementsStore'
import { useEmployeeStore } from '../../stores/employeeStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { useFloorStore } from '../../stores/floorStore'
import { useToastStore } from '../../stores/toastStore'
import { exportProjectJson } from '../../lib/exportJson'
import { exportEmployeeCSV } from '../../lib/employeeCsv'
import { exportPdf } from '../../lib/exportPdf'
import { exportPng } from '../../lib/exportPng'
import { getActiveStage } from '../../lib/stageRegistry'
import { useCan } from '../../hooks/useCan'
import { redactEmployeeMap } from '../../lib/redactEmployee'
import {
  FileText,
  Image as ImageIcon,
  Table,
  FileJson,
  Settings2,
  ChevronRight,
  Check,
  Layers,
  Monitor,
  Smartphone,
  Printer,
  Download,
} from 'lucide-react'
import { Modal, ModalBody, ModalFooter, Button } from '../ui'

type ExportType = 'pdf' | 'png' | 'csv' | 'json'
type PaperSize = 'a4' | 'a3' | 'letter' | 'legal'
type Orientation = 'landscape' | 'portrait'
type FloorScope = 'active' | 'all'

interface ExportConfig {
  type: ExportType
  label: string
  icon: React.ReactNode
  desc: string
  supportsDpi: boolean
  supportsPaper: boolean
  supportsOrientation: boolean
  supportsFloorScope: boolean
}

const EXPORT_CONFIGS: ExportConfig[] = [
  {
    type: 'pdf',
    label: 'PDF Floor Plan',
    icon: <FileText size={20} />,
    desc: 'Print-ready vector or raster PDF',
    supportsDpi: true,
    supportsPaper: true,
    supportsOrientation: true,
    supportsFloorScope: true,
  },
  {
    type: 'png',
    label: 'PNG Image',
    icon: <ImageIcon size={20} />,
    desc: 'High-resolution raster image',
    supportsDpi: true,
    supportsPaper: false,
    supportsOrientation: false,
    supportsFloorScope: true,
  },
  {
    type: 'csv',
    label: 'CSV Employee Roster',
    icon: <Table size={20} />,
    desc: 'Spreadsheet with seat assignments',
    supportsDpi: false,
    supportsPaper: false,
    supportsOrientation: false,
    supportsFloorScope: false,
  },
  {
    type: 'json',
    label: 'JSON Project Data',
    icon: <FileJson size={20} />,
    desc: 'Full project including floors and employees',
    supportsDpi: false,
    supportsPaper: false,
    supportsOrientation: false,
    supportsFloorScope: false,
  },
]

const PAPER_SIZES: { value: PaperSize; label: string; dims: string }[] = [
  { value: 'a4', label: 'A4', dims: '210 × 297 mm' },
  { value: 'a3', label: 'A3', dims: '297 × 420 mm' },
  { value: 'letter', label: 'Letter', dims: '8.5 × 11 in' },
  { value: 'legal', label: 'Legal', dims: '8.5 × 14 in' },
]

const DPI_OPTIONS: { value: number; label: string; desc: string }[] = [
  { value: 150, label: '150 DPI', desc: 'Fast, draft quality' },
  { value: 300, label: '300 DPI', desc: 'Standard print quality' },
  { value: 600, label: '600 DPI', desc: 'High quality, larger file' },
]

const PIXEL_RATIOS: { value: number; label: string; desc: string }[] = [
  { value: 1, label: '1×', desc: 'Standard resolution' },
  { value: 2, label: '2×', desc: 'Retina/4K displays' },
  { value: 3, label: '3×', desc: 'Maximum detail' },
]

export function ExportDialog() {
  const open = useUIStore((s) => s.exportDialogOpen)
  const setOpen = useUIStore((s) => s.setExportDialogOpen)
  const project = useProjectStore((s) => s.currentProject)
  const elements = useElementsStore((s) => s.elements)
  const rawEmployees = useEmployeeStore((s) => s.employees)
  const settings = useCanvasStore((s) => s.settings)
  const floors = useFloorStore((s) => s.floors)
  const activeFloorId = useFloorStore((s) => s.activeFloorId)
  const canViewPII = useCan('viewPII')
  const pushToast = useToastStore((s) => s.push)
  const exportingFormat = false

  // Selected export type
  const [selectedType, setSelectedType] = useState<ExportType>('pdf')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // PDF/PNG options
  const [paperSize, setPaperSize] = useState<PaperSize>('a4')
  const [orientation, setOrientation] = useState<Orientation>('landscape')
  const [dpi, setDpi] = useState<number>(300)
  const [pixelRatio, setPixelRatio] = useState<number>(2)
  const [floorScope, setFloorScope] = useState<FloorScope>('active')

  // Reset options when dialog opens
  const close = () => {
    if (exportingFormat) return
    setOpen(false)
    setShowAdvanced(false)
  }

  const activeConfig = EXPORT_CONFIGS.find((c) => c.type === selectedType)!
  const projectName = project?.name || 'floorplan'
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !exportingFormat) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null

  const employees = canViewPII ? rawEmployees : redactEmployeeMap(rawEmployees)
  const activeFloor = floors.find((f) => f.id === activeFloorId)

  const handleExport = () => {
    switch (selectedType) {
      case 'json':
        handleExportJSON()
        break
      case 'csv':
        handleExportCSV()
        break
      case 'pdf':
        handleExportCanvasPdf()
        break
      case 'png':
        handleExportPng()
        break
    }
  }

  const handleExportJSON = () => {
    const scopedFloors =
      floorScope === 'active' && activeFloor ? [activeFloor] : floors
    exportProjectJson(
      projectName,
      settings,
      elements,
      employees,
      scopedFloors,
    )
    close()
  }

  const handleExportCSV = () => {
    const floorMap: Record<string, string> = {}
    for (const f of floors) {
      floorMap[f.id] = f.name
    }
    const employeeList = Object.values(employees).map((e) => ({
      name: e.name,
      email: e.email,
      department: e.department || '',
      team: e.team || '',
      title: e.title || '',
      floor: e.floorId ? floorMap[e.floorId] || '' : '',
      desk: e.seatId || '',
      manager: e.managerId ? employees[e.managerId]?.name || '' : '',
      type: e.employmentType,
      office_days: e.officeDays.join(', '),
      tags: e.tags.join(', '),
    }))
    const csv = exportEmployeeCSV(employeeList)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName}-employees.csv`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const handleExportCanvasPdf = () => {
    const stage = getActiveStage()
    if (!stage) {
      pushToast({
        tone: 'error',
        title: 'Export failed',
        body: 'Open a floor plan to export. The canvas is not loaded.',
      })
      return
    }

    try {
      const opts: {
        paperSize?: 'a4' | 'a3' | 'letter'
        orientation?: 'portrait' | 'landscape'
        dpi?: 150 | 300
        fileName?: string
        title?: string
      } = {
        paperSize: paperSize === 'legal' ? 'letter' : paperSize,
        orientation,
        dpi: (dpi === 600 ? 300 : dpi) as 150 | 300,
        fileName:
          floorScope === 'all'
            ? `${projectName}-all-floors.pdf`
            : `${projectName}-${activeFloor?.name || 'floor'}.pdf`,
        title: project?.name,
      }
      exportPdf(stage, opts)
      close()
    } catch (err) {
      console.error('PDF export failed', err)
      pushToast({
        tone: 'error',
        title: 'Export failed',
        body: 'Could not generate the PDF. Try lower DPI or fewer floors.',
      })
    }
  }

  const handleExportPng = () => {
    const stage = getActiveStage()
    if (!stage) {
      pushToast({
        tone: 'error',
        title: 'Export failed',
        body: 'Open a floor plan to export. The canvas is not loaded.',
      })
      return
    }

    try {
      const opts = {
        pixelRatio,
        fileName:
          floorScope === 'all'
            ? `${projectName}-all-floors.png`
            : `${projectName}-${activeFloor?.name || 'floor'}.png`,
      }
      exportPng(stage, opts)
      close()
    } catch (err) {
      console.error('PNG export failed', err)
      pushToast({
        tone: 'error',
        title: 'Export failed',
        body: 'Could not generate the PNG.',
      })
    }
  }

  const canExport = () => {
    if (selectedType === 'json' || selectedType === 'csv') return true
    // PDF/PNG need the canvas
    return !!getActiveStage()
  }

  return (
    <Modal open={open} onClose={close} title="Export" size="md">
      <ModalBody>
        <div className="space-y-4">
          {/* Quick format selection */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EXPORT_CONFIGS.map((config) => (
              <button
                key={config.type}
                onClick={() => setSelectedType(config.type)}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                  selectedType === config.type
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:border-blue-400 dark:bg-blue-900/20 dark:ring-blue-400'
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50'
                }`}
              >
                <div
                  className={`${selectedType === config.type ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {config.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-medium ${selectedType === config.type ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}
                  >
                    {config.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {config.desc}
                  </div>
                </div>
                {selectedType === config.type && (
                  <Check
                    size={16}
                    className="flex-shrink-0 text-blue-600 dark:text-blue-400"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Advanced options toggle */}
          {(activeConfig.supportsDpi ||
            activeConfig.supportsPaper ||
            activeConfig.supportsOrientation ||
            activeConfig.supportsFloorScope) && (
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <Settings2 size={16} />
              <span>Advanced options</span>
              <ChevronRight
                size={16}
                className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              />
            </button>
          )}

          {/* Advanced options panel */}
          {showAdvanced && (
            <div className="space-y-4 border-t border-gray-200 pt-2 dark:border-gray-700">
              {/* Floor Scope */}
              {activeConfig.supportsFloorScope && floors.length > 1 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Floor scope
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFloorScope('active')}
                      className={`flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        floorScope === 'active'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Layers size={16} />
                      <span>Active floor</span>
                      {activeFloor && (
                        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                          {activeFloor.name}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFloorScope('all')}
                      className={`flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        floorScope === 'all'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Layers size={16} />
                      <span>All floors ({floors.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Paper size & Orientation (PDF only) */}
              {activeConfig.supportsPaper && (
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Paper size
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {PAPER_SIZES.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setPaperSize(size.value)}
                        className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                          paperSize === size.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="font-medium">{size.label}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">
                          {size.dims}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeConfig.supportsOrientation && (
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Orientation
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOrientation('landscape')}
                      className={`flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        orientation === 'landscape'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Monitor size={16} />
                      Landscape
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('portrait')}
                      className={`flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        orientation === 'portrait'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Smartphone size={16} />
                      Portrait
                    </button>
                  </div>
                </div>
              )}

              {/* DPI / Pixel Ratio */}
              {activeConfig.supportsDpi && (
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    {selectedType === 'pdf'
                      ? 'Print quality (DPI)'
                      : 'Image resolution'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedType === 'pdf'
                      ? DPI_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setDpi(opt.value)}
                            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                              dpi === opt.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="font-medium">{opt.label}</div>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500">
                              {opt.desc}
                            </div>
                          </button>
                        ))
                      : PIXEL_RATIOS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPixelRatio(opt.value)}
                            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                              pixelRatio === opt.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="font-medium">{opt.label}</div>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500">
                              {opt.desc}
                            </div>
                          </button>
                        ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export preview hint */}
          <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
            {selectedType === 'pdf' && (
              <Printer size={14} className="mt-0.5 flex-shrink-0" />
            )}
            {selectedType === 'png' && (
              <ImageIcon size={14} className="mt-0.5 flex-shrink-0" />
            )}
            {selectedType === 'csv' && (
              <Table size={14} className="mt-0.5 flex-shrink-0" />
            )}
            {selectedType === 'json' && (
              <FileJson size={14} className="mt-0.5 flex-shrink-0" />
            )}
            <span>
              {selectedType === 'pdf' &&
                `Exporting ${floorScope === 'all' ? `all ${floors.length} floors` : activeFloor?.name || 'current floor'} at ${dpi} DPI (${paperSize.toUpperCase()} ${orientation}).`}
              {selectedType === 'png' &&
                `Exporting ${floorScope === 'all' ? `all ${floors.length} floors` : activeFloor?.name || 'current floor'} at ${pixelRatio}× resolution.`}
              {selectedType === 'csv' &&
                `Exporting ${Object.keys(employees).length} employees${canViewPII ? '' : ' (redacted, no PII)'}.`}
              {selectedType === 'json' &&
                `Exporting full project with ${Object.keys(elements).length} elements and ${Object.keys(employees).length} employees.`}
            </span>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={close}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          disabled={!canExport()}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Export {activeConfig.label}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ExportDialog
