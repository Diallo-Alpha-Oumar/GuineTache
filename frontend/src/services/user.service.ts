import { api, ApiRequestError } from '@/lib/api-client'
import type { ApiResult, PublicUser, UserRole } from '@/types'

interface BackendUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'user' | 'admin'
  isEmailVerified: boolean
  isActive: boolean
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

function toPublicUser(user: BackendUser): PublicUser {
  return {
    id: user.id,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role: (user.role === 'admin' ? 'ADMIN' : 'USER') as UserRole,
    isActive: user.isActive,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
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

export interface UserFilters {
  search?: string
  role?: UserRole | 'ALL'
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE'
}

export interface UserUpdateInput {
  fullName?: string
  email?: string
  role?: UserRole
}

export const userService = {
  async getAll(filters: UserFilters = {}): Promise<PublicUser[]> {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.role && filters.role !== 'ALL') params.set('role', filters.role.toLowerCase())
    if (filters.status && filters.status !== 'ALL') {
      params.set('status', filters.status === 'ACTIVE' ? 'active' : 'inactive')
    }
    params.set('limit', '100')

    try {
      const result = await api.get<{ users: BackendUser[] }>(`/users?${params.toString()}`)
      return (result.data?.users ?? []).map(toPublicUser)
    } catch {
      return []
    }
  },

  async getById(id: string): Promise<PublicUser | null> {
    try {
      const result = await api.get<{ user: BackendUser }>(`/users/${id}`)
      return result.data ? toPublicUser(result.data.user) : null
    } catch {
      return null
    }
  },

  async update(id: string, changes: UserUpdateInput): Promise<ApiResult<PublicUser>> {
    const payload: Record<string, string> = {}
    if (changes.fullName !== undefined) {
      const { firstName, lastName } = splitFullName(changes.fullName)
      payload.firstName = firstName
      payload.lastName = lastName
    }
    if (changes.email !== undefined) payload.email = changes.email
    if (changes.role !== undefined) payload.role = changes.role.toLowerCase()

    try {
      const result = await api.patch<{ user: BackendUser }>(`/users/${id}`, payload)
      if (!result.data) {
        return { success: false, message: result.message ?? "Erreur lors de la mise à jour de l'utilisateur." }
      }
      return { success: true, data: toPublicUser(result.data.user), message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },

  async toggleActive(id: string): Promise<ApiResult<PublicUser>> {
    try {
      const result = await api.patch<{ user: BackendUser }>(`/users/${id}/toggle-active`)
      if (!result.data) {
        return { success: false, message: result.message ?? 'Erreur lors du changement de statut.' }
      }
      return { success: true, data: toPublicUser(result.data.user), message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },

  async remove(id: string): Promise<ApiResult<void>> {
    try {
      const result = await api.delete<void>(`/users/${id}`)
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },
}
