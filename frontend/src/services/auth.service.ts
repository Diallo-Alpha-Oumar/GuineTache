import { api, ApiRequestError, setAccessToken, getAccessToken } from '@/lib/api-client'
import type { ApiResult, LoginCredentials, PublicUser, RegisterPayload, UserRole } from '@/types'
import { getItem, removeItem, setItem } from '@/utils/storage'

interface PendingRegistration {
  email: string
  password: string
}

interface BackendUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'user' | 'admin'
  isEmailVerified: boolean
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

const PENDING_REGISTRATION_KEY = 'pending_registration'
const RESET_EMAIL_KEY = 'reset_email'

function toPublicUser(user: BackendUser): PublicUser {
  return {
    id: user.id,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role: (user.role === 'admin' ? 'ADMIN' : 'USER') as UserRole,
    isActive: user.isActive ?? true,
    createdAt: user.createdAt ?? '',
    updatedAt: user.updatedAt ?? '',
  }
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] ?? ''
  const lastName = parts.slice(1).join(' ') || firstName
  return { firstName, lastName }
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.fieldErrors[0]?.message ?? error.message
  }
  return error instanceof Error ? error.message : 'Une erreur est survenue.'
}

export const authService = {
  async register(payload: RegisterPayload): Promise<ApiResult<null>> {
    const { firstName, lastName } = splitFullName(payload.fullName)
    try {
      const result = await api.post<null>('/auth/register', {
        firstName,
        lastName,
        email: payload.email,
        password: payload.password,
      })
      setItem<PendingRegistration>(PENDING_REGISTRATION_KEY, { email: payload.email, password: payload.password })
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },

  async verifyRegistrationOtp(code: string): Promise<ApiResult<PublicUser>> {
    const pending = getItem<PendingRegistration | null>(PENDING_REGISTRATION_KEY, null)
    if (!pending) {
      return { success: false, message: 'Aucune inscription en attente. Veuillez recommencer.' }
    }

    try {
      await api.post('/auth/verify-email', { email: pending.email, otp: code })
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }

    const loginResult = await authService.login({ email: pending.email, password: pending.password })
    if (loginResult.success) {
      removeItem(PENDING_REGISTRATION_KEY)
    }
    return loginResult
  },

  async resendOtp(purpose: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER'): Promise<ApiResult<null>> {
    try {
      if (purpose === 'REGISTER') {
        const pending = getItem<PendingRegistration | null>(PENDING_REGISTRATION_KEY, null)
        if (!pending) return { success: false, message: 'Aucune inscription en attente.' }
        await api.post('/auth/resend-otp', { email: pending.email })
      } else {
        const email = getItem<string | null>(RESET_EMAIL_KEY, null)
        if (!email) return { success: false, message: 'Session de réinitialisation expirée.' }
        await api.post('/auth/forgot-password', { email })
      }
      return { success: true, message: 'Un nouveau code a été envoyé.' }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },

  async login(credentials: LoginCredentials): Promise<ApiResult<PublicUser>> {
    try {
      const result = await api.post<{ user: BackendUser; accessToken: string }>('/auth/login', credentials)
      if (!result.data) {
        return { success: false, message: result.message ?? 'Identifiants invalides.' }
      }
      setAccessToken(result.data.accessToken)
      return { success: true, data: toPublicUser(result.data.user), message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch {
      // La session côté client est de toute façon effacée ci-dessous.
    } finally {
      setAccessToken(null)
    }
  },

  async getCurrentUser(): Promise<PublicUser | null> {
    if (!getAccessToken()) {
      const refreshed = await api.refreshAccessToken()
      if (!refreshed) return null
    }
    try {
      const result = await api.get<BackendUser>('/auth/me')
      return result.data ? toPublicUser(result.data) : null
    } catch {
      return null
    }
  },

  async requestPasswordReset(email: string): Promise<ApiResult<null>> {
    try {
      const result = await api.post<null>('/auth/forgot-password', { email })
      setItem(RESET_EMAIL_KEY, email)
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },

  async resetPassword(code: string, newPassword: string): Promise<ApiResult<null>> {
    const email = getItem<string | null>(RESET_EMAIL_KEY, null)
    if (!email) return { success: false, message: 'Session de réinitialisation expirée.' }

    try {
      const result = await api.post<null>('/auth/reset-password', { email, otp: code, newPassword })
      removeItem(RESET_EMAIL_KEY)
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },
}
