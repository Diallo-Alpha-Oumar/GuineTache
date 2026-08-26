// Petite couche d'abstraction autour de localStorage, préfixée pour éviter
// les collisions avec d'autres apps sur le même domaine.

const PREFIX = 'guinetache'

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${PREFIX}:${key}`)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value))
}

export function removeItem(key: string): void {
  localStorage.removeItem(`${PREFIX}:${key}`)
}

export const STORAGE_KEYS = {
  session: 'session',
  theme: 'theme',
} as const
