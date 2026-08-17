import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpDown, Eye, ListTodo, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TaskFiltersBar } from '@/components/tasks/task-filters-bar'
import { StatusBadge } from '@/components/tasks/status-badge'
import { PriorityBadge } from '@/components/tasks/priority-badge'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAuth } from '@/hooks/use-auth'
import { usePagination } from '@/hooks/use-pagination'
import { taskService } from '@/services/task.service'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import { formatDate } from '@/utils/date'

type SortKey = 'dueDate' | 'priority' | 'updatedAt'

const PRIORITY_ORDER: Record<TaskPriority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, URGENT: 3 }

export function UserTasksListPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | 'ALL'>('ALL')
  const [priority, setPriority] = useState<TaskPriority | 'ALL'>('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  function refresh() {
    if (!user) return
    setTasks(taskService.getAll({ assignedToId: user.id }))
  }

  useEffect(refresh, [user])

  const filtered = useMemo(() => {
    let result = tasks
    if (search) {
      const term = search.toLowerCase()
      result = result.filter((t) => t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term))
    }
    if (status !== 'ALL') result = result.filter((t) => t.status === status)
    if (priority !== 'ALL') result = result.filter((t) => t.priority === priority)

    return [...result].sort((a, b) => {
      if (sortKey === 'priority') return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
      if (sortKey === 'dueDate') return (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [tasks, search, status, priority, sortKey])

  const { page, totalPages, setPage, paginated } = usePagination(filtered, 6)

  function handleDelete() {
    if (!taskToDelete) return
    taskService.remove(taskToDelete.id)
    toast.success('Tâche supprimée')
    setTaskToDelete(null)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Mes tâches</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} tâche(s) trouvée(s)</p>
        </div>
        <Button asChild>
          <Link to="/user/tasks/new">
            <PlusCircle />
            Nouvelle tâche
          </Link>
        </Button>
      </div>

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
            <EmptyState
              icon={ListTodo}
              title="Aucune tâche trouvée"
              description="Essayez de modifier vos filtres ou créez une nouvelle tâche."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1" onClick={() => setSortKey('priority')}>
                        Priorité <ArrowUpDown className="size-3" />
                      </button>
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1" onClick={() => setSortKey('dueDate')}>
                        Échéance <ArrowUpDown className="size-3" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="max-w-56 truncate font-medium">{task.title}</TableCell>
                      <TableCell>
                        <PriorityBadge priority={task.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={task.status} />
                      </TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/user/tasks/${task.id}`} aria-label="Voir">
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/user/tasks/${task.id}?edit=1`} aria-label="Modifier">
                              <Pencil className="size-4" />
                            </Link>
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

      <ConfirmDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title="Supprimer cette tâche ?"
        description={`Êtes-vous sûr de vouloir supprimer "${taskToDelete?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </div>
  )
}
