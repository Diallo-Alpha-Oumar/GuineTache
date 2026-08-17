import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function GuestRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'} replace />
  }

  return <Outlet />
}
