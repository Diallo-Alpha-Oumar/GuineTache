import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCircle2, Clock, ListChecks, ListTodo, PlusCircle, TimerReset } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/common/stat-card'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TaskActivityChart } from '@/components/dashboard/task-activity-chart'
import { TaskProgress } from '@/components/dashboard/task-progress'
import { RecentTasks } from '@/components/dashboard/recent-tasks'
import { RecentActivity, type ActivityItem } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { useAuth } from '@/hooks/use-auth'
import { taskService } from '@/services/task.service'
import { notificationService } from '@/services/notification.service'
import type { Task, TaskStats } from '@/types'

const NOTIFICATION_ICONS = {
  TASK_ASSIGNED: PlusCircle,
  TASK_UPDATED: TimerReset,
  TASK_COMPLETED: CheckCircle2,
  TASK_OVERDUE: Clock,
  SYSTEM: Bell,
} as const

function isWithinLastDays(iso: string, days: number) {
  const diff = Date.now() - new Date(iso).getTime()
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000
}

export function UserDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    if (!user) return
    taskService.getStats().then(setStats)
    taskService.getAll().then(setTasks)
    notificationService.getForUser().then((notifications) =>
      setActivity(
        notifications.slice(0, 5).map((n) => ({
          id: n.id,
          title: n.title,
          description: n.message,
          createdAt: n.createdAt,
          icon: NOTIFICATION_ICONS[n.type],
        })),
      ),
    )
  }, [user])

  const createdThisWeek = useMemo(() => tasks.filter((t) => isWithinLastDays(t.createdAt, 7)).length, [tasks])

  return (
    <div className="space-y-6">
      <DashboardHeader
        eyebrow="Dashboard"
        title={`Bonjour, ${user?.fullName.split(' ')[0] ?? ''} 👋`}
        subtitle="Voici un aperçu de votre activité."
        action={
          <Button asChild>
            <Link to="/user/tasks/new">
              <PlusCircle />
              Nouvelle tâche
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total des tâches"
          value={stats?.total ?? 0}
          icon={ListTodo}
          trend={createdThisWeek > 0 ? { label: `+${createdThisWeek} cette semaine` } : undefined}
        />
        <StatCard label="À faire" value={stats?.todo ?? 0} icon={Clock} tone="warning" />
        <StatCard label="En cours" value={stats?.inProgress ?? 0} icon={TimerReset} tone="default" />
        <StatCard label="Terminées" value={stats?.done ?? 0} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskActivityChart tasks={tasks} description="Vos tâches créées et terminées sur les 7 derniers jours." />
        </div>
        <TaskProgress stats={stats ?? { total: 0, todo: 0, inProgress: 0, cancelled: 0, done: 0, overdue: 0 }} />
      </div>

      <RecentTasks
        tasks={tasks.slice(0, 5)}
        viewAllHref="/user/tasks"
        newTaskHref="/user/tasks/new"
        getRowHref={(task) => `/user/tasks/${task.id}`}
        emptyDescription="Créez votre première tâche pour commencer."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity items={activity} />
        </div>
        <QuickActions
          actions={[
            { label: 'Créer une tâche', description: 'Ajouter une nouvelle tâche', href: '/user/tasks/new', icon: PlusCircle },
            { label: 'Mes tâches', description: 'Voir toutes vos tâches', href: '/user/tasks', icon: ListChecks },
            { label: 'Notifications', description: 'Consulter vos alertes', href: '/user/notifications', icon: Bell },
          ]}
        />
      </div>
    </div>
  )
}
