import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface QuickAction {
  label: string
  description?: string
  href: string
  icon: ComponentType<{ className?: string }>
}

interface QuickActionsProps {
  actions: QuickAction[]
  title?: string
}

export function QuickActions({ actions, title = 'Actions rapides' }: QuickActionsProps) {
  return (
    <Card className="h-full hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {actions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="group flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
              <action.icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{action.label}</p>
              {action.description && <p className="truncate text-xs text-muted-foreground">{action.description}</p>}
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
