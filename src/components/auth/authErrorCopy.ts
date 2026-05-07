import { humanizeAuthError } from '../../lib/auth/humanizeAuthError'

type RewriteRule = {
  when: (lowerMessage: string) => boolean
  message: string
}

const REWRITE_RULES: RewriteRule[] = [
  {
    when: (lower) => lower.includes('invalid login credentials'),
    message: 'Email or password is incorrect. Double-check and try again.',
  },
  {
    when: (lower) => lower.includes('email not confirmed'),
    message: 'Check your inbox and verify your email before signing in.',
  },
  {
    when: (lower) => lower.includes('user already registered'),
    message: 'An account already exists for this email. Sign in or reset your password.',
  },
  {
    when: (lower) => lower.includes('password should be at least'),
    message: 'Use at least 8 characters for your password.',
  },
  {
    when: (lower) => lower.includes('same password'),
    message: 'Choose a new password you have not used recently.',
  },
  {
    when: (lower) => lower.includes('token has expired') || lower.includes('expired'),
    message: 'This link expired. Request a new one and try again.',
  },
]

export function describeAuthError(error: unknown): string {
  const raw = humanizeAuthError(error).trim()
  const lower = raw.toLowerCase()
  const rewritten = REWRITE_RULES.find((rule) => rule.when(lower))
  return rewritten?.message ?? raw
}
