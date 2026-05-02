import { useEffect, useMemo, useRef, useState } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useCan } from '../../hooks/useCan'
import { Smartphone, Monitor, HelpCircle, X, Command, Zap } from 'lucide-react'

/**
 * Keyboard shortcut reference.
 *
 * Source of truth is `src/hooks/useKeyboardShortcuts.ts`. Every entry
 * here has a corresponding binding in that hook (or, for canvas
 * gestures like marquee / drag-to-pan, in CanvasStage).
 *
 * The overlay supports a fuzzy filter (action substring + key combo
 * substring) so power users can type "undo", "cmd", or "zoom" and
 * narrow down to relevant entries quickly. The platform-aware label
 * helper (`formatKeys`) swaps `Cmd` for `⌘` on macOS so the rendered
 * pills match what's printed on the user's keyboard.
 *
 * Enhanced in Wave 12D:
 * - Added touch gesture hints for mobile users
 * - Added Admin/Reports section for privileged users
 * - Added Cmd/Ctrl+/ binding (on top of existing ? binding)
 * - Mobile-responsive layout for 480px+ screens
 * - Tabbed interface for Keyboard vs Touch gestures
 */

type ShortcutRow = {
  /**
   * Canonical, platform-neutral form. Use `Cmd` for the meta/ctrl
   * modifier — `formatKeys` will translate to ⌘ on macOS and `Ctrl`
   * elsewhere. Use `+` between modifiers and the base key, and
   * `/` when there's a logical alternative (e.g. `Delete / Backspace`).
   *
   * For touch gestures, use descriptive text (e.g. "Long press") —
   * the renderer will show an icon + text instead of keyboard pills.
   */
  keys: string
  action: string
  /**
   * When true, this row represents a touch gesture rather than a
   * keyboard shortcut. The renderer shows a touch icon + text.
   */
  isTouch?: boolean
}

type ShortcutGroup = { title: string; rows: ShortcutRow[] }
type GestureRow = { gesture: string; action: string; detail: string }
type OverlayTab = 'keyboard' | 'touch'

const keyboardShortcutGroups: ShortcutGroup[] = [
  {
    title: 'Editing',
    rows: [
      { keys: 'Cmd+Z', action: 'Undo' },
      { keys: 'Cmd+Shift+Z', action: 'Redo' },
      { keys: 'Delete / Backspace', action: 'Delete selected' },
      { keys: 'Cmd+D', action: 'Duplicate selection' },
      { keys: 'Cmd+A', action: 'Select all' },
      { keys: 'Cmd+G', action: 'Group selection' },
      { keys: 'Cmd+Shift+G', action: 'Ungroup' },
      { keys: 'Cmd+L', action: 'Lock / unlock' },
      { keys: 'Arrows', action: 'Nudge 1px (Shift = 10px)' },
    ],
  },
  {
    title: 'Navigation',
    rows: [
      { keys: 'Drag', action: 'Pan canvas (Select tool, empty space)' },
      { keys: 'Shift+Drag', action: 'Marquee-select on empty canvas' },
      { keys: 'Space+Drag', action: 'Pan canvas (hold Space)' },
      { keys: 'Middle-Click+Drag', action: 'Pan' },
      { keys: 'Two-finger Drag', action: 'Pan (trackpad)' },
      { keys: 'Shift+Wheel', action: 'Pan horizontally' },
      { keys: 'Arrows', action: 'Pan viewport (no selection)' },
      { keys: 'Cmd+F', action: 'Find on canvas' },
    ],
  },
  {
    title: 'Tools',
    rows: [
      { keys: 'V', action: 'Select' },
      { keys: 'W', action: 'Wall' },
      { keys: 'Shift+R', action: 'Rectangle' },
      { keys: 'E', action: 'Ellipse' },
      { keys: 'L', action: 'Line' },
      { keys: 'A', action: 'Arrow' },
      { keys: 'T', action: 'Text' },
      { keys: 'Shift+D', action: 'Door' },
      { keys: 'Shift+N', action: 'Window' },
      { keys: 'Shift+G', action: 'Neighborhood' },
      { keys: 'Shift+M', action: 'Ruler / measure' },
    ],
  },
  {
    title: 'View',
    rows: [
      { keys: 'Cmd+=', action: 'Zoom in' },
      { keys: 'Cmd+-', action: 'Zoom out' },
      { keys: 'Cmd+0', action: 'Reset zoom' },
      { keys: 'G', action: 'Toggle grid' },
      { keys: 'D', action: 'Toggle dimensions' },
      { keys: 'N', action: 'Toggle compass' },
      { keys: 'P', action: 'Presentation mode' },
      { keys: 'M', action: 'Jump to map view' },
      { keys: 'R', action: 'Jump to roster view' },
      { keys: 'O', action: 'Jump to org chart' },
    ],
  },
  {
    title: 'Discovery',
    rows: [
      { keys: 'Cmd+K', action: 'Command palette' },
      { keys: '/', action: 'Command palette' },
      { keys: '?', action: 'Show keyboard shortcuts' },
      { keys: 'Cmd+/', action: 'Show keyboard shortcuts' },
      { keys: 'Cmd+F', action: 'Find on canvas' },
    ],
  },
  {
    title: 'General',
    rows: [{ keys: 'Escape', action: 'Deselect / cancel / exit mode' }],
  },
]

const adminShortcutGroups: ShortcutGroup[] = [
  {
    title: 'Admin / Reports',
    rows: [
      { keys: 'Cmd+Shift+R', action: 'Open reports panel' },
      { keys: 'Cmd+Shift+E', action: 'Export dialog' },
      { keys: 'Cmd+Shift+I', action: 'Import employees (CSV)' },
      { keys: 'Cmd+Shift+S', action: 'Share project' },
    ],
  },
]

const touchGestureGroups: ShortcutGroup[] = [
  {
    title: 'Canvas Navigation',
    rows: [
      { keys: 'One-finger drag', action: 'Pan the canvas', isTouch: true },
      { keys: 'Pinch (2 fingers)', action: 'Zoom in/out', isTouch: true },
      { keys: 'Double-tap', action: 'Quick zoom to fit', isTouch: true },
      {
        keys: 'Two-finger swipe',
        action: 'Navigate between floors',
        isTouch: true,
      },
    ],
  },
  {
    title: 'Selection & Editing',
    rows: [
      { keys: 'Long press', action: 'Open context menu', isTouch: true },
      { keys: 'Tap', action: 'Select element', isTouch: true },
      { keys: 'Tap + drag', action: 'Move element', isTouch: true },
    ],
  },
  {
    title: 'Drawing & Tools',
    rows: [
      {
        keys: 'Long press empty space',
        action: 'Tool selector',
        isTouch: true,
      },
      { keys: 'Two-finger tap', action: 'Undo last action', isTouch: true },
      { keys: 'Three-finger tap', action: 'Redo / restore', isTouch: true },
    ],
  },
]

/**
 * macOS detection. Lives behind a function so tests can mock
 * `navigator.platform` (or `navigator.userAgent` on newer Safari /
 * iPad-as-Mac) and re-render. We check `userAgent` as a fallback
 * because `navigator.platform` is deprecated and increasingly
 * returns generic strings on modern browsers.
 */
function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  const platform = navigator.platform || ''
  if (/Mac|iPhone|iPad|iPod/i.test(platform)) return true
  const ua = navigator.userAgent || ''
  return /Mac|iPhone|iPad|iPod/i.test(ua)
}

/**
 * Translate a canonical key combo (`Cmd+Shift+Z`) into an array of
 * per-keycap labels (`['⌘', 'Shift', 'Z']` on macOS, `['Ctrl',
 * 'Shift', 'Z']` elsewhere). Unhandled separators (`/`, ` or `, `+`)
 * are returned verbatim as their own tokens so the renderer can
 * place a non-keycap glue character between pills.
 */
function formatKeys(
  combo: string,
  mac: boolean,
): Array<{ kind: 'key' | 'sep'; text: string }> {
  // Normalize an alternative-separator (`/`, ` or `, `,`) into a single
  // token type; the splitter below preserves both keycap segments
  // around it so the UI can render "Delete or Backspace" with two
  // pills and a glue word between.
  const tokens: Array<{ kind: 'key' | 'sep'; text: string }> = []
  // Split on `+`, `/`, ` or `, and `,` — keeping the separators so we
  // can stamp them back into the output as glue between pills.
  const parts = combo.split(/(\s*\+\s*|\s*\/\s*|\s+or\s+|\s*,\s*)/)
  for (const raw of parts) {
    if (!raw) continue
    const trimmed = raw.trim()
    if (trimmed === '+') {
      tokens.push({ kind: 'sep', text: '+' })
      continue
    }
    if (trimmed === '/' || trimmed === 'or' || trimmed === ',') {
      tokens.push({
        kind: 'sep',
        text: trimmed === ',' ? ',' : trimmed === 'or' ? 'or' : '/',
      })
      continue
    }
    if (trimmed === '') continue
    // Translate the canonical `Cmd` to the platform glyph. Other
    // tokens are passed through unchanged — `Shift`, `Alt`, `Enter`,
    // letters, arrow symbols, etc. are already platform-neutral.
    const label = trimmed === 'Cmd' ? (mac ? '\u2318' : 'Ctrl') : trimmed
    tokens.push({ kind: 'key', text: label })
  }
  return tokens
}

function matchesQuery(row: ShortcutRow, mac: boolean, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase().trim()
  if (!q) return true
  if (row.action.toLowerCase().includes(q)) return true
  if (row.keys.toLowerCase().includes(q)) return true
  // Also let the user search by the rendered platform label
  // ("⌘", "ctrl") so typing "ctrl" still works on a Mac and
  // typing "cmd" still works on Linux/Windows.
  if (!row.isTouch) {
    const rendered = formatKeys(row.keys, mac)
      .map((t) => t.text)
      .join(' ')
      .toLowerCase()
    return rendered.includes(q)
  }
  return false
}

function KeyCombo({ combo, mac }: { combo: string; mac: boolean }) {
  const tokens = formatKeys(combo, mac)
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      {tokens.map((t, i) =>
        t.kind === 'key' ? (
          <kbd
            key={`${i}-${t.text}`}
            className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-1.5 font-mono text-[11px] font-medium text-gray-700 shadow-[0_1px_0_0_rgba(0,0,0,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.06)] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:shadow-[0_1px_0_0_rgba(0,0,0,0.4),inset_0_-1px_0_0_rgba(255,255,255,0.04)]"
          >
            {t.text}
          </kbd>
        ) : (
          <span
            key={`sep-${i}`}
            className="text-[11px] text-gray-400 select-none dark:text-gray-500"
            aria-hidden="true"
          >
            {t.text}
          </span>
        ),
      )}
    </span>
  )
}

function TouchBadge({ gesture }: { gesture: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
      <Smartphone size={14} className="text-gray-400 dark:text-gray-500" />
      <span className="font-medium">{gesture}</span>
    </span>
  )
}

export function KeyboardShortcutsOverlay() {
  const open = useUIStore((s) => s.shortcutsOverlayOpen)
  const setOpen = useUIStore((s) => s.setShortcutsOverlayOpen)
  // Mount the inner content lazily so query state is fresh on each
  // open without needing a setState-in-effect to reset it. Closing
  // the overlay unmounts the inner component, garbage-collecting
  // the search query alongside it.
  if (!open) return null
  return <OverlayContent setOpen={setOpen} />
}

function OverlayContent({ setOpen }: { setOpen: (open: boolean) => void }) {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'keyboard' | 'touch'>('keyboard')
  const inputRef = useRef<HTMLInputElement>(null)
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const setFirstRunCoachOpen = useUIStore((s) => s.setFirstRunCoachOpen)
  const canViewReports = useCan('viewReports')
  // Detected per render. Cheap (a single regex on a short string),
  // and computing it on every render means tests that mock
  // `navigator.platform` after mount still see the swap on the next
  // re-render rather than being stuck with whatever platform the
  // very first render saw.
  const mac = isMacPlatform()

  // Auto-focus the search input on mount. requestAnimationFrame so
  // the input exists in the DOM by the time we focus — useEffect
  // runs after commit but jsdom + React 18 occasionally lose focus
  // calls fired during the same tick.
  useEffect(() => {
    if (activeTab !== 'keyboard') return
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [activeTab])

  // Escape handler. The global `useKeyboardShortcuts` hook stands
  // down while a modal is open, so we own dismissal here. Bound to
  // window so it fires even if focus has moved off the input (e.g.
  // user clicked a kbd row).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () =>
      window.removeEventListener('keydown', onKey, {
        capture: true,
      } as EventListenerOptions)
  }, [setOpen])

  // Build the groups based on active tab and permissions
  const baseGroups =
    activeTab === 'keyboard' ? keyboardShortcutGroups : touchGestureGroups
  const groups = useMemo(() => {
    if (activeTab === 'keyboard' && canViewReports) {
      return [...baseGroups, ...adminShortcutGroups]
    }
    return baseGroups
  }, [activeTab, canViewReports, baseGroups])

  // Filter every group through the query, dropping any that have no
  // surviving rows so the layout stays tight.
  const filteredGroups = useMemo(() => {
    return groups
      .map((g) => ({
        ...g,
        rows: g.rows.filter((r) => matchesQuery(r, mac, query)),
      }))
      .filter((g) => g.rows.length > 0)
  }, [groups, query, mac])

  const totalCount = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.rows.length, 0),
    [filteredGroups],
  )

  const handleOpenPalette = () => {
    setOpen(false)
    setCommandPaletteOpen(true)
  }

  const handleReplayTour = () => {
    setOpen(false)
    setFirstRunCoachOpen(true)
  }

  const headerText =
    activeTab === 'keyboard' ? 'Keyboard Shortcuts' : 'Touch Gestures'
  const searchPlaceholder =
    activeTab === 'keyboard'
      ? 'Search shortcuts (e.g. undo, cmd, zoom)'
      : 'Search gestures (e.g. pinch, tap, drag)'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-heading"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {activeTab === 'keyboard' ? (
              <Command size={20} className="text-gray-500 dark:text-gray-400" />
            ) : (
              <Smartphone
                size={20}
                className="text-gray-500 dark:text-gray-400"
              />
            )}
            <h2
              id="shortcuts-heading"
              className="text-base font-semibold text-gray-900 dark:text-gray-100"
            >
              {headerText}
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label="Close shortcuts overlay"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-gray-200 px-4 pt-3 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab('keyboard')}
            className={`flex items-center gap-2 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'keyboard'
                ? 'border-b-2 border-blue-600 bg-blue-50/50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            aria-pressed={activeTab === 'keyboard'}
          >
            <Monitor size={16} />
            <span className="hidden sm:inline">Keyboard</span>
            <span className="sm:hidden">Keys</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('touch')}
            className={`flex items-center gap-2 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'touch'
                ? 'border-b-2 border-blue-600 bg-blue-50/50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            aria-pressed={activeTab === 'touch'}
          >
            <Smartphone size={16} />
            <span className="hidden sm:inline">Touch Gestures</span>
            <span className="sm:hidden">Touch</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="space-y-3 px-4 py-3">
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={
                activeTab === 'keyboard'
                  ? 'Search keyboard shortcuts'
                  : 'Search touch gestures'
              }
              className="min-w-0 flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            />
            <button
              type="button"
              onClick={handleOpenPalette}
              data-testid="shortcuts-open-palette"
              className="hidden items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none sm:inline-flex dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Zap size={14} />
              Palette
            </button>
            <button
              type="button"
              onClick={handleReplayTour}
              data-testid="shortcuts-replay-tour"
              className="hidden items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none sm:inline-flex dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <HelpCircle size={14} />
              Tour
            </button>
          </form>

          <div className="flex items-center justify-between text-xs">
            <span
              className="text-gray-500 dark:text-gray-400"
              aria-live="polite"
            >
              {totalCount === 0
                ? 'No results'
                : `${totalCount} ${activeTab === 'keyboard' ? 'shortcut' : 'gesture'}${totalCount === 1 ? '' : 's'}`}
            </span>
            <span className="hidden text-gray-400 sm:inline dark:text-gray-500">
              {activeTab === 'keyboard'
                ? 'Press ? or Cmd+/ anytime'
                : 'Works on touch devices'}
            </span>
          </div>

          {/* Mobile action buttons */}
          <div className="flex gap-2 sm:hidden">
            <button
              type="button"
              onClick={handleOpenPalette}
              data-testid="shortcuts-open-palette-mobile"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Zap size={14} />
              Palette
            </button>
            <button
              type="button"
              onClick={handleReplayTour}
              data-testid="shortcuts-replay-tour-mobile"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <HelpCircle size={14} />
              Tour
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filteredGroups.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <HelpCircle
                  size={24}
                  className="text-gray-400 dark:text-gray-500"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No {activeTab === 'keyboard' ? 'shortcuts' : 'gestures'} match
                &ldquo;{query}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              {filteredGroups.map((group) => (
                <section key={group.title}>
                  <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                    {group.title}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {group.rows.map((row) => (
                      <li
                        key={`${group.title}-${row.keys}-${row.action}`}
                        className="flex items-center justify-between gap-3 py-1"
                      >
                        <span className="text-sm leading-snug text-gray-700 dark:text-gray-200">
                          {row.action}
                        </span>
                        {row.isTouch ? (
                          <TouchBadge gesture={row.keys} />
                        ) : (
                          <KeyCombo combo={row.keys} mac={mac} />
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-800/50">
          <p className="text-center text-[11px] text-gray-500 dark:text-gray-400">
            {activeTab === 'keyboard'
              ? 'Tool keys only fire when no input is focused. Escape closes any overlay.'
              : 'Gestures may vary by device. Long-press often reveals context menus.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsOverlay
