import { useNavigate } from 'react-router-dom'
import { LogOut, Menu, Settings, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { useAuth } from '@/hooks/use-auth'

interface HeaderProps {
  onMenuClick: () => void
  basePath: string
  profilePath?: string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Header({ onMenuClick, basePath, profilePath }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="size-4" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell basePath={basePath} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{user ? getInitials(user.fullName) : '??'}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{user?.fullName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {profilePath && (
              <DropdownMenuItem onClick={() => navigate(profilePath)}>
                <UserRound />
                Mon profil
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate(profilePath ?? basePath)}>
              <Settings />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
