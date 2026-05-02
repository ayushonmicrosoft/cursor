const ELEMENT_NODE_PREFIX = 'element-'

export function createKonvaNodeId(elementId: string): string {
  const normalized = elementId.trim()
  if (!normalized) {
    throw new Error('createKonvaNodeId requires a non-empty element id.')
  }
  return `${ELEMENT_NODE_PREFIX}${normalized}`
}

export function parseKonvaNodeId(nodeId: string): string | null {
  if (!nodeId.startsWith(ELEMENT_NODE_PREFIX)) return null
  const raw = nodeId.slice(ELEMENT_NODE_PREFIX.length).trim()
  return raw.length > 0 ? raw : null
}
