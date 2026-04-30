import { getDefaults } from '../../../lib/constants'
import type { LibraryItem } from './ElementLibrary'

/**
 * 24x18 inline SVG thumbnail for a library tile. These previews mirror
 * the canvas symbols closely enough that dragging from the library does
 * not feel like a downgrade from a polished icon to a plain block.
 */
const W = 24
const H = 18

function bboxScale(itemW: number, itemH: number) {
  // Reserve 1px padding so strokes don't clip at the edge.
  const availW = W - 2
  const availH = H - 2
  const scale = Math.min(availW / itemW, availH / itemH)
  const w = itemW * scale
  const h = itemH * scale
  const x = (W - w) / 2
  const y = (H - h) / 2
  return { x, y, w, h }
}

interface Props {
  item: LibraryItem
}

export function LibraryPreview({ item }: Props) {
  const d = getDefaults(item.type, item.shape) || {
    width: 60, height: 60, fill: '#F3F4F6', stroke: '#6B7280',
  }
  const fill = d.fill
  const stroke = d.stroke

  const key = `${item.type}${item.shape ? `/${item.shape}` : ''}`

  // Special-cased silhouettes -------------------------------------------------
  if (item.type === 'desk' || item.type === 'hot-desk') {
    if (key === 'desk/l-shape' || key === 'hot-desk/l-shape') {
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
          <path d="M3 3h18v12h-6V8H3z" fill={fill} stroke={stroke} strokeLinejoin="round" />
          <rect x={5} y={5} width={8} height={2.5} rx="1" fill="#fff" opacity="0.65" />
        </svg>
      )
    }

    if (key === 'desk/cubicle' || key === 'hot-desk/cubicle') {
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
          <path d="M4 3h16v12M4 3v12M4 15h5M15 15h5" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          <rect x={6} y={8} width={12} height={5} rx="1.5" fill={fill} stroke={stroke} />
        </svg>
      )
    }

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={3} y={5} width={18} height={9} rx="2" fill={fill} stroke={stroke} />
        <rect x={5} y={7} width={14} height={2} rx="1" fill="#fff" opacity="0.7" />
        <circle cx={12} cy={15.5} r="1.4" fill={stroke} opacity="0.75" />
      </svg>
    )
  }

  if (item.type === 'workstation') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={5} width={20} height={8} rx="2" fill={fill} stroke={stroke} />
        <line x1={12} y1={5} x2={12} y2={13} stroke={stroke} opacity="0.65" />
        <circle cx={6} cy={4} r="1.5" fill="#E5E7EB" stroke={stroke} />
        <circle cx={18} cy={4} r="1.5" fill="#E5E7EB" stroke={stroke} />
        <circle cx={6} cy={14} r="1.5" fill="#E5E7EB" stroke={stroke} />
        <circle cx={18} cy={14} r="1.5" fill="#E5E7EB" stroke={stroke} />
      </svg>
    )
  }

  if (item.type === 'private-office') {
    if (key === 'private-office/u-shape') {
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
          <path d="M4 3h4v8h8V3h4v12H4z" fill={fill} stroke={stroke} strokeLinejoin="round" />
          <path d="M9 6h6" stroke="#fff" strokeWidth="1.4" opacity="0.8" />
        </svg>
      )
    }

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={3} y={3} width={18} height={12} rx="2" fill={fill} stroke={stroke} />
        <rect x={6} y={6} width={12} height={5} rx="1.5" fill="#fff" stroke={stroke} opacity="0.75" />
        <path d="M10 15h4" stroke="#fff" strokeWidth="2" />
      </svg>
    )
  }

  if (item.type === 'conference-room') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={2} width={20} height={14} rx="2.5" fill={fill} stroke={stroke} />
        <rect x={6} y={6} width={12} height={6} rx="2" fill="#fff" stroke={stroke} opacity="0.75" />
        {[5, 9, 15, 19].map((x) => <circle key={`top-${x}`} cx={x} cy={4} r="1" fill={stroke} opacity="0.75" />)}
        {[5, 9, 15, 19].map((x) => <circle key={`bot-${x}`} cx={x} cy={14} r="1" fill={stroke} opacity="0.75" />)}
      </svg>
    )
  }

  if (item.type === 'phone-booth') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={7} y={2} width={10} height={14} rx="2" fill={fill} stroke={stroke} />
        <path d="M10 5c2 1 2 4 0 5" stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <circle cx={14} cy={13} r="0.8" fill={stroke} />
      </svg>
    )
  }

  if (item.type === 'common-area') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={4} width={20} height={10} rx="3" fill={fill} stroke={stroke} />
        <path d="M6 11h12M6 8h4m4 0h4" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      </svg>
    )
  }

  if (item.type === 'ellipse' || item.type === 'table-round') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <ellipse cx={W / 2} cy={H / 2} rx={W / 2 - 4} ry={H / 2 - 3} fill={fill} stroke={stroke} />
        {[0, 1, 2, 3].map((i) => {
          const angle = (Math.PI / 2) * i
          return (
            <circle
              key={i}
              cx={12 + Math.cos(angle) * 8.5}
              cy={9 + Math.sin(angle) * 6}
              r="1.2"
              fill={stroke}
              opacity="0.75"
            />
          )
        })}
      </svg>
    )
  }

  if (item.type === 'table-oval') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <ellipse cx={W / 2} cy={H / 2} rx={W / 2 - 3} ry={H / 2 - 5} fill={fill} stroke={stroke} />
        <path d="M7 9h10" stroke="#fff" strokeWidth="1.4" opacity="0.75" />
      </svg>
    )
  }

  if (item.type === 'table-rect' || item.type === 'table-conference') {
    const tableX = item.type === 'table-conference' ? 2 : 4
    const tableW = item.type === 'table-conference' ? 20 : 16
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={tableX} y={5} width={tableW} height={8} rx="2" fill={fill} stroke={stroke} />
        <path d="M7 9h10" stroke="#fff" strokeWidth="1.2" opacity="0.75" />
        {[4, 8, 16, 20].map((x) => <circle key={`top-${x}`} cx={x} cy={4} r="1" fill={stroke} opacity="0.7" />)}
        {[4, 8, 16, 20].map((x) => <circle key={`bot-${x}`} cx={x} cy={14} r="1" fill={stroke} opacity="0.7" />)}
      </svg>
    )
  }

  if (key === 'decor/column') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <circle cx={W / 2} cy={H / 2} r={4} fill={fill} stroke={stroke} />
      </svg>
    )
  }

  if (key === 'decor/stairs') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={2} width={W - 4} height={H - 4} fill={fill} stroke={stroke} />
        <line x1={4} y1={7} x2={W - 4} y2={7} stroke={stroke} />
        <line x1={4} y1={10} x2={W - 4} y2={10} stroke={stroke} />
        <line x1={4} y1={13} x2={W - 4} y2={13} stroke={stroke} />
      </svg>
    )
  }

  if (key === 'decor/elevator') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={2} width={W - 4} height={H - 4} fill={fill} stroke={stroke} />
        <line x1={5} y1={5} x2={W - 5} y2={H - 5} stroke={stroke} />
        <line x1={W - 5} y1={5} x2={5} y2={H - 5} stroke={stroke} />
      </svg>
    )
  }

  if (key === 'decor/couch') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={5} width={W - 4} height={H - 7} fill={fill} stroke={stroke} rx={3} />
        <rect x={3} y={7} width={3} height={H - 10} fill={stroke} opacity="0.35" rx="1.5" />
        <rect x={W - 6} y={7} width={3} height={H - 10} fill={stroke} opacity="0.35" rx="1.5" />
      </svg>
    )
  }

  if (key === 'decor/whiteboard') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={6} width={W - 4} height={H - 12} fill={fill} stroke={stroke} />
      </svg>
    )
  }

  if (key === 'decor/reception') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={3} width={W - 4} height={5} fill={fill} stroke={stroke} />
        <rect x={2} y={10} width={W - 4} height={5} fill={fill} stroke={stroke} />
      </svg>
    )
  }

  if (key === 'decor/kitchen-counter' || item.type === 'counter') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={5} width={W - 4} height={H - 10} fill={fill} stroke={stroke} />
        <line x1={W / 2} y1={5} x2={W / 2} y2={H - 5} stroke={stroke} />
      </svg>
    )
  }

  if (key === 'decor/fridge') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={6} y={2} width={W - 12} height={H - 4} fill={fill} stroke={stroke} />
        <line x1={6} y1={H / 2} x2={W - 6} y2={H / 2} stroke={stroke} />
      </svg>
    )
  }

  if (key === 'decor/armchair' || item.type === 'chair') {
    // Chair: rect seat + semicircle back.
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={4} y={8} width={W - 8} height={H - 10} fill={fill} stroke={stroke} rx={1} />
        <path d={`M 4,8 A 7 7 0 0 1 ${W - 4} 8`} fill="none" stroke={stroke} />
      </svg>
    )
  }

  if (key === 'desk/l-shape') {
    // L shape: two rects.
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={2} width={W - 4} height={6} fill={fill} stroke={stroke} />
        <rect x={2} y={8} width={10} height={H - 10} fill={fill} stroke={stroke} />
      </svg>
    )
  }

  if (item.type === 'planter') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <circle cx={9} cy={8} r={4} fill={fill} stroke={stroke} />
        <circle cx={15} cy={8} r={4} fill="#BBF7D0" stroke={stroke} />
        <circle cx={12} cy={11} r={4} fill="#86EFAC" stroke={stroke} />
        <rect x={8} y={13} width={8} height={3} rx="1" fill="#A16207" stroke={stroke} strokeWidth="0.75" />
      </svg>
    )
  }

  if (item.type === 'sofa') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={5} width={W - 4} height={H - 8} fill={fill} stroke={stroke} rx={4} />
        <rect x={3} y={7} width={4} height={H - 11} fill={stroke} opacity="0.35" rx="2" />
        <rect x={W - 7} y={7} width={4} height={H - 11} fill={stroke} opacity="0.35" rx="2" />
      </svg>
    )
  }

  if (item.type === 'plant') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <circle cx={9} cy={7} r={4} fill={fill} stroke={stroke} />
        <circle cx={15} cy={7} r={4} fill="#BBF7D0" stroke={stroke} />
        <circle cx={12} cy={10} r={4.5} fill="#86EFAC" stroke={stroke} />
        <rect x={8} y={13} width={8} height={3} rx="1" fill="#A16207" stroke={stroke} strokeWidth="0.75" />
      </svg>
    )
  }

  if (item.type === 'printer') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={5} y={6} width={14} height={9} rx="2" fill={fill} stroke={stroke} />
        <rect x={7} y={3} width={10} height={5} rx="1" fill="#fff" stroke={stroke} />
        <rect x={8} y={10} width={8} height={2} rx="1" fill="#fff" stroke={stroke} strokeWidth="0.75" />
      </svg>
    )
  }

  if (item.type === 'whiteboard') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={6} width={20} height={7} rx="1" fill="#fff" stroke={stroke} />
        <path d="M5 11h5m3-2h5" stroke={stroke} strokeWidth="1" opacity="0.55" strokeLinecap="round" />
      </svg>
    )
  }

  if (item.type === 'text-label' || item.type === 'free-text') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={2} width={W - 4} height={H - 4} fill="#F9FAFB" stroke={stroke} />
        <text
          x={W / 2}
          y={H / 2 + 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={stroke}
        >T</text>
      </svg>
    )
  }

  if (item.type === 'line-shape') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <line x1={3} y1={H - 3} x2={W - 3} y2={3} stroke={stroke} strokeWidth={1.5} />
      </svg>
    )
  }

  if (item.type === 'arrow') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <defs>
          <marker id="lp-arrow-head" markerWidth={5} markerHeight={5} refX={4} refY={2.5} orient="auto">
            <path d="M 0 0 L 5 2.5 L 0 5 z" fill={stroke} />
          </marker>
        </defs>
        <line
          x1={3}
          y1={H / 2}
          x2={W - 5}
          y2={H / 2}
          stroke={stroke}
          strokeWidth={1.5}
          markerEnd="url(#lp-arrow-head)"
        />
      </svg>
    )
  }

  if (item.type === 'custom-shape') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={3} y={3} width={W - 6} height={H - 6} fill="#F9FAFB" stroke={stroke} strokeDasharray="3 2" rx="2" />
        <path d="M7 12l4-6 4 4 3-5" stroke={stroke} strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      </svg>
    )
  }

  if (item.type === 'custom-svg' && item.svgSource) {
    // Render the user's uploaded SVG inline at preview size. We can't
    // guarantee its internal viewBox fills the 24×18 box, so we wrap it
    // in a container that pin-fills using CSS (object-fit style).
    // SECURITY: svgSource has already been sanitised at upload time
    // (sanitizeSvg strips <script>, on* handlers, foreignObject). Any
    // further exposure surface would be CSS / external resource refs,
    // which are mitigated by `display:block; overflow:hidden` and the
    // fact that the user uploaded this themselves.
    return (
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: W,
          height: H,
          overflow: 'hidden',
          lineHeight: 0,
        }}
        // svgSource is sanitised above (sanitizeSvg); inlining is intentional
        // so the preview scales crisply with CSS instead of rasterising.
        dangerouslySetInnerHTML={{
          __html: item.svgSource.replace(
            /<svg\b/i,
            `<svg preserveAspectRatio="xMidYMid meet" width="${W}" height="${H}"`,
          ),
        }}
      />
    )
  }

  // Default: proportional rect matching the element's natural w/h (so a
  // long conference table reads as long, a square desk as square).
  const { x, y, w, h } = bboxScale(d.width, d.height)
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} rx={1} />
    </svg>
  )
}
