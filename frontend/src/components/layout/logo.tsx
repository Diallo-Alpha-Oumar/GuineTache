import logoMark from '@/assets/logo-mark.svg'
import { cn } from '@/lib/utils'

interface LogoProps {
  withWordmark?: boolean
  size?: number
  className?: string
}

export function Logo({ withWordmark = true, size = 32, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img src={logoMark} alt="GuineeTache" width={size} height={size} className="shrink-0" />
      {withWordmark && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Guinee<span className="font-bold">Tache</span>
        </span>
      )}
    </div>
  )
}
