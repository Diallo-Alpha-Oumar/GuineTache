import { api, ApiRequestError } from '@/lib/api-client'
import type { ApiResult, AppSettings } from '@/types'

interface BackendSettings {
  id: string
  registrationOpen: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
  notifications: AppSettings['notifications']
  updatedAt: string
}

function toAppSettings(settings: BackendSettings): AppSettings {
  return {
    registrationOpen: settings.registrationOpen,
    maintenanceMode: settings.maintenanceMode,
    maintenanceMessage: settings.maintenanceMessage,
    notifications: settings.notifications,
    updatedAt: settings.updatedAt,
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.fieldErrors[0]?.message ?? error.message
  }
  return error instanceof Error ? error.message : 'Une erreur est survenue.'
}

export const adminService = {
  async getSettings(): Promise<AppSettings | null> {
    try {
      const result = await api.get<{ settings: BackendSettings }>('/settings')
      return result.data ? toAppSettings(result.data.settings) : null
    } catch {
      return null
    }
  },

  async updateSettings(changes: Partial<AppSettings>): Promise<ApiResult<AppSettings>> {
    try {
      const result = await api.patch<{ settings: BackendSettings }>('/settings', changes)
      if (!result.data) {
        return { success: false, message: result.message ?? 'Impossible de mettre à jour les paramètres.' }
      }
      return { success: true, data: toAppSettings(result.data.settings), message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },
}
