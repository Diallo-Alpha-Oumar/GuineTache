import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types'
import { TASK_STATUS_BADGE, TASK_STATUS_LABELS } from '@/utils/constants'

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn(TASK_STATUS_BADGE[status], className)}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  )
}
