import { Component, type ErrorInfo, type ReactNode, useCallback, useEffect, useState } from 'react'
import { useInRouterContext, useNavigate } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'
import { MapView } from './MapView'
import { PixiPreviewPage } from './PixiPreviewPage'
import type { RenderEngineId } from '../../stores/uiStore'
import { ENGINE_ROUTE_POLICIES, type EngineRoutePolicyId } from './engineRoutePolicy'

interface EngineRenderBoundaryProps {
  children: ReactNode
  onError: () => void
}

class EngineRenderBoundary extends Component<EngineRenderBoundaryProps, { hasError: boolean }> {
  constructor(props: EngineRenderBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(_error: unknown, _errorInfo: ErrorInfo) {
    this.props.onError()
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

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
  const routePolicy = resolveRoutePolicy(routePolicyId, preferredEngine)
  const routePreferredEngine = routePolicy?.preferredEngine ?? preferredEngine

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

  if (effectiveEngine === 'pixi') {
    return <PixiPreviewPage />
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
