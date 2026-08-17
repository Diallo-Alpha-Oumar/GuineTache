import type { ComponentType } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useCountUp } from '@/hooks/use-count-up'
import { cn } from '@/lib/utils'

interface StatCardTrend {
  label: string
  positive?: boolean
}

interface StatCardProps {
  label: string
  value: number | string
  icon: ComponentType<{ className?: string }>
  tone?: 'default' | 'success' | 'warning' | 'destructive'
  trend?: StatCardTrend
}

const TONE_STYLES: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
}

function AnimatedValue({ value }: { value: number | string }) {
  const numeric = typeof value === 'number' ? value : Number(value)
  const animated = useCountUp(Number.isFinite(numeric) ? numeric : 0)
  return <>{typeof value === 'number' ? animated : value}</>
}

export function StatCard({ label, value, icon: Icon, tone = 'default', trend }: StatCardProps) {
  return (
    <Card className="group cursor-default hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110',
            TONE_STYLES[tone],
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold leading-tight tabular-nums">
            <AnimatedValue value={value} />
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {trend && (
            <p
              className={cn(
                'mt-1 flex items-center gap-1 text-xs font-medium',
                trend.positive === false ? 'text-destructive' : 'text-success',
              )}
            >
              {trend.positive === false ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
              {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
