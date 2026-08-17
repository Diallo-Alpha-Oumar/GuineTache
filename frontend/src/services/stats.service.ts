import { db } from '@/data/db'
import type { AdminStats } from '@/types'
import { isOverdue } from '@/utils/date'
import { taskService } from './task.service'

export const statsService = {
  getAdminStats(): AdminStats {
    const tasks = db.getTasks()
    const users = db.getUsers().filter((u) => u.role === 'USER')
    const base = taskService.getStats()

    const tasksPerUser = users.map((user) => ({
      userName: user.fullName,
      count: tasks.filter((t) => t.assignedToId === user.id).length,
    }))

    return {
      ...base,
      overdue: tasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      tasksPerUser,
    }
  },
}
