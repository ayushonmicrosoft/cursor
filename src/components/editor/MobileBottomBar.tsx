import {
  MousePointer2,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings,
  Grid3x3,
  ChevronUp,
  Layers,
  X,
} from 'lucide-react'
import { useCanvasStore, type ToolType } from '../../stores/canvasStore'
import { useUIStore } from '../../stores/uiStore'
import { useState } from 'react'

interface MobileBottomBarProps {
  isVisible: boolean
}

const TOOL_BUTTONS: Array<{
  id: ToolType
  icon: React.ReactNode
  label: string
}> = [
  { id: 'select', icon: <MousePointer2 size={20} />, label: 'Select' },
  { id: 'pan', icon: <Hand size={20} />, label: 'Pan' },
]

/**
 * Bottom-docked tool/action bar for mobile editor mode (480px-767px).
 *
 * Provides high-frequency actions as large touch targets:
 * - Select/Pan tools
 * - Zoom in/out
 * - Fit/reset view
 * - Layers/tools entry
 * - Properties entry
 */
export function MobileBottomBar({ isVisible }: MobileBottomBarProps) {
  const activeTool = useCanvasStore((s) => s.activeTool)
  const setActiveTool = useCanvasStore((s) => s.setActiveTool)
  const zoomIn = useCanvasStore((s) => s.zoomIn)
  const zoomOut = useCanvasStore((s) => s.zoomOut)
  const zoomToContent = useCanvasStore((s) => s.zoomToContent)
  const resetZoom = useCanvasStore((s) => s.resetZoom)
  const settings = useCanvasStore((s) => s.settings)
  const toggleGrid = useCanvasStore((s) => s.toggleGrid)

  const selectedIds = useUIStore((s) => s.selectedIds)
  const setRightSidebarOpen = useUIStore((s) => s.setRightSidebarOpen)
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen)
  const setRightSidebarTab = useUIStore((s) => s.setRightSidebarTab)
  const dockableToolbarVisibility = useUIStore((s) => s.dockableToolbarVisibility)
  const setDockableToolbarVisible = useUIStore((s) => s.setDockableToolbarVisible)

  const [showToolsMenu, setShowToolsMenu] = useState(false)

  if (!isVisible) return null

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool)
    // Dismiss tools menu if open
    setShowToolsMenu(false)
  }

  const handlePropertiesClick = () => {
    if (selectedIds.length > 0) {
      setRightSidebarTab('properties')
      setRightSidebarOpen(true)
    }
  }

  const handleToggleGrid = () => {
    toggleGrid()
  }

  return (
    <>
      {/* Tools overlay menu */}
      {showToolsMenu && (
        <div
          className="absolute bottom-16 left-2 right-2 z-40 bg-white dark:bg-gray-900 rounded-t-xl border border-gray-200 dark:border-gray-800 shadow-lg"
          role="dialog"
          aria-label="Tools menu"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Tools
            </span>
            <button
              type="button"
              onClick={() => setShowToolsMenu(false)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close tools menu"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-2 grid grid-cols-3 gap-2">
            {TOOL_BUTTONS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolClick(tool.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors min-h-[64px] justify-center ${
                  activeTool === tool.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-label={tool.label}
                aria-pressed={activeTool === tool.id}
              >
                {tool.icon}
                <span className="text-xs">{tool.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleToggleGrid}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors min-h-[64px] justify-center ${
                settings.showGrid
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Toggle grid"
              aria-pressed={settings.showGrid}
            >
              <Grid3x3 size={20} />
              <span className="text-xs">Grid</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 px-2 py-2 flex items-center justify-between gap-1">
        {/* Primary tools */}
        <div className="flex items-center gap-1">
          {TOOL_BUTTONS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleToolClick(tool.id)}
              className={`p-2.5 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center ${
                activeTool === tool.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-label={tool.label}
              aria-pressed={activeTool === tool.id}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Secondary actions */}
        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <button
            type="button"
            onClick={zoomOut}
            className="p-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className="p-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </button>

          {/* Fit/Reset */}
          <button
            type="button"
            onClick={zoomToContent}
            className="p-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Fit to content"
          >
            <Maximize2 size={20} />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Layers/Tools toggle */}
          <button
            type="button"
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            className={`p-2.5 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center ${
              showToolsMenu
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Toggle tools menu"
            aria-pressed={showToolsMenu}
          >
            <Layers size={20} />
          </button>

          {/* Properties - only enabled when selection exists */}
          <button
            type="button"
            onClick={handlePropertiesClick}
            disabled={selectedIds.length === 0}
            className={`p-2.5 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center ${
              rightSidebarOpen && selectedIds.length > 0
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800'
                : selectedIds.length === 0
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Open properties"
            aria-pressed={rightSidebarOpen && selectedIds.length > 0}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </>
  )
}
