import { useCallback, useEffect, useState } from 'react'
import { useInRouterContext, useNavigate } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'
import { useToastStore } from '../../stores/toastStore'
import { MapView } from './MapView'
import { PixiPreviewPage } from './PixiPreviewPage'
import type { RenderEngineId } from '../../stores/uiStore'
import { ENGINE_ROUTE_POLICIES, type EngineRoutePolicyId } from './engineRoutePolicy'

interface EngineHostProps {
  routePolicyId?: EngineRoutePolicyId
  preferredEngine?: RenderEngineId
}

interface EngineHostBaseProps extends EngineHostProps {
  navigateToRoute?: (route: string) => void
}

function resolveRoutePolicy(routePolicyId?: EngineRoutePolicyId, preferredEngine?: RenderEngineId) {
  if (routePolicyId) return ENGINE_ROUTE_POLICIES[routePolicyId]
  if (preferredEngine === 'konva') return ENGINE_ROUTE_POLICIES.map
  if (preferredEngine === 'pixi') return ENGINE_ROUTE_POLICIES.pixi
  return null
}

function EngineHostBase({ routePolicyId, preferredEngine, navigateToRoute }: EngineHostBaseProps = {}) {
  const renderEngine = useUIStore((s) => s.renderEngine)
  const setRenderEngine = useUIStore((s) => s.setRenderEngine)
  const showToast = useToastStore((s) => s.push)
  const routePolicy = resolveRoutePolicy(routePolicyId, preferredEngine)
  const routePreferredEngine = routePolicy?.preferredEngine ?? preferredEngine
  const fallbackRoute = routePolicy?.id === 'pixi' ? '/map' : null

  const [preferRouteEngine, setPreferRouteEngine] = useState(Boolean(routePreferredEngine))
  const effectiveEngine = preferRouteEngine ? routePreferredEngine ?? renderEngine : renderEngine

  useEffect(() => {
    setPreferRouteEngine(Boolean(routePreferredEngine))
  }, [routePreferredEngine])

  useEffect(() => {
    if (!routePreferredEngine || !preferRouteEngine) return
    if (renderEngine !== routePreferredEngine) {
      setRenderEngine(routePreferredEngine)
    }
  }, [routePreferredEngine, preferRouteEngine, renderEngine, setRenderEngine])

  const handleEngineFailure = useCallback(
    (reason: string) => {
      if (routePolicy?.preferredEngine === 'pixi') {
        setRenderEngine('konva')
        useUIStore.setState({ viewMode: '2d' })
        showToast({
          tone: 'warning',
          title: 'Pixi preview failed; switched back to Konva',
          body: reason,
        })
        if (fallbackRoute && navigateToRoute) {
          navigateToRoute(fallbackRoute)
        }
        return
      }

      setRenderEngine('konva')
      useUIStore.setState({ viewMode: '2d' })
      showToast({
        tone: 'warning',
        title: 'Renderer failed; switched back to Konva',
        body: reason,
      })
    },
    [fallbackRoute, navigateToRoute, routePolicy?.preferredEngine, setRenderEngine, showToast],
  )

  if (effectiveEngine === 'pixi') {
    return <PixiPreviewPage onEngineFailure={handleEngineFailure} />
  }

  return <MapView />
}

function EngineHostWithRouter(props: EngineHostProps) {
  const navigate = useNavigate()
  const navigateToRoute = useCallback((route: string) => {
    navigate(route, { replace: true })
  }, [navigate])

  return <EngineHostBase {...props} navigateToRoute={navigateToRoute} />
}

export function EngineHost(props: EngineHostProps = {}) {
  const inRouterContext = useInRouterContext()
  if (!inRouterContext) {
    return <EngineHostBase {...props} />
  }
  return <EngineHostWithRouter {...props} />
}
