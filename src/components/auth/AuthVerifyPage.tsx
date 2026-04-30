import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthShell } from './AuthShell'
import {
  clearRememberedAuthNext,
  consumeRememberedAuthNext,
  rememberAuthNext,
  resolveAuthNext,
} from './authRedirect'

export function AuthVerifyPage() {
  const [params] = useSearchParams()
  const queryNext = resolveAuthNext(params.get('next'))
  const navigate = useNavigate()

  useEffect(() => {
    rememberAuthNext(queryNext)
  }, [queryNext])

  useEffect(() => {
    async function run() {
      const destination =
        queryNext === '/dashboard' ? consumeRememberedAuthNext() : queryNext
      clearRememberedAuthNext()
      navigate(destination, { replace: true })
    }
    void run()
  }, [navigate, queryNext])

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
