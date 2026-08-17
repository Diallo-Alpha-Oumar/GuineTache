import { useCallback, useEffect, useState } from 'react'
import type { AppNotification } from '@/types'
import { notificationService } from '@/services/notification.service'

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const refresh = useCallback(() => {
    if (!userId) {
      setNotifications([])
      return
    }
    setNotifications(notificationService.getForUser(userId))
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const markAsRead = useCallback(
    (id: string) => {
      notificationService.markAsRead(id)
      refresh()
    },
    [refresh],
  )

  const markAllAsRead = useCallback(() => {
    if (!userId) return
    notificationService.markAllAsRead(userId)
    refresh()
  }, [userId, refresh])

  const remove = useCallback(
    (id: string) => {
      notificationService.remove(id)
      refresh()
    },
    [refresh],
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, refresh, markAsRead, markAllAsRead, remove }
}
