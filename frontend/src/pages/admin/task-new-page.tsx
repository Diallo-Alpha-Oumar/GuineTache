import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskForm } from '@/components/tasks/task-form'
import { useAuth } from '@/hooks/use-auth'
import { taskService } from '@/services/task.service'
import { userService } from '@/services/user.service'
import type { PublicUser } from '@/types'
import type { TaskFormValues } from '@/utils/validation'

export function AdminTaskNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<PublicUser[]>([])

  useEffect(() => {
    userService.getAll({ role: 'USER' }).then(setUsers)
  }, [])

  async function handleSubmit(values: TaskFormValues) {
    if (!user) return
    const result = await taskService.create(values, user.id)
    if (!result.success) {
      toast.error(result.message ?? 'Impossible de créer la tâche.')
      return
    }
    toast.success('Tâche créée et affectée avec succès')
    navigate('/admin/tasks')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Créer une tâche</h1>
        <p className="text-sm text-muted-foreground">Créez une tâche et affectez-la à un utilisateur</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la tâche</CardTitle>
          <CardDescription>L'utilisateur assigné recevra une notification et un email simulé</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm assignableUsers={users} onSubmit={handleSubmit} submitLabel="Créer et affecter" />
        </CardContent>
      </Card>
    </div>
  )
}
