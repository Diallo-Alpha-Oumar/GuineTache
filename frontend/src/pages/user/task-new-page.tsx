import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskForm } from '@/components/tasks/task-form'
import { useAuth } from '@/hooks/use-auth'
import { taskService } from '@/services/task.service'
import type { TaskFormValues } from '@/utils/validation'

export function UserTaskNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(values: TaskFormValues) {
    if (!user) return
    const result = await taskService.create({ ...values, assignedToId: user.id }, user.id)
    if (!result.success) {
      toast.error(result.message ?? 'Impossible de créer la tâche.')
      return
    }
    toast.success('Tâche créée avec succès')
    navigate('/user/tasks')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Créer une tâche</h1>
        <p className="text-sm text-muted-foreground">Ajoutez une nouvelle tâche à votre liste</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la tâche</CardTitle>
          <CardDescription>Cette tâche vous sera automatiquement assignée</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm onSubmit={handleSubmit} submitLabel="Créer la tâche" />
        </CardContent>
      </Card>
    </div>
  )
}
