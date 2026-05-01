import type { RenderEngineId } from '../../stores/uiStore'

export type EngineRoutePolicyId = 'map' | 'pixi'

export interface EngineRoutePolicy {
  id: EngineRoutePolicyId
  preferredEngine: RenderEngineId
  fallbackEngine: RenderEngineId
  fallbackRoute: string | null
}

export const ENGINE_ROUTE_POLICIES: Record<EngineRoutePolicyId, EngineRoutePolicy> = {
  map: {
    id: 'map',
    preferredEngine: 'konva',
    fallbackEngine: 'konva',
    fallbackRoute: null,
  },
  pixi: {
    id: 'pixi',
    preferredEngine: 'pixi',
    fallbackEngine: 'konva',
    fallbackRoute: '../map',
  },
}
