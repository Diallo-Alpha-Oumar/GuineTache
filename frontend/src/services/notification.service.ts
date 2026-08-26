import type { AppNotification, NotificationType } from '@/types'
import { api } from '@/lib/api-client'

interface BackendNotification {
  id: string
  user: string
  type: 'task_assigned' | 'task_updated' | 'task_completed' | 'task_overdue' | 'system'
  title: string
  message: string
  relatedTask: string | null
  read: boolean
  createdAt: string
}

const TYPE_FROM_BACKEND: Record<BackendNotification['type'], NotificationType> = {
  task_assigned: 'TASK_ASSIGNED',
  task_updated: 'TASK_UPDATED',
  task_completed: 'TASK_COMPLETED',
  task_overdue: 'TASK_OVERDUE',
  system: 'SYSTEM',
}

function toFrontendNotification(notification: BackendNotification): AppNotification {
  return {
    id: notification.id,
    userId: notification.user,
    type: TYPE_FROM_BACKEND[notification.type],
    title: notification.title,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt,
    relatedTaskId: notification.relatedTask ?? undefined,
  }
}

export const notificationService = {
  async getForUser(): Promise<AppNotification[]> {
    try {
      const result = await api.get<{ notifications: BackendNotification[] }>('/notifications?limit=50')
      return (result.data?.notifications ?? []).map(toFrontendNotification)
    } catch {
      return []
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const result = await api.get<{ count: number }>('/notifications/unread-count')
      return result.data?.count ?? 0
    } catch {
      return 0
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await api.patch(`/notifications/${id}/read`)
    } catch {
      // silencieux : une notification déjà lue/supprimée ne doit pas bloquer l'UI
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/read-all')
    } catch {
      // silencieux
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/notifications/${id}`)
    } catch {
      // silencieux
    }
  },
}
