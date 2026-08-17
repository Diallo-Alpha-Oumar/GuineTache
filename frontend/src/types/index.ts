// ============================================================================
// Types centralisés de l'application
// ============================================================================

export type UserRole = 'USER' | 'ADMIN'

export interface User {
  id: string
  fullName: string
  email: string
  password: string // uniquement utilisé côté mock/localStorage
  role: UserRole
  isActive: boolean
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export type PublicUser = Omit<User, 'password'>

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: string
  updatedAt: string
  dueDate: string | null
  assignedToId: string | null
  createdById: string
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'TASK_OVERDUE'
  | 'SYSTEM'

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  relatedTaskId?: string
}

export interface AuthSession {
  userId: string
  token: string
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface ApiResult<T> {
  success: boolean
  data?: T
  message?: string
}

export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  done: number
  overdue: number
}

export interface AdminStats extends TaskStats {
  totalUsers: number
  activeUsers: number
  tasksPerUser: { userName: string; count: number }[]
}
