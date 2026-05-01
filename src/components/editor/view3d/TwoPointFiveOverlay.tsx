import type { ComponentType } from 'react'
import type { ThreeDEntryProps } from './types'

interface TwoPointFiveOverlayProps {
  ThreeDEntry: ComponentType<ThreeDEntryProps> | null
  threeDLoadFailed: boolean
  setThreeDLoadFailed: (failed: boolean) => void
  setViewMode: (mode: '2d' | '2.5d') => void
  floor: ThreeDEntryProps['floor']
  elements: ThreeDEntryProps['elements']
}

export function TwoPointFiveOverlay({
  ThreeDEntry,
  threeDLoadFailed,
  setThreeDLoadFailed,
  setViewMode,
  floor,
  elements,
}: TwoPointFiveOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 p-6 text-center dark:bg-gray-950/90"
      data-testid="mapview-25d-panel"
    >
      {ThreeDEntry ? (
        <ThreeDEntry
          floor={floor}
          elements={elements}
          onRequestFallback2D={() => setViewMode('2d')}
        />
      ) : (
        <div
          role={threeDLoadFailed ? 'alert' : 'status'}
          aria-live={threeDLoadFailed ? 'assertive' : 'polite'}
          className="max-w-lg rounded-md border border-gray-200 bg-white p-5 text-left shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="flex items-start gap-4">
            <div
              className="mt-0.5 grid h-12 w-12 flex-none grid-cols-2 gap-1 rounded-md bg-slate-100 p-2 dark:bg-gray-800"
              aria-hidden="true"
            >
              <span className="rounded-sm bg-slate-300 shadow-sm dark:bg-gray-600" />
              <span className="rounded-sm bg-sky-300 shadow-sm dark:bg-sky-800" />
              <span className="rounded-sm bg-emerald-300 shadow-sm dark:bg-emerald-800" />
              <span className="animate-pulse rounded-sm bg-amber-300 shadow-sm dark:bg-amber-800" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {threeDLoadFailed ? '2.5D review is unavailable' : 'Building 2.5D review'}
              </p>
              <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-300">
                {threeDLoadFailed
                  ? 'The 3D engine could not start in this browser context. Your plan is still editable in 2D.'
                  : 'Preparing materials, shadows, and camera presets. You can return to 2D at any time.'}
              </p>
            </div>
          </div>
          {threeDLoadFailed && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Return to 2D editor
              </button>
              <button
                type="button"
                onClick={() => setThreeDLoadFailed(false)}
                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Retry 2.5D
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
