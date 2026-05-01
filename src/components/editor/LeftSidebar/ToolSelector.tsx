import { useState } from 'react'
import { useCanvasStore, type ToolType, type WallDrawStyle } from '../../../stores/canvasStore'

import { useFirstUseTooltip } from '../../../hooks/useFirstUseTooltip'
import { FirstUseTooltip } from '../FirstUseTooltip'
import {
  MousePointer2,
  Hand,
  Minus,
  DoorOpen,
  SquareIcon,
  Square,
  Circle,
  Slash,
  ArrowRight,
  Type,
  Ruler,
  MapPin,
} from 'lucide-react'

interface ToolDef {
  id: ToolType
  label: string
  icon: React.ReactNode
  shortcut: string
  /** One-line first-use description shown in the rich hover tooltip. */
  description: string
}

const tools: ToolDef[] = [
  {
    id: 'select',
    label: 'Select',
    icon: <MousePointer2 size={18} aria-hidden="true" />,
    shortcut: 'V',
    description: 'Click an element to select, drag empty canvas to pan, Shift+drag to lasso.',
  },
  {
    id: 'pan',
    label: 'Pan',
    icon: <Hand size={18} aria-hidden="true" />,
    shortcut: 'Space',
    description: 'Dedicated pan mode. Hold Space anywhere for a temporary pan instead.',
  },
  {
    id: 'wall',
    label: 'Wall',
    icon: <Minus size={18} aria-hidden="true" />,
    shortcut: 'W',
    description: 'Click and drag to draw a straight wall. Double-click to finish and drop back to pan.',
  },
  {
    id: 'door',
    label: 'Door',
    icon: <DoorOpen size={18} aria-hidden="true" />,
    shortcut: '⇧D',
    description: 'Click a wall to drop in a door at that position.',
  },
  {
    id: 'window',
    label: 'Window',
    icon: <SquareIcon size={18} aria-hidden="true" />,
    shortcut: '⇧N',
    description: 'Click a wall to place a window along its length.',
  },
  // Drawing primitives. Shortcut picks:
  //   R = rect, E = ellipse (C is already taken visually by "Circle" but we
  //   avoid the D/G/M/R conflicts in useKeyboardShortcuts), L = line,
  //   A = arrow, T = text. D is "toggle dimensions" and G is "toggle grid",
  //   so we avoid those.
  {
    id: 'rect-shape',
    label: 'Rectangle',
    icon: <Square size={18} aria-hidden="true" />,
    shortcut: '⇧R',
    description: 'Click and drag to draw a rectangle. Useful for rough space blocks.',
  },
  {
    id: 'ellipse',
    label: 'Ellipse',
    icon: <Circle size={18} aria-hidden="true" />,
    shortcut: 'E',
    description: 'Click and drag to draw an ellipse. Hold Shift for a perfect circle.',
  },
  {
    id: 'line-shape',
    label: 'Line',
    icon: <Slash size={18} aria-hidden="true" />,
    shortcut: 'L',
    description: 'Click and drag to draw a straight line for annotations.',
  },
  {
    id: 'arrow',
    label: 'Arrow',
    icon: <ArrowRight size={18} aria-hidden="true" />,
    shortcut: 'A',
    description: 'Click and drag to draw an arrow. Great for call-outs and flow.',
  },
  {
    id: 'free-text',
    label: 'Text',
    icon: <Type size={18} aria-hidden="true" />,
    shortcut: 'T',
    description: 'Click anywhere to drop a text label on the canvas.',
  },
  // Measure is a read-only tool — architects and facilities managers use
  // it often to check corridor widths and room sizes, so we expose it
  // alongside the primitives. Shift+M because plain M jumps to Map view.
  {
    id: 'measure',
    label: 'Measure',
    icon: <Ruler size={18} aria-hidden="true" />,
    shortcut: '⇧M',
    description: 'Click points to measure distance. Double-click or Enter to finish.',
  },
  // Neighborhoods: drag-create a labeled zone that tints a seat region.
  // Plain G is "toggle grid", so the tool is shift-locked to ⇧G.
  {
    id: 'neighborhood',
    label: 'Neighborhood',
    icon: <MapPin size={18} aria-hidden="true" />,
    shortcut: '⇧G',
    description: 'Drag on empty canvas to paint a labeled zone for a team or group.',
  },
]

const WALL_STYLES: { id: WallDrawStyle; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed' },
  { id: 'dotted', label: 'Dotted' },
]

export function ToolSelector() {
  const activeTool = useCanvasStore((s) => s.activeTool)
  const setActiveTool = useCanvasStore((s) => s.setActiveTool)
  const wallDrawStyle = useCanvasStore((s) => s.wallDrawStyle)
  const setWallDrawStyle = useCanvasStore((s) => s.setWallDrawStyle)

  const { showRichTooltip, markToolUsed } = useFirstUseTooltip()

  // Hovered tool id; only one rich tooltip is visible at a time to avoid
  // a stack of cards when the user sweeps the cursor down the rail.
  const [hoveredToolId, setHoveredToolId] = useState<ToolType | null>(null)

  // Admin-only architecture: all tools are always visible.
  const visibleTools = tools

  const handleToolClick = (tool: ToolDef) => {
    setActiveTool(tool.id)
    markToolUsed(tool.id)
  }

  return (
    <div className="flex flex-col">
      {visibleTools.map((tool) => {
        const isRich = hoveredToolId === tool.id && showRichTooltip(tool.id)
        const tooltipId = `first-use-tooltip-${tool.id}`
        const isActive = activeTool === tool.id
        return (
          <div key={tool.id} className="relative">
            <button
              onClick={() => handleToolClick(tool)}
              onMouseEnter={() => setHoveredToolId(tool.id)}
              onMouseLeave={() => setHoveredToolId((prev) => (prev === tool.id ? null : prev))}
              onFocus={() => setHoveredToolId(tool.id)}
              onBlur={() => setHoveredToolId((prev) => (prev === tool.id ? null : prev))}
              className={`group flex w-full items-center gap-2 px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-blue-500 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium'
                  : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80'
              }`}
              title={isRich ? undefined : tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label}
              aria-describedby={isRich ? tooltipId : undefined}
            >
              <div className={`flex items-center justify-center w-5 h-5 opacity-80 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}>
                {tool.icon}
              </div>
              <span className="truncate">{tool.label}</span>
              {tool.shortcut && (
                <span className={`ml-auto text-[10px] tracking-widest font-medium ${isActive ? 'text-blue-500/70 dark:text-blue-400/70' : 'text-gray-400 dark:text-gray-500'}`}>
                  {tool.shortcut}
                </span>
              )}
            </button>
            {isRich && (
              <FirstUseTooltip
                id={tooltipId}
                name={tool.label}
                description={tool.description}
                shortcut={tool.shortcut}
                icon={tool.icon}
              />
            )}
            {/* Wall-style presets. */}
            {tool.id === 'wall' && isActive && (
              <div
                role="radiogroup"
                aria-label="Wall line style"
                className="flex gap-px px-3 pb-2 pt-1 bg-blue-50 dark:bg-blue-900/30"
              >
                {WALL_STYLES.map((s) => (
                  <button
                    key={s.id}
                    role="radio"
                    aria-checked={wallDrawStyle === s.id}
                    onClick={() => setWallDrawStyle(s.id)}
                    className={`flex-1 px-1 py-1 text-[10px] font-medium transition-colors border border-transparent ${
                      wallDrawStyle === s.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
