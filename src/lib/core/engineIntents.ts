import type { PointerPoint } from './types'

export type EngineIntentSource = 'pointer' | 'keyboard' | 'programmatic'

export interface SelectIntent {
  type: 'select'
  source: EngineIntentSource
  ids: string[]
  mode: 'replace' | 'add' | 'remove' | 'toggle'
}

export interface PanIntent {
  type: 'pan'
  source: EngineIntentSource
  delta: PointerPoint
}

export interface ZoomIntent {
  type: 'zoom'
  source: EngineIntentSource
  scaleDelta: number
  anchor: PointerPoint | null
}

export interface DragIntent {
  type: 'drag'
  source: EngineIntentSource
  phase: 'start' | 'move' | 'end'
  id: string
  position: PointerPoint
}

export interface MarqueeIntent {
  type: 'marquee'
  source: EngineIntentSource
  phase: 'start' | 'update' | 'end'
  start: PointerPoint
  end: PointerPoint
  additive: boolean
}

export interface ContextMenuIntent {
  type: 'context-menu'
  source: EngineIntentSource
  position: PointerPoint
  targetId: string | null
}

export interface KeyCommandIntent {
  type: 'key-command'
  source: 'keyboard'
  command:
    | 'undo'
    | 'redo'
    | 'delete'
    | 'duplicate'
    | 'escape'
    | 'select-all'
    | 'toggle-grid'
    | 'toggle-snap'
  meta?: Record<string, unknown>
}

export type EngineIntent =
  | SelectIntent
  | PanIntent
  | ZoomIntent
  | DragIntent
  | MarqueeIntent
  | ContextMenuIntent
  | KeyCommandIntent

const ENGINE_INTENT_SOURCES: EngineIntentSource[] = ['pointer', 'keyboard', 'programmatic']
const SELECT_MODES: SelectIntent['mode'][] = ['replace', 'add', 'remove', 'toggle']
const DRAG_PHASES: DragIntent['phase'][] = ['start', 'move', 'end']
const MARQUEE_PHASES: MarqueeIntent['phase'][] = ['start', 'update', 'end']
const KEY_COMMANDS: KeyCommandIntent['command'][] = [
  'undo',
  'redo',
  'delete',
  'duplicate',
  'escape',
  'select-all',
  'toggle-grid',
  'toggle-snap',
]

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function isPoint(value: unknown): value is PointerPoint {
  if (!isRecord(value)) return false
  const point = value as Partial<PointerPoint>
  return isFiniteNumber(point.x) && isFiniteNumber(point.y)
}

function isValidId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value === value.trim()
}

function isIntentSource(value: unknown): value is EngineIntentSource {
  return typeof value === 'string' && ENGINE_INTENT_SOURCES.includes(value as EngineIntentSource)
}

function assertUniqueIds(ids: string[]) {
  if (new Set(ids).size !== ids.length) {
    throw new Error('EngineIntent select ids must be unique.')
  }
}

function assertValidIds(ids: string[]) {
  if (!ids.every((id) => isValidId(id))) {
    throw new Error('EngineIntent ids must be non-empty strings.')
  }
}

function assertNonEmptyIds(ids: string[], mode: SelectIntent['mode']) {
  if (mode !== 'replace' && ids.length === 0) {
    throw new Error(`EngineIntent select ids cannot be empty for mode "${mode}".`)
  }
}

export function assertEngineIntent(intent: unknown): asserts intent is EngineIntent {
  if (!isRecord(intent)) {
    throw new Error('EngineIntent must be an object.')
  }

  const { type, source } = intent
  if (typeof type !== 'string') {
    throw new Error('EngineIntent type must be a string.')
  }

  switch (type) {
    case 'select': {
      if (!isIntentSource(source)) {
        throw new Error('EngineIntent select source is invalid.')
      }
      if (!SELECT_MODES.includes(intent.mode as SelectIntent['mode'])) {
        throw new Error('EngineIntent select mode is invalid.')
      }
      if (!Array.isArray(intent.ids) || !intent.ids.every((id) => typeof id === 'string')) {
        throw new Error('EngineIntent select ids must be a string array.')
      }
      const ids = intent.ids as string[]
      assertUniqueIds(ids)
      assertValidIds(ids)
      assertNonEmptyIds(ids, intent.mode as SelectIntent['mode'])
      return
    }
    case 'pan': {
      if (!isIntentSource(source)) {
        throw new Error('EngineIntent pan source is invalid.')
      }
      if (!isPoint(intent.delta)) {
        throw new Error('EngineIntent pan delta must contain finite x and y.')
      }
      return
    }
    case 'zoom': {
      if (!isIntentSource(source)) {
        throw new Error('EngineIntent zoom source is invalid.')
      }
      if (!isFiniteNumber(intent.scaleDelta) || intent.scaleDelta <= 0) {
        throw new Error('EngineIntent zoom scaleDelta must be a finite number > 0.')
      }
      if (intent.anchor !== null && !isPoint(intent.anchor)) {
        throw new Error('EngineIntent zoom anchor must be null or a finite point.')
      }
      return
    }
    case 'drag': {
      if (!isIntentSource(source)) {
        throw new Error('EngineIntent drag source is invalid.')
      }
      if (!DRAG_PHASES.includes(intent.phase as DragIntent['phase'])) {
        throw new Error('EngineIntent drag phase is invalid.')
      }
      if (!isValidId(intent.id)) {
        throw new Error('EngineIntent drag id cannot be empty.')
      }
      if (!isPoint(intent.position)) {
        throw new Error('EngineIntent drag position must contain finite x and y.')
      }
      return
    }
    case 'marquee': {
      if (!isIntentSource(source)) {
        throw new Error('EngineIntent marquee source is invalid.')
      }
      if (!MARQUEE_PHASES.includes(intent.phase as MarqueeIntent['phase'])) {
        throw new Error('EngineIntent marquee phase is invalid.')
      }
      if (typeof intent.additive !== 'boolean') {
        throw new Error('EngineIntent marquee additive must be a boolean.')
      }
      if (!isPoint(intent.start) || !isPoint(intent.end)) {
        throw new Error('EngineIntent marquee points must contain finite x and y.')
      }
      return
    }
    case 'context-menu': {
      if (!isIntentSource(source)) {
        throw new Error('EngineIntent context-menu source is invalid.')
      }
      if (!isPoint(intent.position)) {
        throw new Error('EngineIntent context-menu position must contain finite x and y.')
      }
      if (!(intent.targetId === null || isValidId(intent.targetId))) {
        throw new Error('EngineIntent context-menu targetId must be null or a non-empty string.')
      }
      return
    }
    case 'key-command': {
      if (source !== 'keyboard') {
        throw new Error('EngineIntent key-command source must be keyboard.')
      }
      if (!KEY_COMMANDS.includes(intent.command as KeyCommandIntent['command'])) {
        throw new Error('EngineIntent key-command command is invalid.')
      }
      return
    }
    default: {
      throw new Error(`Unsupported EngineIntent type: ${String(type)}`)
    }
  }
}
