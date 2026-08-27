import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskForm } from '@/components/tasks/task-form'
import { useAuth } from '@/hooks/use-auth'
import { taskService } from '@/services/task.service'
import { userService } from '@/services/user.service'
import type { PublicUser } from '@/types'
import type { TaskFormValues } from '@/utils/validation'

type AssignMode = 'self' | 'user'

export function AdminTaskNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<PublicUser[]>([])
  const [assignMode, setAssignMode] = useState<AssignMode>('self')

  useEffect(() => {
    userService.getAll({ role: 'USER' }).then(setUsers)
  }, [])

  async function handleSubmit(values: TaskFormValues) {
    if (!user) return
    const payload = assignMode === 'self' ? { ...values, assignedToId: user.id } : values
    const result = await taskService.create(payload, user.id)
    if (!result.success) {
      toast.error(result.message ?? 'Impossible de créer la tâche.')
      return
    }
    toast.success(assignMode === 'self' ? 'Tâche créée avec succès' : 'Tâche créée et affectée avec succès')
    navigate('/admin/tasks')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Créer une tâche</h1>
        <p className="text-sm text-muted-foreground">Créez une tâche pour vous-même ou affectez-la à un utilisateur</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la tâche</CardTitle>
          <CardDescription>
            {assignMode === 'self'
              ? 'Cette tâche vous sera automatiquement assignée'
              : "L'utilisateur assigné recevra une notification et un email simulé"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Tabs value={assignMode} onValueChange={(v) => setAssignMode(v as AssignMode)}>
            <TabsList>
              <TabsTrigger value="self">Moi-même</TabsTrigger>
              <TabsTrigger value="user">Attribuer à un utilisateur</TabsTrigger>
            </TabsList>
          </Tabs>

          {assignMode === 'self' ? (
            <TaskForm onSubmit={handleSubmit} submitLabel="Créer la tâche" />
          ) : (
            <TaskForm assignableUsers={users} onSubmit={handleSubmit} submitLabel="Créer et affecter" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
