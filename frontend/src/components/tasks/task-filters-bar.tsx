import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/utils/constants'
import type { TaskPriority, TaskStatus } from '@/types'

interface TaskFiltersBarProps {
  search: string
  onSearchChange: (value: string) => void
  status: TaskStatus | 'ALL'
  onStatusChange: (value: TaskStatus | 'ALL') => void
  priority: TaskPriority | 'ALL'
  onPriorityChange: (value: TaskPriority | 'ALL') => void
}

export function TaskFiltersBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
}: TaskFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher une tâche..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={status} onValueChange={(v) => onStatusChange(v as TaskStatus | 'ALL')}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tous les statuts</SelectItem>
          {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={(v) => onPriorityChange(v as TaskPriority | 'ALL')}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Priorité" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Toutes les priorités</SelectItem>
          {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
