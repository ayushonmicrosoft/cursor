import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  title: string
  defaultOpen?: boolean
  storageKey?: string
  trailing?: ReactNode
  children: ReactNode
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  storageKey,
  trailing,
  children,
}: Props) {
  const [open, setOpen] = useState<boolean>(() => {
    if (!storageKey) return defaultOpen
    try {
      const v = localStorage.getItem(`sidebar-section:${storageKey}`)
      if (v === '1') return true
      if (v === '0') return false
    } catch {
      /* storage can throw in sandboxed iframes; fall back */
    }
    return defaultOpen
  })

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev
      if (storageKey) {
        try {
          localStorage.setItem(`sidebar-section:${storageKey}`, next ? '1' : '0')
        } catch {
          /* ignore */
        }
      }
      return next
    })
  }

  const idBase = useId()
  const buttonId = `${idBase}-header`
  const panelId = `${idBase}-panel`

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
      {/* Section header */}
      <button
        id={buttonId}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-center gap-2 px-3 py-1.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-inset hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        {/* Chevron */}
        <motion.div
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28, mass: 0.6 }}
          className="flex-shrink-0 text-gray-400 dark:text-gray-500"
        >
          <ChevronDown size={12} strokeWidth={2.5} aria-hidden="true" />
        </motion.div>

        {/* Label */}
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 select-none group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-150">
          {title}
        </span>

        {trailing}
      </button>

      {/* Animated content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32, mass: 0.7 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
