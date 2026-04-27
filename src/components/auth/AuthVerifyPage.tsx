import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui'
import { AuthShell } from './AuthShell'
import { describeAuthError } from './authErrorCopy'
import {
  clearRememberedAuthNext,
  consumeRememberedAuthNext,
  rememberAuthNext,
  resolveAuthNext,
  withAuthNext,
} from './authRedirect'

export function AuthVerifyPage() {
  const [params] = useSearchParams()
  const queryNext = resolveAuthNext(params.get('next'))
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    rememberAuthNext(queryNext)
  }, [queryNext])

  useEffect(() => {
    async function run() {
      const pending = sessionStorage.getItem('pending_invite_token')
      if (pending) {
        sessionStorage.removeItem('pending_invite_token')
        const { error } = await supabase.rpc('accept_invite', { invite_token: pending })
        if (error) {
          setError(describeAuthError(error))
          return
        }
      }

      const destination =
        queryNext === '/dashboard' ? consumeRememberedAuthNext() : queryNext
      clearRememberedAuthNext()
      navigate(destination, { replace: true })
    }
    void run()
  }, [navigate, queryNext])

  if (error) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
          >
            <AlertCircle size={24} />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Verification failed
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The link may have expired. Request a new one or sign in if your account is already set up.
          </p>
          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to={withAuthNext('/login', queryNext)}>
              <Button variant="primary" className="w-full sm:w-auto">
                Back to sign in
              </Button>
            </Link>
            <Link to={withAuthNext('/forgot', queryNext)}>
              <Button variant="secondary" className="w-full sm:w-auto">
                Request a new link
              </Button>
            </Link>
          </div>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
        <span
          aria-hidden="true"
          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        >
          <Loader2 size={24} className="animate-spin motion-reduce:animate-none" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Verifying your email...
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          We are finalizing your account and workspace access.
        </p>
      </div>
    </AuthShell>
  )
}
