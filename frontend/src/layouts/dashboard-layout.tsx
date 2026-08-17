import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import type { NavItem } from '@/components/layout/nav-config'

interface DashboardLayoutProps {
  navItems: NavItem[]
  badge?: string
  basePath: string
  profilePath?: string
}

export function DashboardLayout({ navItems, badge, basePath, profilePath }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-svh overflow-hidden bg-muted/20">
      <Sidebar items={navItems} badge={badge} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} basePath={basePath} profilePath={profilePath} />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
