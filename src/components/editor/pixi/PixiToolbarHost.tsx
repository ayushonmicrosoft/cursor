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
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden" data-testid="pixi-editor-page">
      {!isCompactEditor && leftToolsVisible && !leftToolsFloating && (
        <div
          className={`flex flex-shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200 dark:border-gray-800 dark:bg-gray-950 ${
            leftSidebarOpen ? 'w-[280px] overflow-y-auto overflow-x-hidden' : 'w-10 overflow-hidden'
          }`}
        >
          <button
            type="button"
            onClick={() => setLeftSidebarOpen((v) => !v)}
            className="flex h-9 w-full items-center justify-center gap-1.5 border-b border-gray-100 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200"
            title={leftSidebarOpen ? 'Collapse Pixi sidebar' : 'Expand Pixi sidebar'}
            aria-label={leftSidebarOpen ? 'Collapse Pixi sidebar' : 'Expand Pixi sidebar'}
          >
            {leftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
            {leftSidebarOpen && <span className="text-[11px] font-medium">Collapse</span>}
          </button>
          {leftSidebarOpen && (
            <>
              <CollapsibleSection title="Pixi Tools" defaultOpen storageKey="pixi-tools">
                <ToolSelector />
              </CollapsibleSection>
              <CollapsibleSection title="Pixi Layers" defaultOpen={false} storageKey="pixi-layers">
                <LayerVisibilityPanel />
              </CollapsibleSection>
              <CollapsibleSection title="Pixi Library" defaultOpen storageKey="pixi-library">
                <ElementLibrary />
              </CollapsibleSection>
            </>
          )}
        </div>
      )}

      {children}

      {rightSidebarOpen && rightInspectorVisible && !rightInspectorFloating && !isCompactEditor && (
        <div className="w-[320px] flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-white transition-[width] duration-200 dark:border-gray-800 dark:bg-gray-950">
          <RightSidebar />
        </div>
      )}
    </div>
  )
}
