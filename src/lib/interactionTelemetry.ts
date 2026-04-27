export type InteractionIssueEventName =
  | 'selection.failure'
  | 'toolbar.layout.anomaly'

export interface InteractionIssueEvent {
  name: InteractionIssueEventName
  timestamp: string
  payload: Record<string, unknown>
}

const EVENT_BUFFER_LIMIT = 200
const eventBuffer: InteractionIssueEvent[] = []

function writeEvent(name: InteractionIssueEventName, payload: Record<string, unknown>) {
  const event: InteractionIssueEvent = {
    name,
    timestamp: new Date().toISOString(),
    payload,
  }
  eventBuffer.push(event)
  if (eventBuffer.length > EVENT_BUFFER_LIMIT) {
    eventBuffer.splice(0, eventBuffer.length - EVENT_BUFFER_LIMIT)
  }

  if (
    import.meta.env.MODE !== 'test' &&
    typeof console !== 'undefined' &&
    typeof console.warn === 'function'
  ) {
    console.warn('[interaction-telemetry]', event)
  }
}

export function recordSelectionFailure(payload: {
  source: string
  attemptedIds: string[]
  missingIds: string[]
}) {
  writeEvent('selection.failure', payload)
}

export function recordToolbarLayoutAnomaly(payload: {
  source: string
  toolbarId: string
  reason: string
  details?: Record<string, unknown>
}) {
  writeEvent('toolbar.layout.anomaly', payload)
}

export function getInteractionIssueEvents(): InteractionIssueEvent[] {
  return [...eventBuffer]
}

export function clearInteractionIssueEvents() {
  eventBuffer.length = 0
}
