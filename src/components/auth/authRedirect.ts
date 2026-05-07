const AUTH_NEXT_STORAGE_KEY = 'auth.intended_next'
const DEFAULT_AUTH_NEXT = '/dashboard'

const BLOCKED_NEXT_PREFIXES = ['/login', '/signup', '/forgot', '/auth/']

function sanitizeNextPath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback
  const next = raw.trim()
  if (!next) return fallback
  if (!next.startsWith('/') || next.startsWith('//')) return fallback

  const lower = next.toLowerCase()
  const blocked = BLOCKED_NEXT_PREFIXES.some(
    (prefix) => lower === prefix || lower.startsWith(prefix),
  )
  if (blocked) return fallback

  return next
}

export function resolveAuthNext(raw: string | null | undefined, fallback = DEFAULT_AUTH_NEXT): string {
  return sanitizeNextPath(raw, fallback)
}

export function withAuthNext(path: string, next: string, fallback = DEFAULT_AUTH_NEXT): string {
  const resolved = sanitizeNextPath(next, fallback)
  if (resolved === fallback) return path
  const join = path.includes('?') ? '&' : '?'
  return `${path}${join}next=${encodeURIComponent(resolved)}`
}

export function rememberAuthNext(next: string, fallback = DEFAULT_AUTH_NEXT) {
  const resolved = sanitizeNextPath(next, fallback)
  if (resolved === fallback) {
    try {
      sessionStorage.removeItem(AUTH_NEXT_STORAGE_KEY)
    } catch {
      // no-op
    }
    return
  }
  try {
    sessionStorage.setItem(AUTH_NEXT_STORAGE_KEY, resolved)
  } catch {
    // no-op
  }
}

export function readRememberedAuthNext(fallback = DEFAULT_AUTH_NEXT): string {
  try {
    return sanitizeNextPath(sessionStorage.getItem(AUTH_NEXT_STORAGE_KEY), fallback)
  } catch {
    return fallback
  }
}

export function consumeRememberedAuthNext(fallback = DEFAULT_AUTH_NEXT): string {
  const next = readRememberedAuthNext(fallback)
  try {
    sessionStorage.removeItem(AUTH_NEXT_STORAGE_KEY)
  } catch {
    // no-op
  }
  return next
}

export function clearRememberedAuthNext() {
  try {
    sessionStorage.removeItem(AUTH_NEXT_STORAGE_KEY)
  } catch {
    // no-op
  }
}
