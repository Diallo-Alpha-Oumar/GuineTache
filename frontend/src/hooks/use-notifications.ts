import { useCallback, useEffect, useState } from 'react'
import type { AppNotification } from '@/types'
import { notificationService } from '@/services/notification.service'

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      return
    }
    setNotifications(await notificationService.getForUser())
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const markAsRead = useCallback(
    async (id: string) => {
      await notificationService.markAsRead(id)
      await refresh()
    },
    [refresh],
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId) return
    await notificationService.markAllAsRead()
    await refresh()
  }, [userId, refresh])

  const remove = useCallback(
    async (id: string) => {
      await notificationService.remove(id)
      await refresh()
    },
    [refresh],
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, refresh, markAsRead, markAllAsRead, remove }
}
