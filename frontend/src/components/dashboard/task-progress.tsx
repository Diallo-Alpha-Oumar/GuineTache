import { CheckCircle2, Circle, TimerReset } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCountUp } from '@/hooks/use-count-up'
import { cn } from '@/lib/utils'
import type { TaskStats } from '@/types'

interface TaskProgressProps {
  stats: TaskStats
  title?: string
}

interface ProgressRowProps {
  icon: typeof CheckCircle2
  iconClassName: string
  label: string
  value: number
}

function ProgressRow({ icon: Icon, iconClassName, label, value }: ProgressRowProps) {
  return (
    <li className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-accent">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className={cn('size-4', iconClassName)} />
        {label}
      </span>
      <span className="font-medium tabular-nums">{value}</span>
    </li>
  )
}

export function TaskProgress({ stats, title = 'Progression globale' }: TaskProgressProps) {
  const percentage = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const animatedPercentage = useCountUp(percentage, 900)

  return (
    <Card className="h-full hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div
          className="relative flex size-40 shrink-0 items-center justify-center rounded-full transition-[background] duration-300 ease-out"
          style={{
            background: `conic-gradient(var(--color-primary) ${animatedPercentage * 3.6}deg, var(--color-muted) 0deg)`,
          }}
        >
          <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-card">
            <span className="text-3xl font-semibold tabular-nums">{animatedPercentage}%</span>
            <span className="text-xs text-muted-foreground">terminé</span>
          </div>
        </div>

        <ul className="w-full space-y-2 text-sm">
          <ProgressRow icon={CheckCircle2} iconClassName="text-success" label="Terminées" value={stats.done} />
          <ProgressRow icon={TimerReset} iconClassName="text-primary" label="En cours" value={stats.inProgress} />
          <ProgressRow icon={Circle} iconClassName="text-muted-foreground" label="À faire" value={stats.todo} />
        </ul>
      </CardContent>
    </Card>
  )
}
