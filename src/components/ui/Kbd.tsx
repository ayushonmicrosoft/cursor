import type { ReactNode } from 'react'

export function Kbd({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <kbd
      className={[
        'inline-flex items-center rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-gray-700',
        'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200',
        className,
      ].join(' ')}
    >
      {children}
    </kbd>
  )
}
