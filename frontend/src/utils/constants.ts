import type { TaskPriority, TaskStatus, NotificationType } from '@/types'

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminée',
}

export const TASK_STATUS_BADGE: Record<TaskStatus, string> = {
  TODO: 'bg-muted text-muted-foreground border-border',
  IN_PROGRESS: 'bg-primary/10 text-primary border-primary/20',
  DONE: 'bg-success/10 text-success border-success/20',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente',
}

export const TASK_PRIORITY_BADGE: Record<TaskPriority, string> = {
  LOW: 'bg-muted text-muted-foreground border-border',
  MEDIUM: 'bg-warning/10 text-warning border-warning/20',
  HIGH: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  URGENT: 'bg-destructive/10 text-destructive border-destructive/20',
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  TASK_ASSIGNED: 'Tâche assignée',
  TASK_UPDATED: 'Tâche modifiée',
  TASK_COMPLETED: 'Tâche terminée',
  TASK_OVERDUE: 'Tâche en retard',
  SYSTEM: 'Système',
}

export const DEMO_OTP_CODE = '123456'
