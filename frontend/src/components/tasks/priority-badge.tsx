import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskPriority } from '@/types'
import { TASK_PRIORITY_BADGE, TASK_PRIORITY_LABELS } from '@/utils/constants'

export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  return (
    <Badge variant="outline" className={cn(TASK_PRIORITY_BADGE[priority], className)}>
      {TASK_PRIORITY_LABELS[priority]}
    </Badge>
  )
}
