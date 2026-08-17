import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, ListTodo } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/common/empty-state'
import { StatusBadge } from '@/components/tasks/status-badge'
import { PriorityBadge } from '@/components/tasks/priority-badge'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import { formatDate } from '@/utils/date'

interface RecentTasksProps {
  tasks: Task[]
  title?: string
  viewAllHref: string
  newTaskHref: string
  getAssigneeName?: (assignedToId: string | null) => string
  getRowHref?: (task: Task) => string
  emptyDescription?: string
}

export function RecentTasks({
  tasks,
  title = 'Tâches récentes',
  viewAllHref,
  newTaskHref,
  getAssigneeName,
  getRowHref,
  emptyDescription = 'Créez votre première tâche pour commencer.',
}: RecentTasksProps) {
  const navigate = useNavigate()

  return (
    <Card className="hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button variant="link" asChild className="h-auto p-0">
          <Link to={viewAllHref}>Voir toutes les tâches</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="Aucune tâche pour le moment"
            description={emptyDescription}
            action={
              <Button asChild size="sm">
                <Link to={newTaskHref}>Créer une tâche</Link>
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tâche</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Échéance</TableHead>
                {getAssigneeName && <TableHead>Assignée à</TableHead>}
                {getRowHref && <TableHead className="w-8" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task.id}
                  onClick={getRowHref ? () => navigate(getRowHref(task)) : undefined}
                  className={cn(getRowHref && 'cursor-pointer')}
                >
                  <TableCell className="max-w-56 truncate font-medium">{task.title}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(task.dueDate)}</TableCell>
                  {getAssigneeName && (
                    <TableCell className="text-muted-foreground">{getAssigneeName(task.assignedToId)}</TableCell>
                  )}
                  {getRowHref && (
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
