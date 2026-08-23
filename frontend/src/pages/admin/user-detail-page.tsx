import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { StatusBadge } from '@/components/tasks/status-badge'
import { userService } from '@/services/user.service'
import { taskService } from '@/services/task.service'
import type { PublicUser, Task, UserRole } from '@/types'
import { profileSchema, type ProfileFormValues } from '@/utils/validation'
import { formatDate } from '@/utils/date'

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<PublicUser | null | undefined>(undefined)
  const [tasks, setTasks] = useState<Task[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) })

  function refresh() {
    if (!id) return
    userService.getById(id).then((found) => {
      setUser(found)
      if (found) {
        reset({ fullName: found.fullName, email: found.email })
        taskService.getAll({ assignedToId: found.id }).then(setTasks)
      }
    })
  }

  useEffect(refresh, [id])

  if (user === undefined) return null

  if (!user) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Cet utilisateur n'existe pas.</p>
        <Button asChild variant="outline">
          <Link to="/admin/users">Retour à la liste</Link>
        </Button>
      </div>
    )
  }

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return
    const result = await userService.update(user.id, values)
    if (result.success) {
      toast.success('Utilisateur mis à jour')
      refresh()
    } else {
      toast.error(result.message ?? "Impossible de mettre à jour l'utilisateur.")
    }
  }

  async function handleRoleChange(role: UserRole) {
    if (!user) return
    const result = await userService.update(user.id, { role })
    if (result.success) {
      toast.success('Rôle mis à jour')
      refresh()
    } else {
      toast.error(result.message ?? 'Impossible de mettre à jour le rôle.')
    }
  }

  async function handleToggleActive() {
    if (!user) return
    const result = await userService.toggleActive(user.id)
    if (result.success) {
      toast.success(user.isActive ? 'Utilisateur désactivé' : 'Utilisateur activé')
      refresh()
    } else {
      toast.error(result.message ?? 'Impossible de modifier le statut.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate('/admin/users')}>
        <ArrowLeft className="size-4" />
        Retour
      </Button>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg">{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{user.fullName}</p>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">Inscrit le {formatDate(user.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="active-switch" className="text-sm">
              {user.isActive ? 'Actif' : 'Inactif'}
            </Label>
            <Switch id="active-switch" checked={user.isActive} onCheckedChange={handleToggleActive} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modifier les informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input id="fullName" {...register('fullName')} aria-invalid={!!errors.fullName} />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={user.role} onValueChange={(v) => handleRoleChange(v as UserRole)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tâches assignées ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune tâche assignée à cet utilisateur.</p>
          ) : (
            <ul className="divide-y">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{task.title}</span>
                  <StatusBadge status={task.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
