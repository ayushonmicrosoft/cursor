import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

type Size = 'sm' | 'md' | 'lg'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: Size
  preventBackdropClose?: boolean
  'aria-labelledby'?: string
  children: ReactNode
}

const SIZE_CLASS: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden'
  })
}

export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  preventBackdropClose = false,
  'aria-labelledby': ariaLabelledByProp,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const fallbackTitleId = useId()
  const resolvedLabelledBy = ariaLabelledByProp ?? (title ? fallbackTitleId : undefined)

  // Escape + Tab loop listener — only installed while the modal is open
  // so we don't swallow keys from other layers when closed.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return
      const focusable = getFocusableElements(panel)
      if (focusable.length === 0) {
        e.preventDefault()
        panel.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null

      if (!active || !panel.contains(active) || active === panel) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
        return
      }
      if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
        return
      }
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // On open: remember current focus and move it into the dialog. On close:
  // restore focus to the invoking control when it still exists.
  useEffect(() => {
    if (!open) return
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const panel = panelRef.current
    if (!panel) return
    const focusable = getFocusableElements(panel)
    ;(focusable[0] ?? panel).focus()

    return () => {
      const previous = previouslyFocusedRef.current
      previouslyFocusedRef.current = null
      if (previous && previous.isConnected) previous.focus()
    }
  }, [open])

  if (!open) return null

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (preventBackdropClose) return
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const panel = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 backdrop-blur-sm dark:bg-black/70"
      onMouseDown={onBackdropClick}
      data-testid="modal-backdrop"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={resolvedLabelledBy}
        tabIndex={-1}
        className={cn(
          'glass-panel w-full bg-white dark:bg-gray-900 outline-none',
          SIZE_CLASS[size],
        )}
      >
        {title ? (
          <ModalHeader titleId={resolvedLabelledBy} onClose={onClose}>
            {title}
          </ModalHeader>
        ) : null}
        {children}
      </div>
    </div>
  )

  return createPortal(panel, document.body)
}

interface ModalHeaderProps {
  children: ReactNode
  onClose?: () => void
  titleId?: string
  className?: string
}

export function ModalHeader({ children, onClose, titleId, className }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 px-6 py-4 border-b border-white/40 dark:border-white/10',
        className,
      )}
    >
      <h2 id={titleId} className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {children}
      </h2>
      {onClose ? (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  )
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn('p-6', className)}>{children}</div>
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('flex justify-end gap-2 px-6 py-4 border-t border-white/40 dark:border-white/10', className)}>
      {children}
    </div>
  )
}
