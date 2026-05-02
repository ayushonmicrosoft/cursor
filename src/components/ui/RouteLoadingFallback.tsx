import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

type RouteLoadingVariant = {
  label: string
  title: string
  body: string
  shellClassName: string
  content: ReactNode
}

function SkeletonBar({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200/90 dark:bg-slate-700/80 ${className}`} />
}

function AuthSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <SkeletonBar className="h-4 w-24" />
        <SkeletonBar className="mt-3 h-8 w-44" />
        <SkeletonBar className="mt-2 h-4 w-72 max-w-full" />
        <div className="mt-6 space-y-3">
          <SkeletonBar className="h-12 w-full rounded-xl" />
          <SkeletonBar className="h-12 w-full rounded-xl" />
        </div>
        <SkeletonBar className="mt-4 h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:flex-row">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:w-80">
        <SkeletonBar className="h-4 w-28" />
        <SkeletonBar className="mt-4 h-10 w-full rounded-xl" />
        <SkeletonBar className="mt-3 h-10 w-full rounded-xl" />
        <SkeletonBar className="mt-3 h-10 w-full rounded-xl" />
      </aside>
      <section className="min-h-[24rem] flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <SkeletonBar className="h-4 w-20" />
        <SkeletonBar className="mt-2 h-8 w-60 max-w-full" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SkeletonBar className="h-32 rounded-2xl" />
          <SkeletonBar className="h-32 rounded-2xl" />
          <SkeletonBar className="h-32 rounded-2xl sm:col-span-2 xl:col-span-1" />
        </div>
      </section>
    </div>
  )
}

function TeamSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <SkeletonBar className="h-4 w-24" />
        <SkeletonBar className="mt-2 h-8 w-56" />
        <SkeletonBar className="mt-2 h-4 w-96 max-w-full" />
        <div className="mt-5 flex gap-3">
          <SkeletonBar className="h-10 w-28 rounded-lg" />
          <SkeletonBar className="h-10 w-32 rounded-lg" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <SkeletonBar className="h-4 w-28" />
          <SkeletonBar className="mt-4 h-24 rounded-2xl" />
          <SkeletonBar className="mt-4 h-24 rounded-2xl" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <SkeletonBar className="h-4 w-24" />
          <SkeletonBar className="mt-4 h-14 rounded-xl" />
          <SkeletonBar className="mt-3 h-14 rounded-xl" />
          <SkeletonBar className="mt-3 h-14 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function EditorSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <SkeletonBar className="h-4 w-32" />
        <div className="mt-3 flex flex-wrap gap-3">
          <SkeletonBar className="h-9 w-24 rounded-lg" />
          <SkeletonBar className="h-9 w-24 rounded-lg" />
          <SkeletonBar className="h-9 w-28 rounded-lg" />
          <SkeletonBar className="h-9 w-20 rounded-lg" />
        </div>
      </div>
      <div className="grid min-h-[34rem] gap-4 xl:grid-cols-[16rem_minmax(0,1fr)_20rem]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <SkeletonBar className="h-4 w-24" />
          <SkeletonBar className="mt-4 h-10 w-full rounded-xl" />
          <SkeletonBar className="mt-3 h-10 w-full rounded-xl" />
          <SkeletonBar className="mt-3 h-10 w-3/4 rounded-xl" />
          <SkeletonBar className="mt-6 h-4 w-20" />
          <SkeletonBar className="mt-3 h-24 rounded-2xl" />
        </aside>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <SkeletonBar className="h-4 w-28" />
            <SkeletonBar className="h-4 w-20" />
          </div>
          <div className="mt-4 grid min-h-[28rem] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40">
            <div className="grid w-full max-w-3xl gap-3 px-6 py-8">
              <SkeletonBar className="h-5 w-40" />
              <SkeletonBar className="h-4 w-80 max-w-full" />
              <SkeletonBar className="h-[18rem] rounded-2xl" />
            </div>
          </div>
        </section>
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <SkeletonBar className="h-4 w-28" />
          <SkeletonBar className="mt-4 h-16 rounded-xl" />
          <SkeletonBar className="mt-3 h-16 rounded-xl" />
          <SkeletonBar className="mt-3 h-16 rounded-xl" />
        </aside>
      </div>
    </div>
  )
}

function HelpShareSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <SkeletonBar className="h-4 w-20" />
        <SkeletonBar className="mt-4 h-10 w-full rounded-xl" />
        <SkeletonBar className="mt-3 h-10 w-full rounded-xl" />
        <SkeletonBar className="mt-3 h-10 w-full rounded-xl" />
        <SkeletonBar className="mt-6 h-4 w-24" />
      </aside>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <SkeletonBar className="h-4 w-20" />
        <SkeletonBar className="mt-2 h-8 w-64 max-w-full" />
        <SkeletonBar className="mt-2 h-4 w-96 max-w-full" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <SkeletonBar className="h-32 rounded-2xl" />
          <SkeletonBar className="h-32 rounded-2xl" />
        </div>
        <SkeletonBar className="mt-4 h-44 rounded-2xl" />
      </section>
    </div>
  )
}

function getRouteLoadingVariant(pathname: string): RouteLoadingVariant {
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot') ||
    pathname.startsWith('/auth/')
  ) {
    return {
      label: 'Signing in',
      title: 'Loading your account',
      body: 'Preparing the auth flow and restoring your destination.',
      shellClassName: 'max-w-3xl',
      content: <AuthSkeleton />,
    }
  }

  if (pathname === '/dashboard') {
    return {
      label: 'Loading team',
      title: 'Opening your workspace',
      body: 'Bringing in team context, office cards, and navigation.',
      shellClassName: 'max-w-7xl',
      content: <DashboardSkeleton />,
    }
  }

  if (pathname.startsWith('/t/') && pathname.includes('/settings')) {
    return {
      label: 'Loading team',
      title: 'Loading team settings',
      body: 'Bringing in members, roles, and workspace settings.',
      shellClassName: 'max-w-6xl',
      content: <TeamSkeleton />,
    }
  }

  if (pathname.startsWith('/t/') && !pathname.includes('/o/')) {
    return {
      label: 'Loading team',
      title: 'Opening your team space',
      body: 'Bringing in team context, office cards, and navigation.',
      shellClassName: 'max-w-7xl',
      content: <DashboardSkeleton />,
    }
  }

  if (
    pathname.includes('/o/') &&
    (pathname.endsWith('/map') ||
      pathname.endsWith('/roster') ||
      pathname.endsWith('/audit') ||
      pathname.endsWith('/reports') ||
      pathname.endsWith('/org-chart') ||
      pathname.endsWith('/reservations'))
  ) {
    return {
      label: 'Loading office',
      title: 'Opening the editor',
      body: 'Loading the map, roster, and related office tools.',
      shellClassName: 'max-w-[96rem]',
      content: <EditorSkeleton />,
    }
  }

  if (pathname.startsWith('/help') || pathname.startsWith('/share') || pathname.startsWith('/shared')) {
    const routeLabel = pathname.startsWith('/help')
      ? 'Loading guide'
      : pathname.startsWith('/shared')
        ? 'Loading shared view'
        : 'Loading share view'

    return {
      label: routeLabel,
      title: pathname.startsWith('/help')
        ? 'Opening the help center'
        : 'Opening the shared office view',
      body: pathname.startsWith('/help')
        ? 'Loading supporting content and guide navigation.'
        : 'Loading the read-only share page and its controls.',
      shellClassName: 'max-w-6xl',
      content: <HelpShareSkeleton />,
    }
  }

  return {
    label: 'Loading',
    title: 'Loading page',
    body: 'Preparing the next screen.',
    shellClassName: 'max-w-4xl',
    content: <DashboardSkeleton />,
  }
}

/**
 * Route-specific loading shell that keeps the page shape stable while a
 * lazy chunk is still in flight. Matching the visible route reduces the
 * "blank app" feeling for auth, team, editor, and help/share flows.
 */
export function RouteLoadingFallback() {
  const { pathname } = useLocation()
  const variant = getRouteLoadingVariant(pathname)

  return (
    <div
      className="min-h-screen w-full bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
      role="status"
      aria-live="polite"
      aria-label={variant.title}
    >
      <div className={`mx-auto flex min-h-[calc(100vh-4rem)] w-full ${variant.shellClassName} flex-col justify-center gap-4`}>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {variant.label}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{variant.title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{variant.body}</p>
        </div>
        {variant.content}
      </div>
    </div>
  )
}
