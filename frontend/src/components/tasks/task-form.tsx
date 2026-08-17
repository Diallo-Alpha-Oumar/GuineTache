import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { taskSchema, type TaskFormValues } from '@/utils/validation'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/utils/constants'
import type { PublicUser, Task } from '@/types'

interface TaskFormProps {
  task?: Task | null
  assignableUsers?: PublicUser[]
  onSubmit: (values: TaskFormValues) => Promise<void> | void
  submitLabel?: string
}

export function TaskForm({ task, assignableUsers, onSubmit, submitLabel = 'Enregistrer' }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'TODO',
      priority: task?.priority ?? 'MEDIUM',
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : null,
      assignedToId: task?.assignedToId ?? null,
    },
  })

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({ ...values, dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null }),
      )}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input id="title" placeholder="Ex: Créer le rapport mensuel" {...register('title')} aria-invalid={!!errors.title} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} placeholder="Détaillez la tâche..." {...register('description')} aria-invalid={!!errors.description} />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Statut</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Priorité</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Date limite</Label>
          <Input id="dueDate" type="date" {...register('dueDate')} />
        </div>

        {assignableUsers && (
          <div className="space-y-2">
            <Label>Assigné à</Label>
            <Controller
              control={control}
              name="assignedToId"
              render={({ field }) => (
                <Select value={field.value ?? 'unassigned'} onValueChange={(v) => field.onChange(v === 'unassigned' ? null : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Non assignée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Non assignée</SelectItem>
                    {assignableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
