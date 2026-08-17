import { db } from '@/data/db'
import type { PublicUser, User, UserRole } from '@/types'

function toPublicUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user
  return publicUser
}

export interface UserFilters {
  search?: string
  role?: UserRole | 'ALL'
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE'
}

export const userService = {
  getAll(filters: UserFilters = {}): PublicUser[] {
    let users = db.getUsers()

    if (filters.search) {
      const term = filters.search.toLowerCase()
      users = users.filter(
        (u) => u.fullName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
      )
    }
    if (filters.role && filters.role !== 'ALL') {
      users = users.filter((u) => u.role === filters.role)
    }
    if (filters.status && filters.status !== 'ALL') {
      users = users.filter((u) => (filters.status === 'ACTIVE' ? u.isActive : !u.isActive))
    }

    return users.map(toPublicUser)
  },

  getById(id: string): PublicUser | null {
    const user = db.getUsers().find((u) => u.id === id)
    return user ? toPublicUser(user) : null
  },

  update(id: string, changes: Partial<Pick<User, 'fullName' | 'email' | 'role'>>): PublicUser | null {
    const users = db.getUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) return null

    const updated: User = { ...users[index], ...changes, updatedAt: new Date().toISOString() }
    users[index] = updated
    db.saveUsers(users)
    return toPublicUser(updated)
  },

  toggleActive(id: string): PublicUser | null {
    const users = db.getUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) return null

    users[index] = { ...users[index], isActive: !users[index].isActive, updatedAt: new Date().toISOString() }
    db.saveUsers(users)
    return toPublicUser(users[index])
  },

  remove(id: string): void {
    db.saveUsers(db.getUsers().filter((u) => u.id !== id))
  },
}
