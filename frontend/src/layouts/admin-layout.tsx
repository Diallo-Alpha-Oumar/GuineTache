import { DashboardLayout } from './dashboard-layout'
import { ADMIN_NAV_ITEMS } from '@/components/layout/nav-config'

export function AdminLayout() {
  return <DashboardLayout navItems={ADMIN_NAV_ITEMS} badge="Admin" basePath="/admin" profilePath="/admin/settings" />
}
