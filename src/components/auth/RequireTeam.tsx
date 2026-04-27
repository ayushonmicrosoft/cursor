import { Navigate } from 'react-router-dom'
import { useMyTeams } from '../../lib/teams/useMyTeams'
import { AuthFormSkeleton } from './AuthShell'

export function RequireTeam({ children }: { children: React.ReactNode }) {
  const teams = useMyTeams()
  if (teams === null) {
    return (
      <AuthFormSkeleton
        title="Preparing workspace setup"
        subtitle="Checking whether you already have a team."
        fieldCount={1}
      />
    )
  }
  if (teams.length === 0) {
    return <Navigate to="/onboarding/team" replace />
  }
  return <>{children}</>
}
