import { db } from '@/data/db'
import type { AppNotification, NotificationType } from '@/types'
import { generateId } from '@/utils/id'

export const notificationService = {
  getForUser(userId: string): AppNotification[] {
    return db
      .getNotifications()
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getUnreadCount(userId: string): number {
    return db.getNotifications().filter((n) => n.userId === userId && !n.read).length
  },

  create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedTaskId?: string,
  ): AppNotification {
    const notification: AppNotification = {
      id: generateId('notif'),
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      relatedTaskId,
    }
    db.saveNotifications([notification, ...db.getNotifications()])
    return notification
  },

  markAsRead(id: string): void {
    const notifications = db.getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n))
    db.saveNotifications(notifications)
  },

  markAllAsRead(userId: string): void {
    const notifications = db.getNotifications().map((n) => (n.userId === userId ? { ...n, read: true } : n))
    db.saveNotifications(notifications)
  },

  remove(id: string): void {
    db.saveNotifications(db.getNotifications().filter((n) => n.id !== id))
  },
}
