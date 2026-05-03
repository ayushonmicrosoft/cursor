import type { ReactNode } from 'react'
import { PanelLeft, PanelLeftClose } from 'lucide-react'
import { CollapsibleSection } from '../LeftSidebar/CollapsibleSection'
import { ToolSelector } from '../LeftSidebar/ToolSelector'
import { LayerVisibilityPanel } from '../LeftSidebar/LayerVisibilityPanel'
import { ElementLibrary } from '../LeftSidebar/ElementLibrary'
import { RightSidebar } from '../RightSidebar/RightSidebar'

interface PixiToolbarHostProps {
  isCompactEditor: boolean
  leftToolsVisible: boolean
  leftToolsFloating: boolean
  leftSidebarOpen: boolean
  setLeftSidebarOpen: (next: boolean | ((prev: boolean) => boolean)) => void
  rightSidebarOpen: boolean
  rightInspectorVisible: boolean
  rightInspectorFloating: boolean
  children: ReactNode
}

export function PixiToolbarHost({
  isCompactEditor,
  leftToolsVisible,
  leftToolsFloating,
  leftSidebarOpen,
  setLeftSidebarOpen,
  rightSidebarOpen,
  rightInspectorVisible,
  rightInspectorFloating,
  children,
}: PixiToolbarHostProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950" data-testid="pixi-editor-page">
      {!isCompactEditor && leftToolsVisible && !leftToolsFloating && (
        <div
          className={`flex flex-shrink-0 flex-col border-r border-slate-200 bg-white/95 backdrop-blur-sm transition-[width] duration-200 dark:border-slate-800 dark:bg-slate-950/95 ${
            leftSidebarOpen ? 'w-[280px] overflow-y-auto overflow-x-hidden' : 'w-10 overflow-hidden'
          }`}
        >
          <button
            type="button"
            onClick={() => setLeftSidebarOpen((v) => !v)}
            className="flex h-10 w-full items-center justify-between gap-2 border-b border-slate-200 px-3 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            title={leftSidebarOpen ? 'Collapse Pixi sidebar' : 'Expand Pixi sidebar'}
            aria-label={leftSidebarOpen ? 'Collapse Pixi sidebar' : 'Expand Pixi sidebar'}
          >
            <span className="inline-flex items-center gap-2">
              {leftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
              {leftSidebarOpen && <span className="text-[11px] font-medium uppercase tracking-wide">Tools</span>}
            </span>
            {leftSidebarOpen && <span className="text-[10px] text-slate-400">Collapse</span>}
          </button>
          {leftSidebarOpen && (
            <div className="space-y-2 p-2">
              <CollapsibleSection title="Pixi Tools" defaultOpen storageKey="pixi-tools">
                <ToolSelector />
              </CollapsibleSection>
              <CollapsibleSection title="Pixi Layers" defaultOpen={false} storageKey="pixi-layers">
                <LayerVisibilityPanel />
              </CollapsibleSection>
              <CollapsibleSection title="Pixi Library" defaultOpen storageKey="pixi-library">
                <ElementLibrary />
              </CollapsibleSection>
            </div>
          )}
        </div>
      )}

      {children}

      {rightSidebarOpen && rightInspectorVisible && !rightInspectorFloating && !isCompactEditor && (
        <div className="w-[340px] flex-shrink-0 overflow-y-auto border-l border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
          <RightSidebar />
        </div>
      )}
    </div>
  )
}
