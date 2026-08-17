import type { AppNotification, Task, User } from '@/types'
import { SEED_NOTIFICATIONS, SEED_TASKS, SEED_USERS } from './seed'
import { getItem, setItem, STORAGE_KEYS } from '@/utils/storage'

// Simule une base de données persistée dans localStorage, initialisée une
// seule fois avec le jeu de données de démonstration.
function ensureSeeded(): void {
  const seeded = getItem<boolean>(STORAGE_KEYS.seeded, false)
  if (seeded) return

  setItem(STORAGE_KEYS.users, SEED_USERS)
  setItem(STORAGE_KEYS.tasks, SEED_TASKS)
  setItem(STORAGE_KEYS.notifications, SEED_NOTIFICATIONS)
  setItem(STORAGE_KEYS.seeded, true)
}

ensureSeeded()

export const db = {
  getUsers(): User[] {
    return getItem<User[]>(STORAGE_KEYS.users, [])
  },
  saveUsers(users: User[]): void {
    setItem(STORAGE_KEYS.users, users)
  },
  getTasks(): Task[] {
    return getItem<Task[]>(STORAGE_KEYS.tasks, [])
  },
  saveTasks(tasks: Task[]): void {
    setItem(STORAGE_KEYS.tasks, tasks)
  },
  getNotifications(): AppNotification[] {
    return getItem<AppNotification[]>(STORAGE_KEYS.notifications, [])
  },
  saveNotifications(notifications: AppNotification[]): void {
    setItem(STORAGE_KEYS.notifications, notifications)
  },
  reset(): void {
    setItem(STORAGE_KEYS.users, SEED_USERS)
    setItem(STORAGE_KEYS.tasks, SEED_TASKS)
    setItem(STORAGE_KEYS.notifications, SEED_NOTIFICATIONS)
    setItem(STORAGE_KEYS.seeded, true)
  },
}
