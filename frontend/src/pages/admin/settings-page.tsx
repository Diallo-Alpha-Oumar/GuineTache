import { useEffect, useState } from 'react'
import { AlertTriangle, Bell, Loader2, Save, ShieldAlert, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { adminService } from '@/services/admin.service'
import type { AppNotificationSettings, AppSettings } from '@/types'

const NOTIFICATION_LABELS: Record<keyof AppNotificationSettings, { label: string; description: string }> = {
  taskAssigned: {
    label: 'Tâche assignée',
    description: "Notifier l'utilisateur lorsqu'une tâche lui est assignée",
  },
  taskUpdated: {
    label: 'Tâche modifiée',
    description: 'Notifier les utilisateurs concernés lors de la mise à jour d’une tâche',
  },
  taskCompleted: {
    label: 'Tâche terminée',
    description: 'Notifier lorsqu’une tâche est marquée comme terminée',
  },
  taskOverdue: {
    label: 'Tâche en retard',
    description: 'Notifier lorsqu’une tâche dépasse sa date d’échéance',
  },
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    adminService.getSettings().then((data) => {
      if (cancelled) return
      if (!data) {
        toast.error('Impossible de charger les paramètres de l’application.')
      }
      setSettings(data)
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function persist(changes: Partial<AppSettings>) {
    if (!settings) return
    const previous = settings
    const next = { ...settings, ...changes }
    setSettings(next)
    setIsSaving(true)
    const result = await adminService.updateSettings(changes)
    setIsSaving(false)

    if (result.success && result.data) {
      setSettings(result.data)
      toast.success(result.message ?? 'Paramètres mis à jour')
    } else {
      setSettings(previous)
      toast.error(result.message ?? 'Impossible de mettre à jour les paramètres.')
    }
  }

  function toggleNotification(key: keyof AppNotificationSettings, value: boolean) {
    if (!settings) return
    persist({ notifications: { ...settings.notifications, [key]: value } })
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-muted-foreground">
          Impossible de charger les paramètres de l’application. Réessayez plus tard.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Paramètres de l'application</h1>
        <p className="text-sm text-muted-foreground">
          Contrôlez l'accès, la maintenance et les notifications pour l'ensemble des utilisateurs
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-muted-foreground" />
            <CardTitle>Inscriptions</CardTitle>
          </div>
          <CardDescription>Autoriser ou bloquer la création de nouveaux comptes utilisateurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Inscriptions ouvertes</p>
              <p className="text-xs text-muted-foreground">
                {settings.registrationOpen
                  ? 'Les nouveaux utilisateurs peuvent créer un compte.'
                  : 'La création de compte est désactivée pour tous les visiteurs.'}
              </p>
            </div>
            <Switch
              checked={settings.registrationOpen}
              disabled={isSaving}
              onCheckedChange={(checked) => persist({ registrationOpen: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-muted-foreground" />
            <CardTitle>Mode maintenance</CardTitle>
          </div>
          <CardDescription>
            Bloque l'accès aux tâches et notifications pour les utilisateurs non-administrateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Activer le mode maintenance</p>
              <p className="text-xs text-muted-foreground">
                Les administrateurs conservent un accès complet à l'application.
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              disabled={isSaving}
              onCheckedChange={(checked) => persist({ maintenanceMode: checked })}
            />
          </div>

          {settings.maintenanceMode && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>Le mode maintenance est actif. Les utilisateurs ne peuvent plus accéder à leurs tâches.</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="maintenanceMessage">Message affiché aux utilisateurs</Label>
            <Textarea
              id="maintenanceMessage"
              rows={3}
              maxLength={300}
              value={settings.maintenanceMessage}
              onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
              onBlur={() => persist({ maintenanceMessage: settings.maintenanceMessage })}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-muted-foreground" />
            <CardTitle>Notifications système</CardTitle>
          </div>
          <CardDescription>Activez ou désactivez les types de notifications envoyées aux utilisateurs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Object.keys(NOTIFICATION_LABELS) as (keyof AppNotificationSettings)[]).map((key) => (
            <div key={key} className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">{NOTIFICATION_LABELS[key].label}</p>
                <p className="text-xs text-muted-foreground">{NOTIFICATION_LABELS[key].description}</p>
              </div>
              <Switch
                checked={settings.notifications[key]}
                disabled={isSaving}
                onCheckedChange={(checked) => toggleNotification(key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        {isSaving ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="size-3.5" />
            Les modifications sont enregistrées automatiquement
          </>
        )}
      </div>
    </div>
  )
}
