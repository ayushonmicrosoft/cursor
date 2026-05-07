import { useEffect, useRef } from 'react'
import { X, GripHorizontal } from 'lucide-react'
import { RightSidebar } from './RightSidebar/RightSidebar'

interface MobilePropertiesSheetProps {
  isOpen: boolean
  onClose: () => void
}

const SHEET_MAX_HEIGHT_VH = 70
const SHEET_MIN_HEIGHT_PX = 200

/**
 * Mobile properties bottom sheet/drawer.
 *
 * Renders the RightSidebar content in a slide-up sheet for mobile
 * editor mode (480px-767px). Provides:
 * - Drag handle for accessibility
 * - Close affordance
 * - Max height constraint (70vh)
 * - Scrollable body
 * - Accessible dialog/sheet labeling
 */
export function MobilePropertiesSheet({ isOpen, onClose }: MobilePropertiesSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const startHeightRef = useRef<number>(0)

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Handle drag to resize (optional enhancement)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    startYRef.current = clientY
    startHeightRef.current = sheetRef.current?.clientHeight ?? 0

    const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveClientY = 'touches' in moveEvent
        ? (moveEvent as TouchEvent).touches[0].clientY
        : (moveEvent as MouseEvent).clientY
      const delta = startYRef.current - moveClientY
      const newHeight = Math.max(
        SHEET_MIN_HEIGHT_PX,
        Math.min(
          (window.innerHeight * SHEET_MAX_HEIGHT_VH) / 100,
          startHeightRef.current + delta
        )
      )
      if (sheetRef.current) {
        sheetRef.current.style.height = `${newHeight}px`
      }
    }

    const handleDragEnd = () => {
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchmove', handleDragMove)
      window.removeEventListener('touchend', handleDragEnd)
    }

    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragEnd)
    window.addEventListener('touchmove', handleDragMove)
    window.addEventListener('touchend', handleDragEnd)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Properties panel"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 transition-opacity" />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full bg-white dark:bg-gray-950 rounded-t-xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          maxHeight: `${SHEET_MAX_HEIGHT_VH}vh`,
          minHeight: `${SHEET_MIN_HEIGHT_PX}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle / Header */}
        <div
          className="flex items-center justify-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-800 cursor-ns-resize touch-none"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          role="button"
          aria-label="Resize panel"
          tabIndex={0}
        >
          <GripHorizontal
            size={24}
            className="text-gray-400 dark:text-gray-500 flex-shrink-0"
            aria-hidden="true"
          />
          <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 text-center">
            Properties
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
            aria-label="Close properties panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content - wraps RightSidebar */}
        <div className="flex-1 overflow-y-auto">
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}
