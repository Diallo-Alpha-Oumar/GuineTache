import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function RootRedirect() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'} replace />
}
