import {
  Bell,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Settings,
  Users,
} from 'lucide-react'
import type { ComponentType } from 'react'

export interface NavItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

export const USER_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/user/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Mes tâches', to: '/user/tasks', icon: ListChecks, end: true },
  { label: 'Créer une tâche', to: '/user/tasks/new', icon: PlusCircle },
  { label: 'Notifications', to: '/user/notifications', icon: Bell },
  { label: 'Paramètres', to: '/user/profile', icon: Settings },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Utilisateurs', to: '/admin/users', icon: Users },
  { label: 'Tâches', to: '/admin/tasks', icon: ListChecks, end: true },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
]
