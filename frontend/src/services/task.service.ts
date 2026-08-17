import { db } from '@/data/db'
import type { ApiResult, Task, TaskPriority, TaskStatus, TaskStats } from '@/types'
import { isOverdue } from '@/utils/date'
import { api, ApiRequestError } from '@/lib/api-client'
import { emailService } from './email.service'
import { notificationService } from './notification.service'
import { userService } from './user.service'

const MONGO_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/

interface BackendTask {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string | null
  assignedTo: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

const STATUS_FROM_BACKEND: Record<BackendTask['status'], TaskStatus> = {
  todo: 'TODO',
  in_progress: 'IN_PROGRESS',
  done: 'DONE',
}

const PRIORITY_TO_BACKEND: Record<TaskPriority, BackendTask['priority']> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
}

const PRIORITY_FROM_BACKEND: Record<BackendTask['priority'], TaskPriority> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  urgent: 'URGENT',
}

function toFrontendTask(task: BackendTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: STATUS_FROM_BACKEND[task.status],
    priority: PRIORITY_FROM_BACKEND[task.priority],
    dueDate: task.dueDate,
    assignedToId: task.assignedTo,
    createdById: task.createdBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.fieldErrors[0]?.message ?? error.message
  }
  return error instanceof Error ? error.message : 'Une erreur est survenue.'
}

export interface TaskFilters {
  search?: string
  status?: TaskStatus | 'ALL'
  priority?: TaskPriority | 'ALL'
  assignedToId?: string
}

export type TaskInput = {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string | null
  assignedToId: string | null
}

function notifyAssignment(task: Task, actorId: string) {
  if (!task.assignedToId || task.assignedToId === actorId) return

  const assignee = userService.getById(task.assignedToId)
  if (!assignee) return

  notificationService.create(
    assignee.id,
    'TASK_ASSIGNED',
    'Nouvelle tâche assignée',
    `Une nouvelle tâche vous a été assignée : ${task.title}.`,
    task.id,
  )
  emailService.sendTaskAssignedEmail(assignee.email, task.title)
}

export const taskService = {
  getAll(filters: TaskFilters = {}): Task[] {
    let tasks = db.getTasks()

    if (filters.assignedToId) {
      tasks = tasks.filter((t) => t.assignedToId === filters.assignedToId)
    }
    if (filters.search) {
      const term = filters.search.toLowerCase()
      tasks = tasks.filter(
        (t) => t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term),
      )
    }
    if (filters.status && filters.status !== 'ALL') {
      tasks = tasks.filter((t) => t.status === filters.status)
    }
    if (filters.priority && filters.priority !== 'ALL') {
      tasks = tasks.filter((t) => t.priority === filters.priority)
    }

    return tasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },

  getById(id: string): Task | null {
    return db.getTasks().find((t) => t.id === id) ?? null
  },

  async create(input: TaskInput, createdById: string): Promise<ApiResult<Task>> {
    // L'assignation n'est envoyée au backend que si elle correspond à un vrai
    // utilisateur MongoDB (les utilisateurs de démonstration ont des ids fictifs).
    const assignedTo =
      input.assignedToId && MONGO_OBJECT_ID_REGEX.test(input.assignedToId) ? input.assignedToId : null

    try {
      const result = await api.post<BackendTask>('/tasks', {
        title: input.title,
        description: input.description,
        priority: PRIORITY_TO_BACKEND[input.priority],
        dueDate: input.dueDate,
        assignedTo,
      })

      if (!result.data) {
        return { success: false, message: result.message ?? 'Erreur lors de la création de la tâche.' }
      }

      const task = toFrontendTask(result.data)
      // Miroir local le temps que les pages de liste/statistiques soient elles aussi connectées à l'API.
      db.saveTasks([{ ...task, assignedToId: input.assignedToId }, ...db.getTasks()])
      notifyAssignment({ ...task, assignedToId: input.assignedToId }, createdById)

      return { success: true, data: task, message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },

  update(id: string, changes: Partial<TaskInput>, actorId: string): Task | null {
    const tasks = db.getTasks()
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) return null

    const previous = tasks[index]
    const updated: Task = { ...previous, ...changes, updatedAt: new Date().toISOString() }
    tasks[index] = updated
    db.saveTasks(tasks)

    if (changes.assignedToId && changes.assignedToId !== previous.assignedToId) {
      notifyAssignment(updated, actorId)
    } else if (updated.assignedToId && updated.assignedToId !== actorId) {
      notificationService.create(
        updated.assignedToId,
        'TASK_UPDATED',
        'Tâche modifiée',
        `La tâche "${updated.title}" a été mise à jour.`,
        updated.id,
      )
    }

    if (changes.status === 'DONE' && previous.status !== 'DONE' && updated.assignedToId) {
      notificationService.create(
        updated.assignedToId,
        'TASK_COMPLETED',
        'Tâche terminée',
        `La tâche "${updated.title}" a été marquée comme terminée.`,
        updated.id,
      )
    }

    return updated
  },

  updateStatus(id: string, status: TaskStatus, actorId: string): Task | null {
    return taskService.update(id, { status }, actorId)
  },

  remove(id: string): void {
    db.saveTasks(db.getTasks().filter((t) => t.id !== id))
  },

  getStats(userId?: string): TaskStats {
    const tasks = userId ? db.getTasks().filter((t) => t.assignedToId === userId) : db.getTasks()
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      done: tasks.filter((t) => t.status === 'DONE').length,
      overdue: tasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
    }
  },
}
