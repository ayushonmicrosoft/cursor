import { Component, type ErrorInfo, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useInRouterContext, useNavigate } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'
import { useToastStore } from '../../stores/toastStore'
import { MapView } from './MapView'
import { PixiPreviewPage } from './PixiPreviewPage'
import type { RenderEngineId } from '../../stores/uiStore'

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
  preferredEngine?: RenderEngineId
}

interface EngineHostBaseProps extends EngineHostProps {
  navigateToMap?: () => void
}

function EngineHostBase({ preferredEngine, navigateToMap }: EngineHostBaseProps = {}) {
  const renderEngine = useUIStore((s) => s.renderEngine)
  const setRenderEngine = useUIStore((s) => s.setRenderEngine)
  const setViewMode = useUIStore((s) => s.setViewMode)
  const hasFallenBackRef = useRef(false)

  const [preferRouteEngine, setPreferRouteEngine] = useState(Boolean(preferredEngine))
  const effectiveEngine = preferRouteEngine ? preferredEngine ?? renderEngine : renderEngine

  useEffect(() => {
    if (effectiveEngine === 'pixi') {
      hasFallenBackRef.current = false
    }
  }, [effectiveEngine])

  useEffect(() => {
    setPreferRouteEngine(Boolean(preferredEngine))
  }, [preferredEngine])

  useEffect(() => {
    if (!preferredEngine || !preferRouteEngine) return
    if (renderEngine !== preferredEngine) {
      setRenderEngine(preferredEngine)
    }
  }, [preferredEngine, preferRouteEngine, renderEngine, setRenderEngine])

  const fallbackToKonva = useCallback((reason: string) => {
    if (hasFallenBackRef.current) return
    hasFallenBackRef.current = true
    setPreferRouteEngine(false)
    setViewMode('2d')
    setRenderEngine('konva')
    if (preferredEngine === 'pixi') navigateToMap?.()
    useToastStore.getState().push({
      tone: 'warning',
      title: 'Switched to Konva for stability.',
      body: reason,
    })
  }, [navigateToMap, preferredEngine, setRenderEngine, setViewMode])

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
  const navigateToMap = useCallback(() => {
    navigate('../map', { replace: true })
  }, [navigate])

  return <EngineHostBase {...props} navigateToMap={navigateToMap} />
}

export function EngineHost(props: EngineHostProps = {}) {
  const inRouterContext = useInRouterContext()
  if (!inRouterContext) {
    return <EngineHostBase {...props} />
  }
  return <EngineHostWithRouter {...props} />
}
