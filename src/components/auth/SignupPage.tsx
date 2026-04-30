import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ResendVerificationButton } from '../team/ResendVerificationButton'
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

function PasswordHintRow({
  satisfied,
  children,
}: {
  satisfied: boolean
  children: React.ReactNode
}) {
  return (
    <li
      className={
        satisfied
          ? 'text-green-700 dark:text-green-400'
          : 'text-gray-500 dark:text-gray-400'
      }
    >
      {children}
    </li>
  )
}

export function SignupPage() {
  const [params] = useSearchParams()
  const next = resolveAuthNext(params.get('next'))
  const presetEmail = params.get('email') ?? ''

  const [name, setName] = useState('')
  const [email, setEmail] = useState(presetEmail)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    rememberAuthNext(next)
  }, [next])

  const hasMinLength = password.length >= 8
  const hasLetterAndNumber = /[a-z]/i.test(password) && /\d/.test(password)

  const nextStepLabel = useMemo(() => {
    if (next === '/dashboard') return 'your workspace dashboard'
    return 'the page you asked for'
  }, [next])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!hasMinLength) {
      setError('Use at least 8 characters for your password.')
      return
    }

    setBusy(true)
    setError(null)

    let submitError: unknown = null
    try {
      const verifyUrl = new URL('/auth/verify', window.location.origin)
      if (next !== '/dashboard') verifyUrl.searchParams.set('next', next)

      const res = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: verifyUrl.toString(),
        },
      })
      submitError = res.error
    } catch (error) {
      submitError = error
    }

    setBusy(false)
    if (submitError) {
      setError(describeAuthError(submitError))
      return
    }
    setDone(true)
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
            Confirm your email
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We sent a verification link to{' '}
            <span className="font-medium text-gray-700 dark:text-gray-200 break-all">{email}</span>.
          </p>
          <ol className="mt-5 w-full space-y-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
            <li>1. Open the email and click Verify account.</li>
            <li>2. We will continue to {nextStepLabel}.</li>
            <li>3. If you still need a team, setup starts right after verification.</li>
          </ol>
          <div className="mt-6 w-full border-t border-gray-100 pt-5 dark:border-gray-800">
            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
              No email yet? Check spam or resend:
            </p>
            <ResendVerificationButton email={email} />
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Want to use a different account?{' '}
            <Link
              to={withAuthNext('/login', next)}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
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
        title="Create your workspace account"
        subtitle="Set up your profile now. Team setup comes next."
      />

      {error && <AuthErrorBanner id="signup-form-error" message={error} />}

      <form onSubmit={onSubmit} className="space-y-4" noValidate aria-busy={busy}>
        <FieldLabel htmlFor="signup-name" label="Name">
          <Input
            id="signup-name"
            autoComplete="name"
            required
            disabled={busy}
            value={name}
            onChange={(e) => setName(e.target.value)}
            invalid={!!error}
            aria-describedby={error ? 'signup-form-error' : undefined}
          />
        </FieldLabel>

        <FieldLabel htmlFor="signup-email" label="Email">
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            disabled={busy}
            readOnly={!!presetEmail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={!!error}
            aria-describedby={error ? 'signup-form-error' : undefined}
          />
        </FieldLabel>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={busy}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={!!error}
            aria-describedby={
              error ? 'signup-form-error signup-password-hint' : 'signup-password-hint'
            }
          />
          <ul
            id="signup-password-hint"
            className="space-y-0.5 text-xs"
            aria-live="polite"
          >
            <PasswordHintRow satisfied={hasMinLength}>
              At least 8 characters.
            </PasswordHintRow>
            <PasswordHintRow satisfied={hasLetterAndNumber}>
              Include letters and numbers for a stronger password.
            </PasswordHintRow>
          </ul>
        </div>

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
          {busy ? 'Creating account...' : 'Create account'}
        </Button>

        <p className="text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          By creating an account you agree to our{' '}
          <Link to="/help" className="underline hover:text-gray-700 dark:hover:text-gray-300">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/help" className="underline hover:text-gray-700 dark:hover:text-gray-300">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <AuthLinks>
        <span />
        <span className="text-gray-400 dark:text-gray-600">
          Already have an account?{' '}
          <Link
            to={withAuthNext('/login', next)}
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign in
          </Link>
        </span>
      </AuthLinks>
    </AuthShell>
  )
}
