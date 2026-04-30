import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

/**
 * Engine comparison landing page.
 *
 * Shown before entering the editor so the admin can choose between the
 * stable Konva (Canvas 2D) renderer and the experimental PixiJS (WebGL)
 * renderer for side-by-side evaluation.
 */
export function EngineChooserPage() {
  const navigate = useNavigate()
  const [hoveredEngine, setHoveredEngine] = useState<'konva' | 'pixi' | null>(null)

  function pick(engine: 'konva' | 'pixi') {
    navigate(engine === 'pixi' ? '../pixi' : '../map', { replace: true })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#e2e8f0',
        overflow: 'hidden',
      }}
    >
      {/* Decorative grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.08) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Glow orb behind cards */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background:
            hoveredEngine === 'pixi'
              ? 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)'
              : hoveredEngine === 'konva'
                ? 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(100,116,139,0.08) 0%, transparent 70%)',
          transition: 'background 0.5s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: 48 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#64748b',
            marginBottom: 12,
          }}
        >
          Rendering Engine
        </p>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            margin: 0,
            background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}
        >
          Choose Your Engine
        </h1>
        <p
          style={{
            fontSize: 15,
            color: '#94a3b8',
            marginTop: 12,
            maxWidth: 420,
            lineHeight: 1.6,
          }}
        >
          Compare both rendering pipelines as separate pages.
          Konva opens the production editor. Pixi opens an isolated preview.
        </p>
      </div>

      {/* Engine Cards */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          gap: 28,
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '0 24px',
        }}
      >
        {/* Konva Card */}
        <button
          type="button"
          onClick={() => pick('konva')}
          onMouseEnter={() => setHoveredEngine('konva')}
          onMouseLeave={() => setHoveredEngine(null)}
          style={{
            position: 'relative',
            width: 280,
            padding: '36px 28px 32px',
            background:
              hoveredEngine === 'konva'
                ? 'linear-gradient(145deg, rgba(14,165,233,0.12) 0%, rgba(30,41,59,0.95) 100%)'
                : 'rgba(30,41,59,0.6)',
            border:
              hoveredEngine === 'konva'
                ? '1px solid rgba(14,165,233,0.4)'
                : '1px solid rgba(71,85,105,0.3)',
            borderRadius: 16,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s ease',
            transform: hoveredEngine === 'konva' ? 'translateY(-4px)' : 'translateY(0)',
            boxShadow:
              hoveredEngine === 'konva'
                ? '0 20px 60px rgba(14,165,233,0.15), 0 0 0 1px rgba(14,165,233,0.1)'
                : '0 4px 24px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(12px)',
            fontFamily: 'inherit',
            color: 'inherit',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 4px 16px rgba(14,165,233,0.3)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700 }}>Konva</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'rgba(14,165,233,0.15)',
                color: '#38bdf8',
                padding: '3px 8px',
                borderRadius: 6,
              }}
            >
              Stable
            </span>
          </div>

          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            Canvas 2D rendering. Battle-tested with full feature support —
            selection, alignment guides, minimap, hover cards, and all overlays.
          </p>

          <div
            style={{
              marginTop: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {['Full feature parity', 'All overlays & tools', 'Stable for production'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#cbd5e1' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </button>

        {/* Pixi Card */}
        <button
          type="button"
          onClick={() => pick('pixi')}
          onMouseEnter={() => setHoveredEngine('pixi')}
          onMouseLeave={() => setHoveredEngine(null)}
          style={{
            position: 'relative',
            width: 280,
            padding: '36px 28px 32px',
            background:
              hoveredEngine === 'pixi'
                ? 'linear-gradient(145deg, rgba(99,102,241,0.12) 0%, rgba(30,41,59,0.95) 100%)'
                : 'rgba(30,41,59,0.6)',
            border:
              hoveredEngine === 'pixi'
                ? '1px solid rgba(99,102,241,0.4)'
                : '1px solid rgba(71,85,105,0.3)',
            borderRadius: 16,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s ease',
            transform: hoveredEngine === 'pixi' ? 'translateY(-4px)' : 'translateY(0)',
            boxShadow:
              hoveredEngine === 'pixi'
                ? '0 20px 60px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.1)'
                : '0 4px 24px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(12px)',
            fontFamily: 'inherit',
            color: 'inherit',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
            </svg>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700 }}>PixiJS</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'rgba(251,191,36,0.15)',
                color: '#fbbf24',
                padding: '3px 8px',
                borderRadius: 6,
              }}
            >
              Experimental
            </span>
          </div>

          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            Isolated PixiJS rendering. It runs outside the Konva map page so a
            Pixi issue cannot mount inside the production editor canvas.
          </p>

          <div
            style={{
              marginTop: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {['Separate route and lifecycle', 'Editable Pixi canvas', 'Limited overlay support'].map((item, i) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#cbd5e1' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={i < 2 ? '#6366f1' : '#f59e0b'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {i < 2 ? (
                    <polyline points="20 6 9 17 4 12" />
                  ) : (
                    <>
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </>
                  )}
                </svg>
                {item}
              </div>
            ))}
          </div>
        </button>
      </div>

      {/* Footer hint */}
      <p
        style={{
          position: 'relative',
          marginTop: 40,
          fontSize: 12,
          color: '#475569',
        }}
      >
        You can return to this chooser from the office URL root.
      </p>
    </div>
  )
}
