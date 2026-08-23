import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListTodo, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskFiltersBar } from '@/components/tasks/task-filters-bar'
import { StatusBadge } from '@/components/tasks/status-badge'
import { PriorityBadge } from '@/components/tasks/priority-badge'
import { TaskForm } from '@/components/tasks/task-form'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAuth } from '@/hooks/use-auth'
import { usePagination } from '@/hooks/use-pagination'
import { taskService } from '@/services/task.service'
import { userService } from '@/services/user.service'
import type { PublicUser, Task, TaskPriority, TaskStatus } from '@/types'
import { formatDate } from '@/utils/date'
import { TASK_STATUS_LABELS } from '@/utils/constants'
import type { TaskFormValues } from '@/utils/validation'

export function AdminTasksListPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<PublicUser[]>([])
  const [allUsers, setAllUsers] = useState<PublicUser[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | 'ALL'>('ALL')
  const [priority, setPriority] = useState<TaskPriority | 'ALL'>('ALL')
  const [scope, setScope] = useState<'all' | 'mine'>('all')
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refresh() {
    taskService.getAll().then(setTasks)
    userService.getAll({ role: 'USER' }).then(setUsers)
    userService.getAll().then(setAllUsers)
  }

  useEffect(refresh, [])

  const filtered = useMemo(() => {
    let result = tasks
    if (scope === 'mine' && user) {
      result = result.filter((t) => t.createdById === user.id)
    }
    if (search) {
      const term = search.toLowerCase()
      result = result.filter((t) => t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term))
    }
    if (status !== 'ALL') result = result.filter((t) => t.status === status)
    if (priority !== 'ALL') result = result.filter((t) => t.priority === priority)
    return result
  }, [tasks, search, status, priority, scope, user])
  const { page, totalPages, setPage, paginated } = usePagination(filtered, 8)

  function userName(id: string | null) {
    if (!id) return 'Non assignée'
    return allUsers.find((u) => u.id === id)?.fullName ?? 'Utilisateur inconnu'
  }

  async function handleStatusChange(task: Task, newStatus: TaskStatus) {
    if (!user) return
    const result = await taskService.updateStatus(task.id, newStatus, user.id)
    if (result.success) {
      toast.success('Statut mis à jour')
      refresh()
    } else {
      toast.error(result.message ?? 'Impossible de mettre à jour le statut.')
    }
  }

  async function handleEditSubmit(values: TaskFormValues) {
    if (!taskToEdit || !user) return
    const result = await taskService.update(taskToEdit.id, values, user.id)
    if (result.success) {
      toast.success('Tâche mise à jour')
      setTaskToEdit(null)
      refresh()
    } else {
      toast.error(result.message ?? 'Impossible de mettre à jour la tâche.')
    }
  }

  async function handleDelete() {
    if (!taskToDelete) return
    setIsDeleting(true)
    const result = await taskService.remove(taskToDelete.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success('Tâche supprimée avec succès.')
      setTaskToDelete(null)
      refresh()
    } else {
      toast.error(result.message ?? 'Impossible de supprimer cette tâche.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Gestion des tâches</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} tâche(s)</p>
        </div>
        <Button asChild>
          <Link to="/admin/tasks/new">
            <PlusCircle />
            Nouvelle tâche
          </Link>
        </Button>
      </div>

      <Tabs value={scope} onValueChange={(v) => setScope(v as 'all' | 'mine')}>
        <TabsList>
          <TabsTrigger value="all">Toutes les tâches</TabsTrigger>
          <TabsTrigger value="mine">Mes tâches</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <TaskFiltersBar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            priority={priority}
            onPriorityChange={setPriority}
          />

          {filtered.length === 0 ? (
            <EmptyState icon={ListTodo} title="Aucune tâche trouvée" description="Essayez de modifier vos filtres." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Créé par</TableHead>
                    <TableHead>Assigné à</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="max-w-56 truncate font-medium">{task.title}</TableCell>
                      <TableCell className="text-muted-foreground">{userName(task.createdById)}</TableCell>
                      <TableCell className="text-muted-foreground">{userName(task.assignedToId)}</TableCell>
                      <TableCell>
                        <PriorityBadge priority={task.priority} />
                      </TableCell>
                      <TableCell>
                        <Select value={task.status} onValueChange={(v) => handleStatusChange(task, v as TaskStatus)}>
                          <SelectTrigger size="sm" className="w-36">
                            <SelectValue>
                              <StatusBadge status={task.status} />
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setTaskToEdit(task)} aria-label="Modifier">
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setTaskToDelete(task)} aria-label="Supprimer">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!taskToEdit} onOpenChange={(open) => !open && setTaskToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
          </DialogHeader>
          {taskToEdit && (
            <TaskForm task={taskToEdit} assignableUsers={users} onSubmit={handleEditSubmit} submitLabel="Enregistrer" />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title="Supprimer cette tâche ?"
        description={`Êtes-vous sûr de vouloir supprimer "${taskToDelete?.title}" ? Cette tâche ne sera plus visible dans la liste.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  )
}
