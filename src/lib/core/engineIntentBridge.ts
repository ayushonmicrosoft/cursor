import type { EngineIntent } from './engineIntents'
import { useUIStore } from '../../stores/uiStore'

/**
 * Runtime bridge from adapter-level intents to editor stores.
 * This runs in parallel with legacy stage-local handlers while migration
 * is in progress. The bridge stays in observe-only mode until intent
 * parity and conflict gates are complete.
 */
export const ENGINE_RUNTIME_BRIDGE_MODE = 'observe' as const

const deferredIntentTypes = new Set<EngineIntent['type']>()

function noteDeferredIntent(intent: EngineIntent) {
  if (!import.meta.env.DEV) return
  if (deferredIntentTypes.has(intent.type)) return
  deferredIntentTypes.add(intent.type)
  console.info(`[engine-intent-bridge] observe mode defers "${intent.type}" intents.`)
}

export function applyEngineIntent(intent: EngineIntent): void {
  if (ENGINE_RUNTIME_BRIDGE_MODE === 'observe') {
    noteDeferredIntent(intent)
    return
  }

  switch (intent.type) {
    case 'select': {
      const ui = useUIStore.getState()
      if (intent.mode === 'replace') {
        ui.setSelectedIds(intent.ids)
        return
      }
      if (intent.mode === 'add') {
        for (const id of intent.ids) {
          if (!ui.selectedIds.includes(id)) {
            ui.addToSelection(id)
          }
        }
        return
      }
      if (intent.mode === 'remove') {
        for (const id of intent.ids) {
          ui.removeFromSelection(id)
        }
        return
      }
      for (const id of intent.ids) {
        ui.toggleSelection(id)
      }
      return
    }
    case 'context-menu': {
      useUIStore.getState().setContextMenu({
        x: intent.position.x,
        y: intent.position.y,
        elementId: intent.targetId,
      })
      return
    }
    case 'pan':
    case 'zoom':
    case 'drag':
    case 'marquee':
    case 'key-command': {
      // These remain owned by existing stage-local flows for now.
      return
    }
    default: {
      const neverIntent: never = intent
      throw new Error(`Unsupported engine intent: ${String(neverIntent)}`)
    }
  }
}
