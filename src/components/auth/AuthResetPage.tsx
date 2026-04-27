import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToastStore } from '../../stores/toastStore'
import { Button, Input } from '../ui'
import {
  AuthShell,
  AuthHeading,
  AuthFieldLabel as FieldLabel,
  AuthErrorBanner,
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

export function AuthResetPage() {
  const [params] = useSearchParams()
  const next = resolveAuthNext(params.get('next'))
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const pushToast = useToastStore((s) => s.push)

  useEffect(() => {
    rememberAuthNext(next)
  }, [next])

  const hasMinLength = password.length >= 8
  const matchesConfirm = confirm.length > 0 && password === confirm

  async function onSubmit(e: FormEvent) {
    e.preventDefault()

    if (!hasMinLength) {
      setError('Use at least 8 characters for your new password.')
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match. Re-enter both fields and try again.")
      return
    }

    setBusy(true)
    setError(null)

    let submitError: unknown = null
    try {
      const res = await supabase.auth.updateUser({ password })
      submitError = res.error
    } catch (error) {
      submitError = error
    }

    setBusy(false)
    if (submitError) {
      setError(describeAuthError(submitError))
      return
    }

    pushToast({
      tone: 'success',
      title: 'Password updated',
      body: 'Sign in with your new password.',
    })
    navigate(withAuthNext('/login', next), { replace: true })
  }

  return (
    <AuthShell>
      <AuthHeading
        title="Choose a new password"
        subtitle="Your previous password is now inactive."
      />

      {error && <AuthErrorBanner id="reset-form-error" message={error} />}

      <form onSubmit={onSubmit} className="space-y-4" noValidate aria-busy={busy}>
        <div className="space-y-1.5">
          <label
            htmlFor="reset-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            New password
          </label>
          <Input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={busy}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={!!error}
            aria-describedby={error ? 'reset-form-error reset-password-hint' : 'reset-password-hint'}
          />
          <ul id="reset-password-hint" className="space-y-0.5 text-xs" aria-live="polite">
            <PasswordHintRow satisfied={hasMinLength}>At least 8 characters.</PasswordHintRow>
            <PasswordHintRow satisfied={matchesConfirm}>Matches the confirmation field.</PasswordHintRow>
          </ul>
        </div>

        <FieldLabel htmlFor="reset-password-confirm" label="Confirm new password">
          <Input
            id="reset-password-confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={busy}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            invalid={!!error}
            aria-describedby={error ? 'reset-form-error' : undefined}
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
          {busy ? 'Updating...' : 'Update password'}
        </Button>
      </form>
    </AuthShell>
  )
}
