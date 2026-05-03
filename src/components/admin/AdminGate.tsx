import { Navigate } from 'react-router-dom'
import { useSession } from '../../lib/auth/session'

const SUPER_ADMIN_EMAIL = 'ayush@oando.co.in'

export function AdminGate({ children }: { children: React.ReactNode }) {
  const session = useSession()

  if (session.status === 'loading') return null
  if (session.status !== 'authenticated') return <Navigate to="/login" replace />
  if (session.user.email.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    return <Navigate to="/account" replace />
  }

  return <>{children}</>
}
