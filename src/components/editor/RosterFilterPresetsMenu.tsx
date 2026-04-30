import { useCallback, useEffect, useRef, useState } from 'react'
import { Bookmark, Pencil, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useToastStore } from '../../stores/toastStore'
import { Button, Input, Modal, ModalBody, ModalFooter } from '../ui'
import {
  MAX_FILTER_PRESETS,
  addFilterPreset,
  deleteFilterPreset,
  loadFilterPresets,
  renameFilterPreset,
  resolveUniquePresetName,
  saveFilterPresets,
  type FilterPreset,
} from '../../lib/filterPresetsStorage'

interface Props {
  currentSearch: string
  hasAnyFilter: boolean
  onApplyPreset: (query: string) => void
}

type NameDialogState =
  | { mode: 'save' }
  | { mode: 'rename'; id: string; currentName: string }

export function RosterFilterPresetsMenu({
  currentSearch,
  hasAnyFilter,
  onApplyPreset,
}: Props) {
  const [open, setOpen] = useState(false)
  const [presets, setPresets] = useState<FilterPreset[]>(() => loadFilterPresets())
  const [nameDialog, setNameDialog] = useState<NameDialogState | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const toastPush = useToastStore((s) => s.push)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const persist = useCallback((next: FilterPreset[]) => {
    setPresets(next)
    saveFilterPresets(next)
  }, [])

  const handleSave = useCallback(() => {
    if (!hasAnyFilter) return
    setNameDraft('')
    setNameDialog({ mode: 'save' })
  }, [hasAnyFilter])

  const handleConfirmName = useCallback(() => {
    if (!nameDialog) return
    const trimmed = nameDraft.trim()
    if (!trimmed) return

    if (nameDialog.mode === 'save') {
      const name = resolveUniquePresetName(presets, trimmed)
      const preset: FilterPreset = {
        id: nanoid(),
        name,
        query: currentSearch.replace(/^\?/, ''),
        createdAt: new Date().toISOString(),
      }
      const { presets: next, purged } = addFilterPreset(presets, preset)
      persist(next)
      if (purged) {
        toastPush({
          tone: 'warning',
          title: `Removed oldest preset "${purged.name}"`,
          body: `Saved filters are capped at ${MAX_FILTER_PRESETS}.`,
        })
      }
    } else {
      if (trimmed === nameDialog.currentName) {
        setNameDialog(null)
        setNameDraft('')
        return
      }
      const others = presets.filter((p) => p.id !== nameDialog.id)
      const name = resolveUniquePresetName(others, trimmed)
      persist(renameFilterPreset(presets, nameDialog.id, name))
    }

    setNameDialog(null)
    setNameDraft('')
  }, [currentSearch, nameDialog, nameDraft, persist, presets, toastPush])

  const handleDelete = useCallback(
    (id: string, name: string) => {
      if (!window.confirm(`Delete saved filter "${name}"?`)) return
      persist(deleteFilterPreset(presets, id))
    },
    [persist, presets],
  )

  const handleRename = useCallback((id: string, currentName: string) => {
    setNameDraft(currentName)
    setNameDialog({ mode: 'rename', id, currentName })
  }, [])

  const handleApply = useCallback(
    (preset: FilterPreset) => {
      onApplyPreset(preset.query)
      setOpen(false)
    },
    [onApplyPreset],
  )

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Saved filters"
      >
        <Bookmark size={14} />
        Saved filters
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Saved filter presets"
          className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl w-80 overflow-hidden"
        >
          <div className="max-h-72 overflow-y-auto">
            {presets.length === 0 ? (
              <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                No saved filters yet. Set up a filter below and hit "Save current filters as..." to stash it here.
              </div>
            ) : (
              <ul className="py-1">
                {presets.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <button
                      type="button"
                      onClick={() => handleApply(p)}
                      className="flex-1 text-left text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 truncate"
                      aria-label={`Apply preset ${p.name}`}
                      title={p.query || '(no filters)'}
                    >
                      {p.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRename(p.id, p.name)}
                      aria-label={`Rename preset ${p.name}`}
                      title="Rename"
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      aria-label={`Delete preset ${p.name}`}
                      title="Delete"
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasAnyFilter}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              title={
                hasAnyFilter
                  ? 'Save the current filters as a reusable preset'
                  : 'Set at least one filter first'
              }
            >
              <Bookmark size={14} />
              Save current filters as...
            </button>
          </div>
        </div>
      )}

      {nameDialog && (
        <Modal
          open
          onClose={() => setNameDialog(null)}
          title={nameDialog.mode === 'save' ? 'Save current filters' : 'Rename saved filter'}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleConfirmName()
            }}
          >
            <ModalBody className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Filter name
                <Input
                  className="mt-1"
                  value={nameDraft}
                  autoFocus
                  onChange={(event) => setNameDraft(event.target.value)}
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Names are kept unique automatically when needed.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="ghost" onClick={() => setNameDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={!nameDraft.trim()}>
                {nameDialog.mode === 'save' ? 'Save filter' : 'Rename filter'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </div>
  )
}
