import type { Task } from '@/types'

// Une fois la tâche attribuée à quelqu'un, seule cette personne pilote son avancement :
// ni le créateur ni un admin ne reprennent la main sur le statut. Sans assigné, le
// créateur reste responsable puisque personne d'autre ne peut le faire.
export function canChangeTaskStatus(task: Task, userId: string): boolean {
  return task.assignedToId ? task.assignedToId === userId : task.createdById === userId
}
