const PIXI_NODE_PREFIX = 'element:'

export function createPixiNodeId(elementId: string): string {
  const normalized = elementId.trim()
  if (!normalized) {
    throw new Error('createPixiNodeId requires a non-empty element id.')
  }
  return `${PIXI_NODE_PREFIX}${normalized}`
}

export function parsePixiNodeId(nodeId: string): string | null {
  if (!nodeId.startsWith(PIXI_NODE_PREFIX)) return null
  const raw = nodeId.slice(PIXI_NODE_PREFIX.length).trim()
  return raw.length > 0 ? raw : null
}
