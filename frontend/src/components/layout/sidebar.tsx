import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from './nav-config'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Logo } from './logo'
import { useAuth } from '@/hooks/use-auth'

interface SidebarProps {
  items: NavItem[]
  badge?: string
  open: boolean
  onClose: () => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Sidebar({ items, badge, open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            {badge && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {badge}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {user && (
          <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-3">
            <Avatar className="size-9">
              <AvatarFallback className="text-xs">{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/80 hover:translate-x-0.5 hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <item.icon className="size-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-all duration-150 hover:translate-x-0.5 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
