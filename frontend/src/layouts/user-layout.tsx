import { DashboardLayout } from './dashboard-layout'
import { USER_NAV_ITEMS } from '@/components/layout/nav-config'

export function UserLayout() {
  return <DashboardLayout navItems={USER_NAV_ITEMS} basePath="/user" profilePath="/user/profile" />
}
