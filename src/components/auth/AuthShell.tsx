import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Wave 17A shared chrome for every auth screen. The five auth pages
 * (login / signup / forgot / reset / verify) now share a centered
 * card on a soft gradient with the OandOcraft wordmark up top — the
 * same visual idiom the landing page and team home use.
 *
 * The primitives live in a single file (instead of inline helpers per
 * page) so that tiny adjustments — card padding, gradient stops, the
 * error banner — only need to land in one place to stay consistent.
 * They are intentionally narrow: heading / field label / error
 * banner / link row. Anything richer (spinners, icons) is assembled
 * per page using the UI-kit `Button` and `Input` primitives.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="surface-gradient min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="px-6 pt-6 sm:pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-3 py-2 font-semibold tracking-tight text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-50"
        >
          {/* Tiny diamond mark — same "F" chip idiom used in LandingNav. */}
          <span
            aria-hidden="true"
            className="inline-block h-5 w-5 rotate-45 rounded-sm bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <span>OandOcraft</span>
        </Link>
      </header>
      <main className="flex-1 flex items-start justify-center px-6 pt-10 pb-12 sm:pt-16">
        <div className="w-full max-w-md min-w-0">
          <div className="glass-panel max-w-full rounded-[1.5rem] p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export function AuthHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-6 space-y-1.5">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
        {title}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  )
}

export function AuthFieldLabel({
  htmlFor,
  label,
  children,
}: {
  htmlFor: string
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

export function AuthErrorBanner({ id, message }: { id: string; message: string }) {
  return (
    <div
      id={id}
      role="alert"
      className="mb-4 flex items-start gap-2.5 rounded-md border border-red-200 border-l-4 border-l-red-500 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-900/60 dark:border-l-red-500 dark:bg-red-950/40 dark:text-red-200"
    >
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

export function AuthLinks({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs min-w-0">
      {children}
    </div>
  )
}

function SkeletonBar({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-gray-200/90 dark:bg-gray-700/80 ${className}`}
    />
  )
}

export function AuthFormSkeleton({
  title,
  subtitle,
  fieldCount = 2,
}: {
  title: string
  subtitle: string
  fieldCount?: 1 | 2 | 3
}) {
  return (
    <AuthShell>
      <div role="status" aria-live="polite" className="space-y-5">
        <AuthHeading title={title} subtitle={subtitle} />
        <div className="space-y-4">
          {Array.from({ length: fieldCount }, (_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBar className="h-3 w-24" />
              <SkeletonBar className="h-9 w-full rounded-md" />
            </div>
          ))}
          <SkeletonBar className="h-10 w-full rounded-md" />
        </div>
      </div>
    </AuthShell>
  )
}
