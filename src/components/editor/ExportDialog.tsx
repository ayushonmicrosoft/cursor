import { useEffect, useMemo, useState } from 'react'
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
import { Check, FileJson, FileText, Image as ImageIcon, Loader2, Table, X } from 'lucide-react'
import type Konva from 'konva'

type ExportFormat = 'png' | 'pdf' | 'svg'

const formatOptions: Array<{
  id: ExportFormat
  label: string
  description: string
  thumbnail: string
}> = [
  { id: 'png', label: 'PNG', description: 'High-resolution raster image', thumbnail: 'bg-gradient-to-br from-sky-100 via-white to-blue-200 dark:from-sky-950 dark:via-gray-900 dark:to-blue-900' },
  { id: 'pdf', label: 'PDF', description: 'Print-ready A4 landscape', thumbnail: 'bg-gradient-to-br from-red-100 via-white to-orange-100 dark:from-red-950 dark:via-gray-900 dark:to-orange-950' },
  { id: 'svg', label: 'SVG', description: 'Scalable wrapper for the canvas', thumbnail: 'bg-gradient-to-br from-emerald-100 via-white to-teal-100 dark:from-emerald-950 dark:via-gray-900 dark:to-teal-950' },
]

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = fileName
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function exportSvg(stage: Konva.Stage, options: {
  fileName: string
  pixelRatio: number
  backgroundColor: string
  includeDimensions: boolean
  title?: string
}) {
  const width = Math.max(1, Math.round(stage.width()))
  const height = Math.max(1, Math.round(stage.height()))
  const image = stage.toDataURL({ pixelRatio: options.pixelRatio })
  const label = options.title ? escapeSvgText(options.title) : 'OandOcraft export'
  const dimensions = options.includeDimensions
    ? `<text x="16" y="${height - 16}" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="12">${width} × ${height}px · ${options.pixelRatio}x scale</text>`
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}"><rect width="100%" height="100%" fill="${escapeSvgText(options.backgroundColor)}"/><image href="${image}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>${dimensions}</svg>`
  downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), options.fileName)
}

export function ExportDialog() {
  const open = useUIStore((s) => s.exportDialogOpen)
  const setOpen = useUIStore((s) => s.setExportDialogOpen)
  const project = useProjectStore((s) => s.currentProject)
  const elements = useElementsStore((s) => s.elements)
  const rawEmployees = useEmployeeStore((s) => s.employees)
  const settings = useCanvasStore((s) => s.settings)
  const floors = useFloorStore((s) => s.floors)
  const canViewPII = useCan('viewPII')
  const employees = canViewPII ? rawEmployees : redactEmployeeMap(rawEmployees)
  const pushToast = useToastStore((s) => s.push)
  const [format, setFormat] = useState<ExportFormat>('png')
  const [includeDimensions, setIncludeDimensions] = useState(settings.showDimensions ?? false)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [scaleFactor, setScaleFactor] = useState(2)
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)

  const close = () => {
    if (exportingFormat) return
    setOpen(false)
  }

  const projectName = project?.name || 'floorplan'
  const selectedFormat = useMemo(
    () => formatOptions.find((option) => option.id === format) ?? formatOptions[0],
    [format],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !exportingFormat) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, exportingFormat, setOpen])

  if (!open) return null

  const handleExportJSON = () => {
    exportProjectJson(projectName, settings, elements, employees, floors)
    setOpen(false)
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
      floor: e.floorId ? (floorMap[e.floorId] || '') : '',
      desk: e.seatId || '',
      manager: e.managerId ? (employees[e.managerId]?.name || '') : '',
      type: e.employmentType,
      office_days: e.officeDays.join(', '),
      tags: e.tags.join(', '),
    }))
    const csv = exportEmployeeCSV(employeeList)
    downloadBlob(new Blob([csv], { type: 'text/csv' }), `${projectName}-employees.csv`)
    setOpen(false)
  }

  const handleCanvasExport = () => {
    const stage = getActiveStage()
    if (!stage) {
      pushToast({
        tone: 'error',
        title: 'Export failed',
        body: 'Open a floor plan to export. The canvas isn’t loaded right now.',
      })
      return
    }

    const pixelRatio = Math.max(0.5, Math.min(6, scaleFactor || 1))
    setExportingFormat(format)
    window.setTimeout(() => {
      try {
        if (format === 'pdf') {
          exportPdf(stage, {
            paperSize: 'a4',
            orientation: 'landscape',
            dpi: pixelRatio >= 3 ? 300 : 150,
            fileName: `${projectName}.pdf`,
            title: includeDimensions ? project?.name : undefined,
          })
        } else if (format === 'svg') {
          exportSvg(stage, {
            fileName: `${projectName}.svg`,
            pixelRatio,
            backgroundColor,
            includeDimensions,
            title: project?.name,
          })
        } else {
          exportPng(stage, { pixelRatio, fileName: `${projectName}.png` })
        }
        setOpen(false)
      } catch (err) {
        console.error(`${format.toUpperCase()} export failed`, err)
        pushToast({
          tone: 'error',
          title: 'Export failed',
          body: `Could not generate the ${format.toUpperCase()}.`,
        })
      } finally {
        setExportingFormat(null)
      }
    }, 0)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4 dark:bg-black/60"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
        className="flex h-full w-full flex-col bg-white shadow-2xl outline-none sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-xl dark:bg-gray-900"
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-800">
          <div>
            <h2 id="export-dialog-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Export
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose a canvas format or download project data.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={!!exportingFormat}
            className="inline-flex items-center justify-center rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Close export dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <section aria-labelledby="export-format-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 id="export-format-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Format
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">{selectedFormat.description}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-3">
              {formatOptions.map((option) => {
                const active = option.id === format
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormat(option.id)}
                    className={`rounded-xl border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50'}`}
                    aria-pressed={active}
                  >
                    <div className={`relative mb-2 h-20 overflow-hidden rounded-lg border border-black/5 ${option.thumbnail}`}>
                      <div className="absolute inset-x-3 top-3 h-2 rounded bg-white/80 dark:bg-white/20" />
                      <div className="absolute bottom-3 left-3 h-8 w-12 rounded border border-white/80 bg-white/70 dark:border-white/20 dark:bg-white/10" />
                      <div className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-500 dark:text-gray-300">
                        {option.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{option.label}</span>
                      {active && <Check size={14} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="mt-5 rounded-xl border border-gray-200 p-4 dark:border-gray-800" aria-labelledby="advanced-export-heading">
            <h3 id="advanced-export-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Advanced options
            </h3>
            <div className="mt-4 grid gap-4 min-[480px]:grid-cols-3">
              <label className="flex items-start gap-3 min-[480px]:col-span-3">
                <input
                  type="checkbox"
                  checked={includeDimensions}
                  onChange={(event) => setIncludeDimensions(event.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">Include dimensions</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Adds title or dimension metadata where the selected format supports it.</span>
                </span>
              </label>

              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">
                Background
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(event) => setBackgroundColor(event.target.value)}
                  className="mt-2 h-10 w-full rounded border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800"
                  aria-label="Background color"
                />
              </label>

              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">
                Scale factor
                <input
                  type="number"
                  min={0.5}
                  max={6}
                  step={0.5}
                  value={scaleFactor}
                  onChange={(event) => setScaleFactor(Number(event.target.value))}
                  className="mt-2 h-10 w-full rounded border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>

              <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 min-[480px]:col-span-1 dark:bg-gray-800/50 dark:text-gray-400">
                PNG/SVG use scale directly. PDF uses 150–300 DPI based on scale.
              </div>
            </div>
          </section>

          <section className="mt-5" aria-labelledby="data-export-heading">
            <h3 id="data-export-heading" className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Data exports
            </h3>
            <div className="grid gap-2 min-[480px]:grid-cols-2">
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={!!exportingFormat}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
              >
                <Table size={20} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">CSV Employee Roster</span>
                  <span className="block text-xs text-gray-400 dark:text-gray-500">Spreadsheet with seat assignments</span>
                </span>
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                disabled={!!exportingFormat}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
              >
                <FileJson size={20} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">JSON Project Data</span>
                  <span className="block text-xs text-gray-400 dark:text-gray-500">Full project data with floors and employees</span>
                </span>
              </button>
            </div>
          </section>
        </div>

        {exportingFormat && (
          <div className="border-t border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-950 dark:bg-blue-950/30" role="status" aria-live="polite">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-200">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Exporting {exportingFormat.toUpperCase()}…
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 p-4 min-[480px]:flex-row min-[480px]:justify-end sm:px-6 dark:border-gray-800">
          <button
            type="button"
            onClick={close}
            disabled={!!exportingFormat}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCanvasExport}
            disabled={!!exportingFormat}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
          >
            {format === 'pdf' ? <FileText size={16} aria-hidden="true" /> : format === 'svg' ? <ImageIcon size={16} aria-hidden="true" /> : <ImageIcon size={16} aria-hidden="true" />}
            Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  )
}
