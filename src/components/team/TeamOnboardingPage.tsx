import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useSession } from '../../lib/auth/session'
import { createTeam } from '../../lib/teams/teamRepository'
import { humanizeError } from '../../lib/errorMessages'
import { Button, Input } from '../ui'
import {
  AuthShell,
  AuthHeading,
  AuthFieldLabel,
  AuthErrorBanner,
} from '../auth/AuthShell'

export function TeamOnboardingPage() {
  const session = useSession()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  if (session.status !== 'authenticated') return null

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (session.status !== 'authenticated') return
    setBusy(true)
    setError(null)
    try {
      const team = await createTeam(name)
      navigate(`/t/${team.slug}`, { replace: true })
    } catch (err) {
      setError(humanizeError(err))
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <div className="mb-5 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
        Workspace setup • Step 1 of 2
      </div>

      <AuthHeading
        title="Name your workspace"
        subtitle="Your first team becomes the home for offices, members, and settings."
      />

      {error && <AuthErrorBanner id="onboarding-form-error" message={error} />}

      <form onSubmit={onSubmit} className="space-y-4" noValidate aria-busy={busy}>
        <AuthFieldLabel htmlFor="onboarding-team-name" label="Workspace name">
          <Input
            id="onboarding-team-name"
            required
            autoFocus
            disabled={busy}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme HQ"
            invalid={!!error}
            aria-describedby={error ? 'onboarding-form-error onboarding-hint' : 'onboarding-hint'}
          />
        </AuthFieldLabel>

        <ul id="onboarding-hint" className="space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
          <li>This name appears in team switchers and invites.</li>
          <li>You can rename it later from Team settings.</li>
          <li>Next up: invite people or create your first office.</li>
        </ul>

        <Button
          type="submit"
          variant="primary"
          disabled={busy || !name.trim()}
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
          {busy ? 'Creating workspace...' : 'Create workspace'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Got an invite link?{' '}
        <Link
          to="/dashboard"
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Skip setup and open dashboard
        </Link>
      </p>
    </AuthShell>
  )
}
