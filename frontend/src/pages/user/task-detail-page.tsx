import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/tasks/status-badge'
import { PriorityBadge } from '@/components/tasks/priority-badge'
import { TaskForm } from '@/components/tasks/task-form'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAuth } from '@/hooks/use-auth'
import { taskService } from '@/services/task.service'
import type { Task, TaskStatus } from '@/types'
import { formatDateTime } from '@/utils/date'
import { TASK_STATUS_LABELS } from '@/utils/constants'
import { canChangeTaskStatus } from '@/utils/task-permissions'
import type { TaskFormValues } from '@/utils/validation'

export function UserTaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const isEditing = searchParams.get('edit') === '1'
  const navigate = useNavigate()
  const { user } = useAuth()

  const [task, setTask] = useState<Task | null | undefined>(undefined)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    taskService.getById(id).then(setTask)
  }, [id])

  if (task === undefined) return null

  if (!task) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Cette tâche n'existe pas ou a été supprimée.</p>
        <Button asChild variant="outline">
          <Link to="/user/tasks">Retour aux tâches</Link>
        </Button>
      </div>
    )
  }

  async function handleStatusChange(status: TaskStatus) {
    if (!task || !user) return
    const result = await taskService.updateStatus(task.id, status, user.id)
    if (result.success && result.data) {
      setTask(result.data)
      toast.success('Statut mis à jour')
    } else {
      toast.error(result.message ?? 'Impossible de mettre à jour le statut.')
    }
  }

  async function handleEditSubmit(values: TaskFormValues) {
    if (!task || !user) return
    const result = await taskService.update(task.id, values, user.id)
    if (result.success && result.data) {
      setTask(result.data)
      toast.success('Tâche mise à jour')
      setSearchParams({})
    } else {
      toast.error(result.message ?? 'Impossible de mettre à jour la tâche.')
    }
  }

  const canChangeStatus = !!user && canChangeTaskStatus(task, user.id)

  async function handleDelete() {
    if (!task) return
    setIsDeleting(true)
    const result = await taskService.remove(task.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success('Tâche supprimée avec succès.')
      navigate('/user/tasks')
    } else {
      toast.error(result.message ?? 'Impossible de supprimer cette tâche.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate('/user/tasks')}>
        <ArrowLeft className="size-4" />
        Retour
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{isEditing ? 'Modifier la tâche' : task.title}</CardTitle>
            {!isEditing && (
              <div className="mt-2 flex flex-wrap gap-2">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>
            )}
          </div>
          {!isEditing && (
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => setSearchParams({ edit: '1' })} aria-label="Modifier">
                <Pencil className="size-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setConfirmDelete(true)} aria-label="Supprimer">
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <TaskForm
              task={task}
              onSubmit={handleEditSubmit}
              submitLabel="Enregistrer les modifications"
              statusEditable={canChangeStatus}
            />
          ) : (
            <>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{task.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Créée le</p>
                  <p>{formatDateTime(task.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modifiée le</p>
                  <p>{formatDateTime(task.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date limite</p>
                  <p>{formatDateTime(task.dueDate)}</p>
                </div>
              </div>

              {canChangeStatus ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Changer le statut</p>
                  <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                    <SelectTrigger className="w-full sm:w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <p className="text-xs text-muted-foreground">
                    {task.assignedToId
                      ? 'Seule la personne assignée peut modifier le statut de cette tâche.'
                      : "Vous n'avez pas le droit de modifier le statut de cette tâche."}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Supprimer cette tâche ?"
        description="Êtes-vous sûr de vouloir supprimer cette tâche ? Cette tâche ne sera plus visible dans votre liste."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  )
}
