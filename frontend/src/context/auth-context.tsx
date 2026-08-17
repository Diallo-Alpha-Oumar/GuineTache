import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import type { LoginCredentials, PublicUser } from '@/types'
import { authService } from '@/services/auth.service'

interface AuthContextValue {
  user: PublicUser | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string; user?: PublicUser }>
  logout: () => void
  refreshUser: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    authService.getCurrentUser().then((currentUser) => {
      if (!cancelled) {
        setUser(currentUser)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials)
    if (result.success && result.data) {
      setUser(result.data)
    }
    return { success: result.success, message: result.message, user: result.data }
  }, [])

  const logout = useCallback(() => {
    void authService.logout()
    setUser(null)
  }, [])

  const refreshUser = useCallback(() => {
    void authService.getCurrentUser().then(setUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
