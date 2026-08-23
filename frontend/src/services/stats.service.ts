import type { AdminStats } from '@/types'
import { taskService } from './task.service'
import { userService } from './user.service'

export const statsService = {
  async getAdminStats(): Promise<AdminStats> {
    const [base, tasks, users] = await Promise.all([
      taskService.getStats(),
      taskService.getAll(),
      userService.getAll({ role: 'USER' }),
    ])

    const tasksPerUser = users.map((user) => ({
      userName: user.fullName,
      count: tasks.filter((t) => t.assignedToId === user.id).length,
    }))

    return {
      ...base,
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      tasksPerUser,
    }
  },
}
