const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'

interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data?: T
  errors?: { field: string; message: string }[]
}

export class ApiRequestError extends Error {
  status: number
  fieldErrors: { field: string; message: string }[]

  constructor(message: string, status: number, fieldErrors: { field: string; message: string }[] = []) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

let refreshPromise: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include',
        })
        if (!res.ok) {
          accessToken = null
          return false
        }
        const body = (await res.json()) as ApiEnvelope<{ accessToken: string }>
        accessToken = body.data?.accessToken ?? null
        return accessToken !== null
      } catch {
        accessToken = null
        return false
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

async function request<T>(path: string, options: RequestInit = {}, allowRetry = true): Promise<ApiEnvelope<T>> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  let body: ApiEnvelope<T> | null = null
  try {
    body = (await res.json()) as ApiEnvelope<T>
  } catch {
    body = null
  }

  if (res.status === 401 && allowRetry && accessToken) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return request<T>(path, options, false)
    }
  }

  if (!res.ok) {
    throw new ApiRequestError(body?.message ?? 'Une erreur est survenue.', res.status, body?.errors ?? [])
  }

  return body ?? { success: true }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, payload?: unknown) =>
    request<T>(path, { method: 'POST', body: payload !== undefined ? JSON.stringify(payload) : undefined }),
  patch: <T>(path: string, payload?: unknown) =>
    request<T>(path, { method: 'PATCH', body: payload !== undefined ? JSON.stringify(payload) : undefined }),
  refreshAccessToken,
}
