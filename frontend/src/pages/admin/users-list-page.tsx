import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Search, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { usePagination } from '@/hooks/use-pagination'
import { userService } from '@/services/user.service'
import { taskService } from '@/services/task.service'
import type { PublicUser, UserRole } from '@/types'
import { formatDate } from '@/utils/date'

export function AdminUsersListPage() {
  const [users, setUsers] = useState<PublicUser[]>([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<UserRole | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [userToDelete, setUserToDelete] = useState<PublicUser | null>(null)

  function refresh() {
    setUsers(userService.getAll())
  }

  useEffect(refresh, [])

  const filtered = useMemo(() => {
    return userService.getAll({ search, role, status: statusFilter })
  }, [users, search, role, statusFilter])

  const { page, totalPages, setPage, paginated } = usePagination(filtered, 8)

  function handleToggleActive(user: PublicUser) {
    userService.toggleActive(user.id)
    toast.success(user.isActive ? 'Utilisateur désactivé' : 'Utilisateur activé')
    refresh()
  }

  function handleDelete() {
    if (!userToDelete) return
    userService.remove(userToDelete.id)
    toast.success('Utilisateur supprimé')
    setUserToDelete(null)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} utilisateur(s)</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher par nom ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole | 'ALL')}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les rôles</SelectItem>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="INACTIVE">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Users} title="Aucun utilisateur trouvé" description="Essayez de modifier vos filtres." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Tâches</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>{taskService.getAll({ assignedToId: user.id }).length}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Switch checked={user.isActive} onCheckedChange={() => handleToggleActive(user)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/users/${user.id}`} aria-label="Voir le profil">
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user)} aria-label="Supprimer">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Supprimer cet utilisateur ?"
        description={`Êtes-vous sûr de vouloir supprimer "${userToDelete?.fullName}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </div>
  )
}
