import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'
import { useNotifications } from '@/hooks/use-notifications'
import { formatRelative } from '@/utils/date'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  basePath: string
}

export function NotificationBell({ basePath }: NotificationBellProps) {
  const { user } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id)
  const recent = notifications.slice(0, 5)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative transition-transform hover:scale-105" aria-label="Notifications">
          <Bell className={cn('size-4 transition-transform', unreadCount > 0 && 'animate-[wiggle_2.5s_ease-in-out_infinite]')} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive/60" />
              <span className="relative flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <CheckCheck className="size-3" />
              Tout marquer comme lu
            </button>
          )}
        </div>
        <Separator />
        <div className="max-h-80 overflow-y-auto">
          {recent.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">Aucune notification</p>
          ) : (
            recent.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => markAsRead(n.id)}
                className={cn(
                  'flex w-full flex-col gap-0.5 border-b px-3 py-2.5 text-left text-sm last:border-0 hover:bg-accent',
                  !n.read && 'bg-primary/5',
                )}
              >
                <span className="flex items-center gap-2 font-medium">
                  {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                  {n.title}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-2">{n.message}</span>
                <span className="text-[11px] text-muted-foreground">{formatRelative(n.createdAt)}</span>
              </button>
            ))
          )}
        </div>
        <Separator />
        <Link
          to={`${basePath}/notifications`}
          className="block px-3 py-2 text-center text-sm font-medium text-primary hover:bg-accent"
        >
          Voir toutes les notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
