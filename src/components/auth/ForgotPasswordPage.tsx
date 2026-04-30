import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button, Input } from '../ui'
import {
  AuthShell,
  AuthHeading,
  AuthFieldLabel as FieldLabel,
  AuthErrorBanner,
  AuthLinks,
} from './AuthShell'
import { describeAuthError } from './authErrorCopy'
import { rememberAuthNext, resolveAuthNext, withAuthNext } from './authRedirect'

export function ForgotPasswordPage() {
  const [params] = useSearchParams()
  const next = resolveAuthNext(params.get('next'))
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    rememberAuthNext(next)
  }, [next])

  async function submitReset(targetEmail: string) {
    setBusy(true)
    setError(null)

    let submitError: unknown = null
    try {
      const resetUrl = new URL('/auth/reset', window.location.origin)
      if (next !== '/dashboard') resetUrl.searchParams.set('next', next)
      const res = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: resetUrl.toString(),
      })
      submitError = res.error
    } catch (error) {
      submitError = error
    }

    setBusy(false)
    if (submitError) {
      setError(describeAuthError(submitError))
      return false
    }
    return true
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = await submitReset(email)
    if (ok) setDone(true)
  }

  if (done) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
          >
            <CheckCircle2 size={24} />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Check your inbox
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We sent a reset link to{' '}
            <span className="font-medium text-gray-700 dark:text-gray-200 break-all">{email}</span>.
          </p>
          <ol className="mt-5 w-full space-y-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
            <li>1. Open the email from Floorcraft.</li>
            <li>2. Choose your new password.</li>
            <li>3. Sign in again to continue.</li>
          </ol>
          <div className="mt-6 w-full border-t border-gray-100 pt-5 text-sm dark:border-gray-800">
            <button
              type="button"
              onClick={() => void submitReset(email)}
              disabled={busy}
              className="text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline dark:text-blue-400"
            >
              {busy ? 'Sending...' : "Didn't get it? Resend"}
            </button>
          </div>
          <div className="mt-4 text-xs">
            <Link
              to={withAuthNext('/login', next)}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <AuthHeading
        title="Reset your password"
        subtitle="We will email a secure reset link."
      />

      {error && <AuthErrorBanner id="forgot-form-error" message={error} />}

      <form onSubmit={onSubmit} className="space-y-4" noValidate aria-busy={busy}>
        <FieldLabel htmlFor="forgot-email" label="Email">
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            required
            disabled={busy}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={!!error}
            aria-describedby={error ? 'forgot-form-error' : undefined}
          />
        </FieldLabel>

        <Button
          type="submit"
          variant="primary"
          disabled={busy}
          className="w-full py-2"
          leftIcon={
            busy ? (
              <Loader2
                size={14}
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : undefined
          }
        >
          {busy ? 'Sending reset link...' : 'Send reset link'}
        </Button>
      </form>

      <AuthLinks>
        <Link
          to={withAuthNext('/login', next)}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          Back to sign in
        </Link>
        <span className="text-gray-400 dark:text-gray-600">
          Need an account?{' '}
          <Link
            to={withAuthNext('/signup', next)}
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign up
          </Link>
        </span>
      </AuthLinks>
    </AuthShell>
  )
}
