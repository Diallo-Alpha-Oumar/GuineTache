import type { ApiResult, Task, TaskPriority, TaskStatus, TaskStats } from '@/types'
import { api, ApiRequestError } from '@/lib/api-client'

const MONGO_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/

interface BackendTask {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'cancelled' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string | null
  assignedTo: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface BackendTaskStats {
  total: number
  todo: number
  inProgress: number
  cancelled: number
  done: number
  overdue: number
}

const STATUS_FROM_BACKEND: Record<BackendTask['status'], TaskStatus> = {
  todo: 'TODO',
  in_progress: 'IN_PROGRESS',
  cancelled: 'CANCELLED',
  done: 'DONE',
}

const STATUS_TO_BACKEND: Record<TaskStatus, BackendTask['status']> = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  CANCELLED: 'cancelled',
  DONE: 'done',
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

const EMPTY_STATS: TaskStats = { total: 0, todo: 0, inProgress: 0, cancelled: 0, done: 0, overdue: 0 }

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

export const taskService = {
  // Le backend applique déjà le filtrage par utilisateur : un compte non-admin ne
  // reçoit ici que les tâches qu'il a créées ou qui lui sont assignées.
  async getAll(filters: TaskFilters = {}): Promise<Task[]> {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status && filters.status !== 'ALL') params.set('status', STATUS_TO_BACKEND[filters.status])
    if (filters.priority && filters.priority !== 'ALL') params.set('priority', PRIORITY_TO_BACKEND[filters.priority])
    if (filters.assignedToId && MONGO_OBJECT_ID_REGEX.test(filters.assignedToId)) {
      params.set('assignedTo', filters.assignedToId)
    }
    params.set('limit', '100')

    try {
      const result = await api.get<{ tasks: BackendTask[] }>(`/tasks?${params.toString()}`)
      return (result.data?.tasks ?? []).map(toFrontendTask)
    } catch {
      return []
    }
  },

  async getById(id: string): Promise<Task | null> {
    if (!MONGO_OBJECT_ID_REGEX.test(id)) return null

    try {
      const result = await api.get<{ task: BackendTask }>(`/tasks/${id}`)
      return result.data ? toFrontendTask(result.data.task) : null
    } catch {
      return null
    }
  },

  async create(input: TaskInput, _createdById: string): Promise<ApiResult<Task>> {
    // L'assignation n'est envoyée au backend que si elle correspond à un vrai
    // utilisateur MongoDB (les utilisateurs de démonstration ont des ids fictifs).
    const assignedTo =
      input.assignedToId && MONGO_OBJECT_ID_REGEX.test(input.assignedToId) ? input.assignedToId : null

    try {
      const result = await api.post<{ task: BackendTask }>('/tasks', {
        title: input.title,
        description: input.description,
        priority: PRIORITY_TO_BACKEND[input.priority],
        dueDate: input.dueDate,
        assignedTo,
      })

      if (!result.data) {
        return { success: false, message: result.message ?? 'Erreur lors de la création de la tâche.' }
      }

      const task = toFrontendTask(result.data.task)

      return { success: true, data: task, message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },

  async update(id: string, changes: Partial<TaskInput>, _actorId: string): Promise<ApiResult<Task>> {
    if (!MONGO_OBJECT_ID_REGEX.test(id)) {
      return { success: false, message: 'Tâche introuvable.' }
    }

    const payload: Record<string, unknown> = {}
    if (changes.title !== undefined) payload.title = changes.title
    if (changes.description !== undefined) payload.description = changes.description
    if (changes.status !== undefined) payload.status = STATUS_TO_BACKEND[changes.status]
    if (changes.priority !== undefined) payload.priority = PRIORITY_TO_BACKEND[changes.priority]
    if (changes.dueDate !== undefined) payload.dueDate = changes.dueDate
    if (changes.assignedToId !== undefined) {
      payload.assignedTo =
        changes.assignedToId && MONGO_OBJECT_ID_REGEX.test(changes.assignedToId) ? changes.assignedToId : null
    }

    try {
      const result = await api.patch<{ task: BackendTask }>(`/tasks/${id}`, payload)
      if (!result.data) {
        return { success: false, message: result.message ?? 'Erreur lors de la mise à jour de la tâche.' }
      }

      const updated = { ...toFrontendTask(result.data.task), assignedToId: changes.assignedToId ?? result.data.task.assignedTo }

      return { success: true, data: updated, message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },

  async updateStatus(id: string, status: TaskStatus, actorId: string): Promise<ApiResult<Task>> {
    return taskService.update(id, { status }, actorId)
  },

  async remove(id: string): Promise<ApiResult<void>> {
    if (!MONGO_OBJECT_ID_REGEX.test(id)) {
      return { success: true }
    }

    try {
      const result = await api.delete<void>(`/tasks/${id}`)
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },

  async restore(id: string): Promise<ApiResult<void>> {
    try {
      const result = await api.patch<void>(`/tasks/${id}/restore`)
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, message: errorMessage(error) }
    }
  },

  // Reflète toujours les tâches du compte authentifié (ou l'ensemble de la
  // plateforme pour un administrateur) : le périmètre est appliqué côté backend.
  async getStats(): Promise<TaskStats> {
    try {
      const result = await api.get<{ stats: BackendTaskStats }>('/tasks/stats')
      return result.data?.stats ?? EMPTY_STATS
    } catch {
      return EMPTY_STATS
    }
  },
}
