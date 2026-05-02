import { Component, type ErrorInfo, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useInRouterContext, useNavigate } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'
import { useToastStore } from '../../stores/toastStore'
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
  const setViewMode = useUIStore((s) => s.setViewMode)
  const hasFallenBackRef = useRef(false)
  const routePolicy = resolveRoutePolicy(routePolicyId, preferredEngine)
  const routePreferredEngine = routePolicy?.preferredEngine ?? preferredEngine

  const [preferRouteEngine, setPreferRouteEngine] = useState(Boolean(routePreferredEngine))
  const effectiveEngine = preferRouteEngine ? routePreferredEngine ?? renderEngine : renderEngine

  useEffect(() => {
    if (effectiveEngine === 'pixi') {
      hasFallenBackRef.current = false
    }
  }, [effectiveEngine])

  useEffect(() => {
    setPreferRouteEngine(Boolean(routePreferredEngine))
  }, [routePreferredEngine])

  useEffect(() => {
    if (!routePreferredEngine || !preferRouteEngine) return
    if (renderEngine !== routePreferredEngine) {
      setRenderEngine(routePreferredEngine)
    }
  }, [routePreferredEngine, preferRouteEngine, renderEngine, setRenderEngine])

  const fallbackToKonva = useCallback((reason: string) => {
    if (hasFallenBackRef.current) return
    hasFallenBackRef.current = true
    setPreferRouteEngine(false)
    setViewMode('2d')
    setRenderEngine(routePolicy?.fallbackEngine ?? 'konva')
    if (routePolicy?.fallbackRoute) navigateToRoute?.(routePolicy.fallbackRoute)
    useToastStore.getState().push({
      tone: 'warning',
      title: 'Switched to Konva for stability.',
      body: reason,
    })
  }, [navigateToRoute, routePolicy?.fallbackEngine, routePolicy?.fallbackRoute, setRenderEngine, setViewMode])

  if (effectiveEngine === 'pixi') {
    return (
      <EngineRenderBoundary onError={() => fallbackToKonva('Pixi failed while rendering the editor host.')}>
        <PixiPreviewPage
          onEngineFailure={(reason) => fallbackToKonva(reason)}
        />
      </EngineRenderBoundary>
    )
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
