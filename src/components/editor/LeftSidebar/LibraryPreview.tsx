import { getDefaults } from '../../../lib/constants'
import type { LibraryItem } from './elementLibraryModel'

/**
 * 24x18 inline SVG thumbnail for a library tile. These previews mirror
 * the canvas symbols closely enough that dragging from the library does
 * not feel like a downgrade from a polished icon to a plain block.
 */
const W = 24
const H = 18
const CHAIR_FILL = '#F8FAFC'
const GLASS_FILL = '#E0F2FE'
const DETAIL_STROKE = '#64748B'
const R = 0.75

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

function Chair({
  x,
  y,
  width = 2.8,
  height = 2,
  stroke,
}: {
  x: number
  y: number
  width?: number
  height?: number
  stroke: string
}) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx="0.45"
      fill={CHAIR_FILL}
      stroke={stroke}
      strokeWidth="0.75"
    />
  )
}

function PlanLine({
  d,
  opacity = 0.65,
  stroke = DETAIL_STROKE,
}: {
  d: string
  opacity?: number
  stroke?: string
}) {
  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="square"
      strokeLinejoin="miter"
      opacity={opacity}
    />
  )
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
  if (item.kit) {
    switch (item.kit) {
      case 'bench-2':
      case 'bench-4':
      case 'bench-6':
      case 'bench-8': {
        const seats = item.kit === 'bench-2' ? 2 : item.kit === 'bench-4' ? 4 : item.kit === 'bench-6' ? 6 : 8
        const rowSeats = seats <= 4 ? seats : seats / 2
        return (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
            <rect x={2} y={6.2} width={20} height={5.6} rx={R} fill={fill} stroke={stroke} />
            <line x1={2} y1={9} x2={22} y2={9} stroke={stroke} opacity="0.45" />
            {Array.from({ length: rowSeats }).map((_, i) => {
              const x = 3.2 + (17 / Math.max(1, rowSeats - 1)) * i
              return <Chair key={`kit-bench-top-${i}`} x={x} y={2.7} width={2.6} height={1.9} stroke={stroke} />
            })}
            {(seats > 4 ? Array.from({ length: rowSeats }) : []).map((_, i) => {
              const x = 3.2 + (17 / Math.max(1, rowSeats - 1)) * i
              return <Chair key={`kit-bench-bottom-${i}`} x={x} y={13.4} width={2.6} height={1.9} stroke={stroke} />
            })}
            {seats <= 4 && <PlanLine d="M12 6.4v5.2" stroke={stroke} opacity={0.45} />}
          </svg>
        )
      }
      case 'sit-stand':
        return (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
            <rect x={3} y={5} width={18} height={7.8} rx={R} fill={fill} stroke={stroke} />
            <rect x={5} y={6.5} width={5} height={2.4} rx="0.4" fill="#fff" stroke={stroke} opacity="0.72" />
            <rect x={13.5} y={6.5} width={4.8} height={2.4} rx="0.4" fill="#fff" stroke={stroke} opacity="0.72" />
            <PlanLine d="M7 12.8v2.3M17 12.8v2.3" stroke={stroke} opacity={0.6} />
            <Chair x={9.4} y={14} width={5.2} height={2.2} stroke={stroke} />
          </svg>
        )
      case 'premium-chair':
        return (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
            <rect x={7} y={3} width={10} height={4.2} rx="1.1" fill="#fff" stroke={stroke} />
            <rect x={5.2} y={7} width={13.6} height={7.2} rx="1.2" fill={fill} stroke={stroke} />
            <path d="M7 8.2c2 1.1 8 1.1 10 0M12 14.2v2.2M8.6 16.4h6.8" stroke={stroke} strokeWidth="0.8" fill="none" opacity="0.65" />
            <rect x={4} y={8.3} width={2.4} height={4.8} rx="0.7" fill="#fff" stroke={stroke} />
            <rect x={17.6} y={8.3} width={2.4} height={4.8} rx="0.7" fill="#fff" stroke={stroke} />
          </svg>
        )
      case 'huddle-room':
      case 'boardroom':
        return (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
            <rect x={2} y={2} width={20} height={14} rx={R} fill={GLASS_FILL} stroke={stroke} opacity="0.65" />
            <rect x={item.kit === 'boardroom' ? 5 : 7} y={6.2} width={item.kit === 'boardroom' ? 14 : 10} height={5.5} rx={R} fill={fill} stroke={stroke} />
            {[5, 9.5, 14.5, 19].map((x) => <Chair key={`kit-room-top-${x}`} x={x - 1.1} y={3.2} width={2.2} height={1.7} stroke={stroke} />)}
            {[5, 9.5, 14.5, 19].map((x) => <Chair key={`kit-room-bottom-${x}`} x={x - 1.1} y={13.1} width={2.2} height={1.7} stroke={stroke} />)}
          </svg>
        )
      case 'focus-pod-row':
        return (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
            {[3, 9, 15].map((x, i) => (
              <g key={i}>
                <rect x={x} y={2.5} width={6} height={13} rx={R} fill={fill} stroke={stroke} />
                <rect x={x + 1.4} y={5} width={3.2} height={5.4} rx="0.5" fill="#fff" stroke={stroke} opacity="0.75" />
              </g>
            ))}
          </svg>
        )
      case 'lounge':
        return (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
            <rect x={5} y={11} width={14} height={4.8} rx={R} fill={fill} stroke={stroke} />
            <rect x={3} y={4.5} width={5.2} height={5} rx={R} fill="#fff" stroke={stroke} />
            <rect x={15.8} y={4.5} width={5.2} height={5} rx={R} fill="#fff" stroke={stroke} />
            <ellipse cx={12} cy={8.7} rx={3.2} ry={2.2} fill="#fff" stroke={stroke} />
            <circle cx={20} cy={13.5} r={2.2} fill="#86EFAC" stroke={stroke} />
          </svg>
        )
      case 'reception':
        return (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
            <path d="M3 4h17v4H8v4H3z" fill={fill} stroke={stroke} strokeLinejoin="miter" />
            <Chair x={6} y={13.2} width={3.4} height={2.2} stroke={stroke} />
            <Chair x={11} y={13.2} width={3.4} height={2.2} stroke={stroke} />
            <circle cx={19} cy={13} r={2.3} fill="#86EFAC" stroke={stroke} />
          </svg>
        )
      case 'copy-zone':
        return (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
            <rect x={3} y={3.5} width={18} height={3.6} rx={R} fill={fill} stroke={stroke} />
            <rect x={5} y={9} width={6.5} height={6} rx="1" fill="#E2E8F0" stroke={stroke} />
            <rect x={13.4} y={9.5} width={6} height={4.8} rx="0.8" fill="#fff" stroke={stroke} opacity="0.82" />
            <PlanLine d="M15 12h3" stroke={stroke} opacity={0.55} />
          </svg>
        )
    }
  }

  if (item.type === 'desk' || item.type === 'hot-desk') {
    if (key === 'desk/l-shape' || key === 'hot-desk/l-shape') {
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
          <path d="M3 3h18v11h-5.5V8.5H3z" fill={fill} stroke={stroke} strokeLinejoin="miter" />
          <rect x={5} y={5} width={8} height={1.8} rx="0.35" fill="#fff" opacity="0.7" />
          <Chair x={9.4} y={14} width={4} height={2} stroke={stroke} />
        </svg>
      )
    }

    if (key === 'desk/cubicle' || key === 'hot-desk/cubicle') {
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
          <path d="M4 3h16v12M4 3v12M4 15h5M15 15h5" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="square" />
          <rect x={6} y={7.5} width={12} height={5} rx={R} fill={fill} stroke={stroke} />
          <PlanLine d="M8 6h8" stroke={stroke} />
        </svg>
      )
    }

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={3} y={5} width={18} height={8.5} rx={R} fill={fill} stroke={stroke} />
        <rect x={5} y={7} width={14} height={1.7} rx="0.35" fill="#fff" opacity="0.72" />
        <PlanLine d="M6 10.8h12" stroke={stroke} opacity={0.42} />
        <Chair x={9.5} y={14.1} width={5} height={2.2} stroke={stroke} />
      </svg>
    )
  }

  if (item.type === 'workstation') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={5.2} width={20} height={7.6} rx={R} fill={fill} stroke={stroke} />
        <line x1={7} y1={5.2} x2={7} y2={12.8} stroke={stroke} opacity="0.45" />
        <line x1={12} y1={5.2} x2={12} y2={12.8} stroke={stroke} opacity="0.55" />
        <line x1={17} y1={5.2} x2={17} y2={12.8} stroke={stroke} opacity="0.45" />
        {[3.4, 8.4, 13.4, 18.4].map((x) => <Chair key={`bench-top-${x}`} x={x} y={2.2} stroke={stroke} />)}
        {[3.4, 8.4, 13.4, 18.4].map((x) => <Chair key={`bench-bottom-${x}`} x={x} y={13.8} stroke={stroke} />)}
      </svg>
    )
  }

  if (item.type === 'private-office') {
    if (key === 'private-office/u-shape') {
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
          <rect x={2.5} y={2} width={19} height={14} rx={R} fill={GLASS_FILL} stroke={stroke} opacity="0.55" />
          <path d="M5 4h4v7h6V4h4v10H5z" fill={fill} stroke={stroke} strokeLinejoin="miter" />
          <PlanLine d="M10 6.2h4" stroke="#fff" opacity={0.9} />
          <Chair x={10} y={13.3} width={4} height={2} stroke={stroke} />
        </svg>
      )
    }

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2.5} y={2} width={19} height={14} rx={R} fill={GLASS_FILL} stroke={stroke} opacity="0.55" />
        <path d="M4.5 14.5h4" stroke="#fff" strokeWidth="1.4" />
        <rect x={6} y={5.5} width={12} height={4.8} rx={R} fill={fill} stroke={stroke} />
        <Chair x={10} y={11.7} width={4} height={2} stroke={stroke} />
        <PlanLine d="M7.8 7.3h8.4" stroke="#fff" opacity={0.75} />
      </svg>
    )
  }

  if (item.type === 'conference-room') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={1.7} y={1.8} width={20.6} height={14.4} rx={R} fill={fill} stroke={stroke} />
        <rect x={5.5} y={6.1} width={13} height={5.8} rx={R} fill="#fff" stroke={stroke} opacity="0.86" />
        {[4, 7.8, 12, 16.2, 20].map((x) => <Chair key={`conf-top-${x}`} x={x - 1.2} y={3.1} width={2.4} height={1.8} stroke={stroke} />)}
        {[4, 7.8, 12, 16.2, 20].map((x) => <Chair key={`conf-bottom-${x}`} x={x - 1.2} y={13.1} width={2.4} height={1.8} stroke={stroke} />)}
        <PlanLine d="M8 9h8" stroke={stroke} opacity={0.35} />
      </svg>
    )
  }

  if (item.type === 'phone-booth') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={7} y={2} width={10} height={14} rx={R} fill={fill} stroke={stroke} />
        <rect x={9} y={4.2} width={6} height={7.6} rx="0.55" fill="#fff" stroke={stroke} opacity="0.82" />
        <PlanLine d="M16.9 4.3v9.3M14.2 13.6h2.7" stroke={stroke} opacity={0.75} />
        <circle cx={14} cy={13.6} r="0.6" fill={stroke} />
      </svg>
    )
  }

  if (item.type === 'common-area') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={3.2} width={20} height={11.6} rx={R} fill={fill} stroke={stroke} />
        <rect x={4.2} y={6} width={6.5} height={5.2} rx={R} fill="#fff" stroke={stroke} opacity="0.78" />
        <rect x={13.3} y={6} width={6.5} height={5.2} rx={R} fill="#fff" stroke={stroke} opacity="0.78" />
        <rect x={10.6} y={11.8} width={2.8} height={1.2} rx="0.35" fill={stroke} opacity="0.45" />
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
        <path d="M7 9h10" stroke="#fff" strokeWidth="1.2" opacity="0.75" />
        <Chair x={5} y={2.7} stroke={stroke} />
        <Chair x={16.2} y={13.3} stroke={stroke} />
      </svg>
    )
  }

  if (item.type === 'table-rect' || item.type === 'table-conference') {
    const tableX = item.type === 'table-conference' ? 2 : 4
    const tableW = item.type === 'table-conference' ? 20 : 16
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={tableX} y={5} width={tableW} height={8} rx={R} fill={fill} stroke={stroke} />
        <path d="M7 9h10" stroke="#fff" strokeWidth="1.05" opacity="0.75" />
        {[
          tableX + 1.2,
          tableX + tableW * 0.35,
          tableX + tableW * 0.65,
          tableX + tableW - 3.6,
        ].map((x) => <Chair key={`top-${x}`} x={x} y={2.4} width={2.4} height={1.8} stroke={stroke} />)}
        {[
          tableX + 1.2,
          tableX + tableW * 0.35,
          tableX + tableW * 0.65,
          tableX + tableW - 3.6,
        ].map((x) => <Chair key={`bot-${x}`} x={x} y={13.8} width={2.4} height={1.8} stroke={stroke} />)}
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
        <rect x={2} y={5} width={W - 4} height={H - 7} fill={fill} stroke={stroke} rx={R} />
        <rect x={3} y={7} width={3} height={H - 10} fill={stroke} opacity="0.35" rx="0.45" />
        <rect x={W - 6} y={7} width={3} height={H - 10} fill={stroke} opacity="0.35" rx="0.45" />
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
        <path d="M3 4h18v4H7v6H3z" fill={fill} stroke={stroke} strokeLinejoin="miter" />
        <rect x={9} y={10} width={9} height={4} rx={R} fill="#fff" stroke={stroke} opacity="0.72" />
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

  if (key === 'decor/storage') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={4} y={5} width={W - 8} height={H - 10} fill={fill} stroke={stroke} />
        <line x1={4} y1={H / 2} x2={W - 4} y2={H / 2} stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      </svg>
    )
  }

  if (key === 'decor/locker') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={5} width={W - 4} height={H - 10} fill={fill} stroke={stroke} />
        <line x1={W / 4} y1={5} x2={W / 4} y2={H - 5} stroke={stroke} strokeWidth="0.8" opacity="0.6" />
        <line x1={W / 2} y1={5} x2={W / 2} y2={H - 5} stroke={stroke} strokeWidth="0.8" opacity="0.6" />
        <line x1={W * 3 / 4} y1={5} x2={W * 3 / 4} y2={H - 5} stroke={stroke} strokeWidth="0.8" opacity="0.6" />
      </svg>
    )
  }

  if (key === 'decor/credenza') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={2} y={6} width={W - 4} height={H - 12} fill={fill} stroke={stroke} />
        <line x1={W / 2} y1={6} x2={W / 2} y2={H - 6} stroke={stroke} strokeWidth="0.8" opacity="0.6" />
      </svg>
    )
  }

  if (key === 'decor/printer-bay') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={3} y={4} width={W - 6} height={H - 8} fill={fill} stroke={stroke} rx="1" />
        <rect x={5} y={6} width={W - 10} height={H - 12} fill="#fff" stroke={stroke} opacity="0.7" />
        <rect x={W / 2 - 2} y={8} width={4} height={2} fill={stroke} opacity="0.5" />
      </svg>
    )
  }

  if (key === 'decor/armchair' || item.type === 'chair') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x={5} y={6.2} width={14} height={8.8} fill={fill} stroke={stroke} rx={R} />
        <rect x={6.5} y={4} width={11} height={3.4} fill={CHAIR_FILL} stroke={stroke} rx="0.55" />
        <rect x={6.5} y={9} width={2.4} height={5} fill={stroke} opacity="0.28" rx="0.35" />
        <rect x={15.1} y={9} width={2.4} height={5} fill={stroke} opacity="0.28" rx="0.35" />
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
        <rect x={2} y={5} width={W - 4} height={H - 8} fill={fill} stroke={stroke} rx={R} />
        <rect x={3} y={7} width={4} height={H - 11} fill={stroke} opacity="0.35" rx="0.5" />
        <rect x={W - 7} y={7} width={4} height={H - 11} fill={stroke} opacity="0.35" rx="0.5" />
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
