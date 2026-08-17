import type { ComponentType } from 'react'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { formatRelative } from '@/utils/date'

export interface ActivityItem {
  id: string
  title: string
  description: string
  createdAt: string
  icon: ComponentType<{ className?: string }>
}

interface RecentActivityProps {
  items: ActivityItem[]
  title?: string
}

export function RecentActivity({ items, title = 'Activité récente' }: RecentActivityProps) {
  return (
    <Card className="h-full hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={Activity} title="Aucune activité récente" />
        ) : (
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={item.id} className="group relative flex gap-3 rounded-md p-2 pl-1 transition-colors hover:bg-accent">
                {index < items.length - 1 && (
                  <span className="absolute top-9 left-[19px] h-[calc(100%-14px)] w-px bg-border" aria-hidden="true" />
                )}
                <div className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                  <item.icon className="size-4" />
                </div>
                <div className="min-w-0 pb-0.5">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelative(item.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
