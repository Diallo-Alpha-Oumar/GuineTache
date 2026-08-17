import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { useAuth } from '@/hooks/use-auth'
import { useNotifications } from '@/hooks/use-notifications'
import { formatRelative } from '@/utils/date'
import { NOTIFICATION_TYPE_LABELS } from '@/utils/constants'
import { cn } from '@/lib/utils'

export function NotificationsPage() {
  const { user } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, remove } = useNotifications(user?.id)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Tout est à jour'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Aucune notification" description="Vous serez notifié ici des mises à jour importantes." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={cn(!n.read && 'border-primary/40 bg-primary/5')}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="size-1.5 rounded-full bg-primary" />}
                    <p className="font-medium">{n.title}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {NOTIFICATION_TYPE_LABELS[n.type]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(n.createdAt)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!n.read && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
                      Marquer comme lu
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => remove(n.id)} aria-label="Supprimer">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
