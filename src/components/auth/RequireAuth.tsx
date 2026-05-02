import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../../lib/auth/session'
import { AuthFormSkeleton } from './AuthShell'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const location = useLocation()

  if (session.status === 'loading') {
    return (
      <AuthFormSkeleton
        title="Loading your account"
        subtitle="Restoring your secure session."
      />
    )
  }
  if (session.status === 'unauthenticated') {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <>{children}</>
}
