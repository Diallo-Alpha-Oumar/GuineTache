import { eachDayOfInterval, format, isSameDay, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task } from '@/types'

const CREATED_COLOR = '#f97316'
const COMPLETED_COLOR = '#16a34a'

interface TaskActivityChartProps {
  tasks: Task[]
  title?: string
  description?: string
}

export function TaskActivityChart({ tasks, title = 'Activité des tâches', description }: TaskActivityChartProps) {
  const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
  const data = days.map((day) => ({
    label: format(day, 'EEE', { locale: fr }),
    Créées: tasks.filter((t) => isSameDay(new Date(t.createdAt), day)).length,
    Terminées: tasks.filter((t) => t.status === 'DONE' && isSameDay(new Date(t.updatedAt), day)).length,
  }))

  return (
    <Card className="h-full hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 8 }}>
            <defs>
              <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CREATED_COLOR} stopOpacity={0.35} />
                <stop offset="95%" stopColor={CREATED_COLOR} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COMPLETED_COLOR} stopOpacity={0.35} />
                <stop offset="95%" stopColor={COMPLETED_COLOR} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8888881f" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={28} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #8888883f' }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="Créées"
              stroke={CREATED_COLOR}
              strokeWidth={2}
              fill="url(#fillCreated)"
              animationDuration={900}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="Terminées"
              stroke={COMPLETED_COLOR}
              strokeWidth={2}
              fill="url(#fillCompleted)"
              animationDuration={900}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
