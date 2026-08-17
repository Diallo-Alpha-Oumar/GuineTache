import type { ReactNode } from 'react'

interface DashboardHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}

export function DashboardHeader({ eyebrow, title, subtitle, action }: DashboardHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {eyebrow && <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
