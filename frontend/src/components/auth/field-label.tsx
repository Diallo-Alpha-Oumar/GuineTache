import type { ComponentProps } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn('font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase', className)}
      {...props}
    />
  )
}
