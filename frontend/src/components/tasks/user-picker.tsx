import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, Search, UserRound } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PublicUser } from '@/types'

interface UserPickerProps {
  users: PublicUser[]
  value: string | null
  onChange: (userId: string | null) => void
  placeholder?: string
}

export function UserPicker({ users, value, onChange, placeholder = 'Non assignée' }: UserPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = users.find((u) => u.id === value) ?? null

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (u) => u.fullName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
    )
  }, [users, query])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 truncate">
            <UserRound className="size-4 shrink-0 text-muted-foreground" />
            {selected ? (
              <span className="truncate">
                {selected.fullName} <span className="text-muted-foreground">({selected.email})</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Rechercher par nom ou e-mail..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          <button
            type="button"
            className={cn(
              'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
              value === null && 'bg-accent',
            )}
            onClick={() => {
              onChange(null)
              setOpen(false)
              setQuery('')
            }}
          >
            Non assignée
            {value === null && <Check className="size-4" />}
          </button>

          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">Aucun utilisateur trouvé.</p>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                className={cn(
                  'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                  value === u.id && 'bg-accent',
                )}
                onClick={() => {
                  onChange(u.id)
                  setOpen(false)
                  setQuery('')
                }}
              >
                <span className="truncate">
                  {u.fullName} <span className="text-muted-foreground">({u.email})</span>
                </span>
                {value === u.id && <Check className="size-4 shrink-0" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
