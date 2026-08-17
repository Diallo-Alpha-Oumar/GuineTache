import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ListChecks,
  ListTodo,
  PlusCircle,
  TimerReset,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/common/stat-card'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TaskActivityChart } from '@/components/dashboard/task-activity-chart'
import { TaskProgress } from '@/components/dashboard/task-progress'
import { RecentTasks } from '@/components/dashboard/recent-tasks'
import { RecentActivity, type ActivityItem } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { statsService } from '@/services/stats.service'
import { taskService } from '@/services/task.service'
import { userService } from '@/services/user.service'
import type { AdminStats, PublicUser, Task } from '@/types'
import { TASK_STATUS_LABELS } from '@/utils/constants'

// Couleurs littérales alignées sur le thème orange/blanc. Les fonctions
// CSS oklch() référencées via var() ne sont pas fiables comme attribut `fill`
// SVG dans tous les moteurs de rendu, d'où l'usage de valeurs hex directes.
const BRAND_ORANGE = '#f97316'
const BRAND_GREEN = '#16a34a'
const CHART_COLORS = ['#94a3b8', BRAND_ORANGE, BRAND_GREEN]

const STATUS_ACTIVITY_ICON = {
  TODO: ListTodo,
  IN_PROGRESS: TimerReset,
  DONE: CheckCircle2,
} as const

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<PublicUser[]>([])

  useEffect(() => {
    setStats(statsService.getAdminStats())
    setTasks(taskService.getAll())
    setUsers(userService.getAll({ role: 'USER' }))
  }, [])

  const assigneeName = useMemo(() => {
    return (assignedToId: string | null) => {
      if (!assignedToId) return 'Non assignée'
      return users.find((u) => u.id === assignedToId)?.fullName ?? 'Utilisateur inconnu'
    }
  }, [users])

  const activity: ActivityItem[] = useMemo(
    () =>
      tasks.slice(0, 5).map((task) => ({
        id: task.id,
        title: task.title,
        description: `${TASK_STATUS_LABELS[task.status]} · ${assigneeName(task.assignedToId)}`,
        createdAt: task.updatedAt,
        icon: STATUS_ACTIVITY_ICON[task.status],
      })),
    [tasks, assigneeName],
  )

  if (!stats) return null

  const statusData = [
    { name: TASK_STATUS_LABELS.TODO, value: stats.todo, fill: CHART_COLORS[0] },
    { name: TASK_STATUS_LABELS.IN_PROGRESS, value: stats.inProgress, fill: CHART_COLORS[1] },
    { name: TASK_STATUS_LABELS.DONE, value: stats.done, fill: CHART_COLORS[2] },
  ]

  return (
    <div className="space-y-6">
      <DashboardHeader
        eyebrow="Dashboard"
        title="Tableau de bord administrateur"
        subtitle="Vue d'ensemble de l'activité de la plateforme"
        action={
          <Button asChild>
            <Link to="/admin/tasks/new">
              <PlusCircle />
              Nouvelle tâche
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={stats.totalUsers} icon={Users} />
        <StatCard label="Total des tâches" value={stats.total} icon={ListTodo} />
        <StatCard label="Tâches en cours" value={stats.inProgress} icon={TimerReset} />
        <StatCard label="Tâches en retard" value={stats.overdue} icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskActivityChart tasks={tasks} description="Toutes les tâches créées et terminées sur les 7 derniers jours." />
        </div>
        <TaskProgress stats={stats} title="Progression de la plateforme" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="hover:shadow-md">
          <CardHeader>
            <CardTitle>Répartition des tâches par statut</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  animationDuration={800}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              {statusData.map((entry, index) => (
                <span
                  key={entry.name}
                  className="flex items-center gap-1.5 rounded-full px-1.5 py-0.5 transition-colors hover:bg-accent"
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }} />
                  {entry.name} ({entry.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md">
          <CardHeader>
            <CardTitle>Tâches par utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.tasksPerUser}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="userName" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(249, 115, 22, 0.08)' }} />
                <Bar
                  dataKey="count"
                  name="Tâches"
                  fill={BRAND_ORANGE}
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Utilisateurs actifs" value={stats.activeUsers} icon={Users} tone="success" />
        <StatCard label="Tâches terminées" value={stats.done} icon={CheckCircle2} tone="success" />
        <StatCard label="Tâches à faire" value={stats.todo} icon={ListTodo} tone="warning" />
      </div>

      <RecentTasks
        tasks={tasks.slice(0, 6)}
        title="Tâches récentes"
        viewAllHref="/admin/tasks"
        newTaskHref="/admin/tasks/new"
        getAssigneeName={assigneeName}
        emptyDescription="Aucune tâche n'a encore été créée sur la plateforme."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity items={activity} title="Activité récente des tâches" />
        </div>
        <QuickActions
          actions={[
            { label: 'Créer une tâche', description: 'Assigner une tâche à un utilisateur', href: '/admin/tasks/new', icon: PlusCircle },
            { label: 'Gérer les tâches', description: 'Voir toutes les tâches', href: '/admin/tasks', icon: ListChecks },
            { label: 'Utilisateurs', description: 'Gérer les comptes', href: '/admin/users', icon: Users },
            { label: 'Notifications', description: 'Consulter les alertes', href: '/admin/notifications', icon: Bell },
          ]}
        />
      </div>
    </div>
  )
}
